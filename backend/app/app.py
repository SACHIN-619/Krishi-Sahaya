"""
KrishiSahay Backend API v3.1
All API calls use direct REST HTTP — no gRPC, no SDK proxy issues.
Keys read from .env and passed directly to each module.
"""

import os
import sys
import random
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# ── path setup ─────────────────────────────────────────────────────────────────
SRC = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(SRC))

import vision_engine
import market_intelligence
import rag_agent
import notifier as notifier_mod
import data_engineering
import vector_store

load_dotenv()

# ── Read ALL keys from .env ────────────────────────────────────────────────────
GEMINI_KEY   = os.getenv("GEMINI_API_KEY") or os.getenv("Gemini_api_key", "")
OWM_KEY      = os.getenv("OPENWEATHER_API_KEY", "")
PLANT_KEY    = os.getenv("Plant_Health_API", "")
HF_KEY       = os.getenv("Hugging_face_api") or os.getenv("HUGGINGFACE_API_KEY", "")
TWILIO_SID   = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WA    = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
SUPA_URL     = os.getenv("SUPABASE_URL") or os.getenv("UPBASE_URL", "")
SUPA_ANON    = os.getenv("SUPABASE_ANON_KEY", "")

# ── Startup log ────────────────────────────────────────────────────────────────
print("\n" + "="*50)
print("KrishiSahay Backend v3.1 — API Key Status")
print("="*50)
print(f"  Gemini:       {'✅ ' + GEMINI_KEY[:12] + '...' if GEMINI_KEY else '❌ NOT SET'}")
print(f"  OpenWeather:  {'✅ ' + OWM_KEY[:8] + '...' if OWM_KEY else '❌ NOT SET'}")
print(f"  Plant.id:     {'✅ ' + PLANT_KEY[:10] + '...' if PLANT_KEY else '❌ NOT SET'}")
print(f"  HuggingFace:  {'✅ ' + HF_KEY[:8] + '...' if HF_KEY else '❌ NOT SET'}")
print(f"  Twilio:       {'✅ ' + TWILIO_SID[:12] + '...' if TWILIO_SID else '❌ NOT SET'}")
print(f"  Supabase:     {'✅ configured' if SUPA_URL else '❌ NOT SET'}")
print("="*50 + "\n")

# ── Init services ──────────────────────────────────────────────────────────────
notifier_mod.init_notifier(TWILIO_SID, TWILIO_TOKEN, TWILIO_WA)
data_engineering.ensure_csv_exists()
vector_store.get_store()  # pre-build index

# ── FastAPI ────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="KrishiSahay Agricultural API",
    version="3.1.0",
    description="AI-powered agricultural intelligence for Indian farmers",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ─────────────────────────────────────────────────────────────────────
class AIQuery(BaseModel):
    question: str
    language: str = "en"
    crop: Optional[str] = None
    location: Optional[str] = None

class AlertRequest(BaseModel):
    phone: str
    commodity: str
    threshold_pct: float = 15.0

# ── City coordinates ───────────────────────────────────────────────────────────
CITY_COORDS = {
    "hyderabad": (17.3850, 78.4867), "delhi": (28.6139, 77.2090),
    "mumbai": (19.0760, 72.8777),    "bangalore": (12.9716, 77.5946),
    "bengaluru": (12.9716, 77.5946), "chennai": (13.0827, 80.2707),
    "pune": (18.5204, 73.8567),      "kolkata": (22.5726, 88.3639),
    "lucknow": (26.8467, 80.9462),   "jaipur": (26.9124, 75.7873),
    "patna": (25.5941, 85.1376),     "bhopal": (23.2599, 77.4126),
    "nagpur": (21.1458, 79.0882),    "nizamabad": (18.6725, 78.0941),
    "guntur": (16.3008, 80.4428),    "rajkot": (22.3039, 70.8022),
    "indore": (22.7196, 75.8577),    "agra": (27.1767, 78.0081),
    "visakhapatnam": (17.6868, 83.2185), "warangal": (17.9689, 79.5941),
    "kadapa": (14.4673, 78.8242),    "kurnool": (15.8281, 78.0373),
    "nellore": (14.4426, 79.9865),   "tirupati": (13.6288, 79.4192),
}

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "name": "KrishiSahay Agricultural API",
        "version": "3.1.0",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    prices = market_intelligence.get_prices()
    return {
        "status": "ok",
        "version": "3.1.0",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "gemini":      "configured" if GEMINI_KEY else "not_configured",
            "openweather": "configured" if OWM_KEY else "not_configured",
            "plant_id":    "configured" if PLANT_KEY else "not_configured",
            "huggingface": "configured" if HF_KEY else "not_configured",
            "twilio":      "configured" if TWILIO_SID else "not_configured",
            "supabase":    "configured" if SUPA_URL else "not_configured",
            "market_data": prices[0]["source"] if prices else "unavailable",
            "vector_store": "active",
            "csv_records": "13140",
        },
    }


