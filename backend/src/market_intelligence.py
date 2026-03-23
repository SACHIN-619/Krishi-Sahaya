"""
Market intelligence for KrishiSahay.

IMPORTANT — Why Agmarknet shows 403:
  Your .env has AGMARKNET_API_KEY=9ef84268-... and Commodity_api_key=35985678-...
  These are RESOURCE IDs (what dataset to fetch), NOT your API key.
  Your actual data.gov.in API key is separate — get it from:
  https://data.gov.in → Login → My Account → API Keys → Generate Key
  Then add: DATAGOV_API_KEY=your_actual_32char_key to backend/.env

Until then: 13,140-row CSV provides accurate offline prices.
"""

import os, csv, random
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import requests

DATA_DIR = Path(__file__).parent.parent / "data"
CSV_PATH = DATA_DIR / "mandi_prices_3yr.csv"

# These are RESOURCE IDs (fixed datasets on data.gov.in)
AGMARKNET_RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070"
COMMODITY_RESOURCE = "35985678-0d79-46b4-9ed6-6f13308a1d24"

MSP_2024_25 = {
    "Wheat":2275,"Rice":2183,"Paddy":2183,"Cotton":6620,"Soybean":4892,
    "Maize":2090,"Groundnut":6783,"Mustard":5650,"Gram":5440,"Lentil":6425,
    "Urad":7400,"Moong":8682,"Sugarcane":340,"Jowar":3371,"Bajra":2625,
}

COMMODITY_DEFAULTS = [
    {"name":"Wheat",    "base":2400,"market":"Azadpur Mandi",   "state":"Delhi",           "variety":"HD-2967"},
    {"name":"Rice",     "base":3200,"market":"Guntur Market",    "state":"Andhra Pradesh",  "variety":"BPT-5204"},
    {"name":"Cotton",   "base":6800,"market":"Adilabad APMC",    "state":"Telangana",       "variety":"Bt Cotton"},
    {"name":"Soybean",  "base":4500,"market":"Indore Mandi",     "state":"Madhya Pradesh",  "variety":"JS-335"},
    {"name":"Groundnut","base":5200,"market":"Rajkot Market",    "state":"Gujarat",         "variety":"GG-20"},
    {"name":"Maize",    "base":1900,"market":"Nizamabad APMC",   "state":"Telangana",       "variety":"DHM-117"},
    {"name":"Turmeric", "base":7500,"market":"Nizamabad Market", "state":"Telangana",       "variety":"Rajapuri"},
    {"name":"Chilli",   "base":8200,"market":"Guntur APMC",      "state":"Andhra Pradesh",  "variety":"S-334"},
    {"name":"Onion",    "base":2100,"market":"Lasalgaon Market", "state":"Maharashtra",     "variety":"Nasik Red"},
    {"name":"Tomato",   "base":1800,"market":"Kolar Market",     "state":"Karnataka",       "variety":"Hybrid"},
    {"name":"Potato",   "base":1400,"market":"Agra Mandi",       "state":"Uttar Pradesh",   "variety":"Kufri Jyoti"},
    {"name":"Mustard",  "base":5600,"market":"Jaipur Mandi",     "state":"Rajasthan",       "variety":"Pusa Bold"},
]


def _make_record(name, current, avg, market, state="", variety="", source="mock") -> Dict:
    delta = round(((current - avg) / avg * 100) if avg else 0, 1)
    msp = MSP_2024_25.get(name)
    return {
        "commodity": name,
        "currentPrice": round(current),
        "avgPrice": round(avg),
        "deltaPercent": delta,
        "signal": "SELL" if delta > 10 else "BUY" if delta < -10 else "HOLD",
        "market": market,
        "state": state,
        "variety": variety,
        "trend": "UP" if delta > 5 else "DOWN" if delta < -5 else "STABLE",
        "msp": msp,
        "aboveMSP": bool(current > msp) if msp else None,
        "lastUpdated": datetime.now().isoformat(),
        "source": source,
    }


def _fetch_resource(resource_id: str, api_key: str) -> Optional[List[Dict]]:
    """Fetch from data.gov.in using a REAL registered API key."""
    if not api_key or len(api_key) < 20:
        return None
    try:
        url = f"https://api.data.gov.in/resource/{resource_id}?api-key={api_key}&format=json&limit=50"
        r = requests.get(url, timeout=12)
        if r.status_code == 200:
            records = r.json().get("records", [])
            if records:
                return records
        elif r.status_code == 403:
            print(
                f"[market] data.gov.in 403: API key invalid or not registered.\n"
                f"  → Get your key at: https://data.gov.in → Login → My Account → API Keys\n"
                f"  → Add to backend/.env: DATAGOV_API_KEY=your_actual_key\n"
                f"  → Note: AGMARKNET_API_KEY in your .env is a resource ID, not an API key!"
            )
        elif r.status_code == 401:
            print("[market] data.gov.in 401: unauthorized")
        else:
            print(f"[market] data.gov.in {r.status_code}: {r.text[:80]}")
    except Exception as e:
        print(f"[market] data.gov.in error: {e}")
    return None


def _parse_records(records: List[Dict], source: str) -> List[Dict]:
    results, seen = [], set()
    for rec in records:
        name = (rec.get("commodity") or rec.get("Commodity") or
                rec.get("commodity_name") or "").strip().title()
        if not name or name in seen:
            continue
        seen.add(name)
        try:
            modal = float(rec.get("modal_price") or rec.get("Modal_Price") or
                          rec.get("Modal Price") or 0)
            mn = float(rec.get("min_price") or rec.get("Min_Price") or modal * 0.92)
            mx = float(rec.get("max_price") or rec.get("Max_Price") or modal * 1.08)
            if modal <= 0:
                continue
            avg = (mn + mx) / 2
            results.append(_make_record(
                name, modal, avg,
                rec.get("market") or rec.get("Market") or "APMC",
                rec.get("state") or rec.get("State") or "",
                rec.get("variety") or rec.get("Variety") or "",
                source,
            ))
        except (TypeError, ValueError):
            continue
    return results


def fetch_agmarknet_live() -> Optional[List[Dict]]:
    """
    Fetch live prices from data.gov.in.
    Requires DATAGOV_API_KEY (a real registered key, not resource ID).
    """
    # The real API key — NOT the resource IDs
    api_key = (
        os.getenv("DATAGOV_API_KEY") or          # correct env var name
        os.getenv("DATA_GOV_API_KEY") or          # alternate spelling
        ""
    )
    # NOTE: AGMARKNET_API_KEY and Commodity_api_key in .env are RESOURCE IDs,
    # not API keys. We don't use them as keys here.

    if not api_key:
        return None  # Silent — CSV fallback will handle it

    for resource_id in [AGMARKNET_RESOURCE, COMMODITY_RESOURCE]:
        records = _fetch_resource(resource_id, api_key)
        if records:
            parsed = _parse_records(records, "agmarknet_live")
            if parsed:
                print(f"[market] ✅ Agmarknet LIVE: {len(parsed)} commodities")
                return parsed
    return None


def load_csv_prices() -> Optional[List[Dict]]:
    """Load 3-year historical CSV — 13,140 rows, always available offline."""
    if not CSV_PATH.exists() or CSV_PATH.stat().st_size < 100:
        return None
    try:
        with open(CSV_PATH) as f:
            rows = list(csv.DictReader(f))
        results, seen = [], set()
        for row in reversed(rows):
            name = (row.get("commodity") or "").strip().title()
            if not name or name in seen:
                continue
            seen.add(name)
            try:
                current = float(row.get("modal_price") or 0)
                avg = float(row.get("avg_price") or current * 0.95)
                if current <= 0:
                    continue
                results.append(_make_record(
                    name, current, avg,
                    row.get("market", "APMC"), row.get("state", ""),
                    row.get("variety", ""), "csv_offline"
                ))
            except (TypeError, ValueError):
                continue
        if results:
            print(f"[market] ✅ CSV offline: {len(results)} commodities")
        return results or None
    except Exception as e:
        print(f"[market] CSV error: {e}")
    return None


def generate_mock_prices() -> List[Dict]:
    print("[market] ⚠️ Using mock prices (CSV missing)")
    return [
        _make_record(c["name"], c["base"] * (1 + (random.random()-0.5)*0.18),
                     c["base"], c["market"], c["state"], c["variety"], "mock")
        for c in COMMODITY_DEFAULTS
    ]


def get_prices() -> List[Dict]:
    return fetch_agmarknet_live() or load_csv_prices() or generate_mock_prices()


def get_price_summary(prices: List[Dict]) -> Dict:
    if not prices:
        return {}
    return {
        "totalCommodities": len(prices),
        "sellSignals": sum(1 for p in prices if p["signal"] == "SELL"),
        "buySignals": sum(1 for p in prices if p["signal"] == "BUY"),
        "holdSignals": sum(1 for p in prices if p["signal"] == "HOLD"),
        "risingCommodities": sum(1 for p in prices if p["trend"] == "UP"),
        "dataSource": prices[0]["source"] if prices else "unknown",
        "lastUpdated": datetime.now().isoformat(),
    }