# ── Weather ────────────────────────────────────────────────────────────────────

@app.get("/api/weather")
def get_weather(location: str = "Hyderabad"):
    """Real weather via OpenWeatherMap REST API."""
    key = location.lower().strip()
    lat, lon = CITY_COORDS.get(key, CITY_COORDS["hyderabad"])

    # Try OpenWeatherMap
    if OWM_KEY and len(OWM_KEY) >= 32:
        try:
            url = (
                f"https://api.openweathermap.org/data/2.5/weather"
                f"?lat={lat}&lon={lon}&appid={OWM_KEY}&units=metric"
            )
            r = requests.get(url, timeout=8)

            if r.status_code == 200:
                d = r.json()
                clouds = d.get("clouds", {}).get("all", 0)
                rain_mm = d.get("rain", {}).get("1h", 0)
                rain_prob = round(min(100, clouds * 0.6 + rain_mm * 30))
                return {
                    "temperature": round(d["main"]["temp"], 1),
                    "humidity": d["main"]["humidity"],
                    "rainProbability": rain_prob,
                    "condition": d["weather"][0]["main"],
                    "description": d["weather"][0]["description"].title(),
                    "location": d.get("name", location),
                    "windSpeed": round(d["wind"]["speed"] * 3.6, 1),
                    "feelsLike": round(d["main"]["feels_like"], 1),
                    "pressure": d["main"].get("pressure", 1013),
                    "visibility": round(d.get("visibility", 10000) / 1000, 1),
                    "lastUpdated": datetime.now().isoformat(),
                    "source": "openweathermap",
                    "error": None,
                }
            elif r.status_code == 401:
                print(f"[weather] OWM 401: Invalid API key")
            elif r.status_code == 429:
                print(f"[weather] OWM 429: Rate limit")
            else:
                print(f"[weather] OWM {r.status_code}")

        except requests.exceptions.Timeout:
            print("[weather] OWM timeout")
        except requests.exceptions.ConnectionError as e:
            print(f"[weather] OWM connection error: {e}")
        except Exception as e:
            print(f"[weather] OWM error: {e}")

    # Fallback mock
    t = round(22 + random.random() * 16, 1)
    return {
        "temperature": t,
        "humidity": 50 + random.randint(-5, 25),
        "rainProbability": random.randint(5, 65),
        "condition": random.choice(["Sunny", "Partly Cloudy", "Cloudy", "Clear"]),
        "description": "Data from offline model",
        "location": location.title(),
        "windSpeed": round(8 + random.random() * 14, 1),
        "feelsLike": round(t - 1 + random.random() * 3, 1),
        "pressure": 1010,
        "visibility": 10.0,
        "lastUpdated": datetime.now().isoformat(),
        "source": "mock",
        "error": "OpenWeatherMap unavailable — showing estimated data",
    }


# ── Market Prices ──────────────────────────────────────────────────────────────

@app.get("/api/market/prices")
def get_prices():
    """
    Live mandi prices via Agmarknet (data.gov.in).
    Falls back to 13,140-row CSV then mock.
    """
    prices = market_intelligence.get_prices()
    return prices


@app.get("/api/market/summary")
def get_market_summary():
    prices = market_intelligence.get_prices()
    return market_intelligence.get_price_summary(prices)


@app.get("/api/market/schemes")
def get_schemes():
    return [
        {"id": "pm-kisan",    "name": "PM-KISAN",              "description": "Direct income support ₹6,000/year to farmer families in 3 installments.",          "eligibility": "All farmers with cultivable land. Excludes govt employees and income tax payers.", "benefit": "₹6,000/year (₹2,000 × 3 installments)", "website": "https://pmkisan.gov.in",            "applyUrl": "https://pmkisan.gov.in",            "category": "Income Support"},
        {"id": "pmfby",       "name": "PM Fasal Bima Yojana",  "description": "Comprehensive crop insurance covering pre-sowing to post-harvest losses.",           "eligibility": "All farmers including sharecroppers and tenant farmers",                           "benefit": "Up to 100% crop loss. Premium: 1.5–5% only", "website": "https://pmfby.gov.in",          "applyUrl": "https://pmfby.gov.in",          "category": "Crop Insurance"},
        {"id": "kcc",         "name": "Kisan Credit Card",      "description": "Short-term credit at 4% interest for crop cultivation and allied activities.",       "eligibility": "All farmers, tenant farmers, oral lessees and SHGs",                               "benefit": "Up to ₹3 lakh at 4% p.a.",               "website": "https://www.nabard.org/kcc",         "applyUrl": "https://www.nabard.org/kcc",         "category": "Credit"},
        {"id": "soil-health", "name": "Soil Health Card",       "description": "Free soil testing every 2 years with crop-wise nutrient recommendations.",           "eligibility": "All farmers across India",                                                         "benefit": "Free soil analysis + fertilizer guide", "website": "https://soilhealth.dac.gov.in",      "applyUrl": "https://soilhealth.dac.gov.in",      "category": "Soil & Input"},
        {"id": "msp",         "name": "Minimum Support Price",  "description": "Guaranteed floor prices for 23 major crops announced before sowing season.",         "eligibility": "All farmers growing notified MSP crops",                                           "benefit": "Wheat ₹2,275/q | Rice ₹2,183/q | Cotton ₹6,620/q (2024-25)", "website": "https://cacp.dacnet.nic.in", "applyUrl": "https://enam.gov.in", "category": "Price Support"},
        {"id": "pmksy",       "name": "PM Krishi Sinchai",      "description": "Har Khet Ko Pani — subsidized drip and sprinkler irrigation systems.",               "eligibility": "All farmers; priority to drought-prone regions",                                   "benefit": "Up to 55% subsidy on drip/sprinkler",    "website": "https://pmksy.gov.in",               "applyUrl": "https://pmksy.gov.in",               "category": "Irrigation"},
        {"id": "enam",        "name": "e-NAM National Market",  "description": "Online trading at 1000+ APMCs for transparent price discovery and better returns.",  "eligibility": "All farmers with produce to sell",                                                 "benefit": "Pan-India buyers. Better price realization.", "website": "https://enam.gov.in",            "applyUrl": "https://enam.gov.in",            "category": "Market Access"},
        {"id": "pkvy",        "name": "Paramparagat Krishi",    "description": "Organic farming promotion with PGS certification and marketing support for groups.",  "eligibility": "Groups of 50+ farmers interested in organic farming",                              "benefit": "₹50,000/ha over 3 years for organic conversion", "website": "https://pgsindia-ncof.gov.in", "applyUrl": "https://pgsindia-ncof.gov.in", "category": "Organic Farming"},
    ]


# ── Disease Detection ──────────────────────────────────────────────────────────

@app.post("/api/disease/detect")
async def detect_disease(file: UploadFile = File(...)):
    """
    AI plant disease detection.
    1. Gemini Vision (GEMINI_API_KEY) via REST
    2. Plant.id (Plant_Health_API)
    3. Offline KB (diseases_kb.json) — always works
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file (JPG, PNG, or WebP)."
        )

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Maximum size is 15MB.")

    result = vision_engine.detect_disease(
        image_bytes=contents,
        gemini_api_key=GEMINI_KEY,
        plant_id_key=PLANT_KEY,
    )
    result["timestamp"] = datetime.now().isoformat()
    return JSONResponse(content=result)


# ── AI Advisory ────────────────────────────────────────────────────────────────

@app.post("/api/ai/advice")
def get_advice(query: AIQuery):
    """
    AI agricultural advisory.
    1. Gemini (GEMINI_API_KEY) via REST HTTP — primary
    2. HuggingFace Mistral-7B (Hugging_face_api) — secondary fallback
    3. Local KB — always works offline
    """
    question = (query.question or "").strip()
    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter your question about farming, crops, or diseases."
        )
    if len(question) > 1000:
        raise HTTPException(
            status_code=400,
            detail="Question too long. Please keep it under 1000 characters."
        )

    result = rag_agent.get_advice(
        question=question,
        language=query.language or "en",
        crop=query.crop or "",
        location=query.location or "",
        gemini_api_key=GEMINI_KEY,
        hf_api_key=HF_KEY,
    )
    result["timestamp"] = datetime.now().isoformat()
    return result


# ── KB Search ──────────────────────────────────────────────────────────────────

@app.get("/api/kb/search")
def search_kb(q: str, top_k: int = 3):
    """Offline semantic search over diseases_kb.json."""
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query required.")
    results = vector_store.search_kb(q.strip(), top_k=min(top_k, 5))
    return {"query": q, "results": results, "count": len(results)}


# ── WhatsApp Alerts ────────────────────────────────────────────────────────────

@app.post("/api/notify/price-alert")
def send_price_alert(req: AlertRequest):
    """
    Send WhatsApp price alert via Twilio when commodity crosses threshold.
    Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER in .env.
    """
    if not TWILIO_SID or not TWILIO_TOKEN:
        raise HTTPException(
            status_code=503,
            detail="WhatsApp alerts not configured. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env"
        )

    prices = market_intelligence.get_prices()
    match = next(
        (p for p in prices if p["commodity"].lower() == req.commodity.lower()),
        None
    )
    if not match:
        raise HTTPException(
            status_code=404,
            detail=f"Commodity '{req.commodity}' not found. Available: {[p['commodity'] for p in prices[:5]]}"
        )

    alerts = notifier_mod.check_price_alerts([match], req.threshold_pct)
    if not alerts:
        return {
            "sent": False,
            "reason": f"{req.commodity} price change ({match['deltaPercent']:+.1f}%) is within your {req.threshold_pct}% threshold.",
            "currentPrice": match["currentPrice"],
            "signal": match["signal"],
        }

    msg = notifier_mod.build_price_alert(
        match["commodity"], match["currentPrice"], match["avgPrice"], match["signal"]
    )
    n = notifier_mod.get_notifier()
    result = n.send(req.phone, msg) if n else {"status": "error", "reason": "Notifier not initialized"}
    return {
        "sent": result.get("status") == "sent",
        "result": result,
        "message_preview": msg[:200],
    }


# ── Offline Data Bundle ────────────────────────────────────────────────────────

@app.get("/api/offline/data")
def get_offline_bundle():
    """Complete data bundle for PWA caching — ensures ~90% availability offline."""
    weather = get_weather("Hyderabad")
    prices = market_intelligence.get_prices()
    return {
        "timestamp": datetime.now().isoformat(),
        "weather": weather,
        "prices": prices,
        "agri_tips": [
            "Zinc sulphate 25kg/ha corrects zinc deficiency in rice — very common in AP/Telangana",
            "Drip irrigation saves 40-50% water. 55% subsidy under PM-KSVY for small farmers.",
            "Intercrop legumes with cereals to fix nitrogen and break pest cycles.",
            "Neem oil 3% spray is safe and effective for sucking pests. No PHI period.",
            "PM-KISAN: Register at pmkisan.gov.in with Aadhaar + land records for ₹6,000/year.",
            "Pheromone traps @ 5/acre for bollworm monitoring in cotton from 45 DAS.",
            "Trichoderma viride @ 5g/kg seed prevents soil-borne root diseases.",
            "Free soil testing at all KVK centers. Call Kisan Helpline: 1800-180-1551.",
            "MSP procurement: Register with nearest PACS or FCI before harvest season.",
            "e-NAM: Sell online at 1000+ APMCs. Usually 5-15% better than local rates.",
        ],
        "crop_calendar": {
            "kharif": {"sowing": "June–July", "harvest": "Oct–Nov", "crops": ["Rice", "Maize", "Cotton", "Soybean", "Groundnut"]},
            "rabi":   {"sowing": "Oct–Nov",   "harvest": "Mar–Apr", "crops": ["Wheat", "Mustard", "Chickpea", "Lentil", "Potato"]},
            "zaid":   {"sowing": "Feb–Mar",   "harvest": "May–Jun", "crops": ["Cucumber", "Watermelon", "Muskmelon", "Fodder"]},
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
