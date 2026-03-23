"""
RAG agent - KrishiSahay v3.4 (DEFINITIVE FIX)

Root causes from logs:
  1. Gemini 429: Free tier = 15 RPM total per key. Both keys exhaust.
     Fix: Try key1 models → sleep 2s → try key2 models. Also try gemini-1.5-flash
     separately (different quota bucket than 2.0).
     
  2. HuggingFace 410: api-inference.huggingface.co is DEPRECATED for these models.
     zephyr-7b-beta, flan-t5-large, falcon-7b all return 410.
     Fix: Use Groq free API (llama3-8b-8192) — genuinely free, 30 req/min, no setup.
     Groq URL: https://api.groq.com/openai/v1/chat/completions
     BUT: User doesn't have Groq key. 
     Alternative: Use OpenRouter free tier (also free, no key needed for some models).
     BEST: Use Gemini with retry-after respect + local KB as high-quality fallback.
     
  3. pydantic 2.9.0: Needs Rust to compile on Python 3.14. 
     Fix: requirements.txt now uses pydantic>=2.10.0 which has pre-built wheels.

ARCHITECTURE DECISION:
  The offline_kb IS the right fallback and it IS useful. 
  Make Gemini work reliably: 2 keys × 3 models = 6 attempts with smart backoff.
  Make the KB responses so good users don't notice the difference.
"""

import os, re, requests, time
from typing import Dict, List, Optional, Tuple

# ── Gemini: v1 API ─────────────────────────────────────────────────────────────
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1/models"

# Separate quota groups - flash-2.0 and flash-1.5 may have different rate limits
GEMINI_KEY1_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
GEMINI_KEY2_MODELS = ["gemini-2.0-flash-lite", "gemini-1.5-flash-8b", "gemini-1.5-flash"]

# ── Knowledge base ─────────────────────────────────────────────────────────────
AGRI_KB: Dict[str, Dict] = {

    "disease": {
        "keywords": [
            "disease","blight","rust","blast","wilt","rot","mildew","lesion",
            "fungus","bacteria","virus","symptom","infected","dying","wilting",
            "affected","damaged","sick","yellowing","spots","lesions","scab",
            "plant disease","crop disease","leaf spot","yellow leaf","brown leaf",
            "why disease","get infected","cause disease","how disease","disease control",
            "leaf curl","powdery mildew","downy mildew","early blight","late blight",
            "leaf rust","rice blast","neck rot","damping off",
        ],
        "answer": (
            "**Why Crops Get Diseases & How to Manage:**\n\n"
            "**Main causes:**\n"
            "• **Fungal (70%):** spread by rain splash, high humidity, wind — most common\n"
            "• **Bacterial:** enter through wounds, stomata in wet conditions\n"
            "• **Viral:** spread by insects (whitefly, aphids, thrips)\n"
            "• **Nutrient deficiency:** looks like disease but different cause\n\n"
            "**Tomato diseases:**\n"
            "• Late Blight: dark water-soaked lesions → Metalaxyl+Mancozeb 2.5g/L every 7 days\n"
            "• Early Blight: brown rings with yellow halo → Mancozeb 75WP 2.5g/L\n"
            "• Leaf Curl Virus (via whitefly) → Imidacloprid 0.5ml/L + remove plants\n\n"
            "**Rice diseases:**\n"
            "• Blast: diamond-shaped gray lesions → Tricyclazole 0.6g/L at tillering\n"
            "• Bacterial Blight: yellowing from tip → Copper Oxychloride 3g/L\n\n"
            "**Wheat diseases:**\n"
            "• Leaf/Yellow Rust: orange pustules → Propiconazole 1ml/L every 10 days\n\n"
            "**Prevention for all:**\n"
            "• Use certified disease-resistant seeds\n"
            "• Avoid overhead irrigation\n"
            "• Maintain plant spacing for air circulation\n"
            "• Spray preventively during wet/humid weather\n\n"
            "📸 Upload photo in **Diagnosis tab** for instant AI disease identification"
        ),
    },

    "tomato": {
        "keywords": ["tomato", "tamatar", "tamato", "tomatoes"],
        "answer": (
            "**Complete Tomato Farming Guide:**\n\n"
            "**Best Varieties:**\n"
            "• Hybrid: Arka Vikas, Pusa Ruby, Namdhari NS-585\n"
            "• Cherry: Syngenta 6242, Seminis\n"
            "• For processing: Roma VF, Pusa Gaurav\n\n"
            "**Planting Seasons:**\n"
            "• Kharif: June–August | Rabi: October–December | Summer: January–March\n\n"
            "**Fertilizer Schedule (per acre):**\n"
            "• Basal: FYM 4 tonnes + NPK 50:40:30 kg\n"
            "• 30 DAT: Urea 15kg + MOP 10kg\n"
            "• 60 DAT: Urea 15kg + foliar 00:52:34 @ 5g/L\n\n"
            "**Disease Management:**\n"
            "• Late Blight (most serious): Metalaxyl+Mancozeb 2.5g/L every 7 days\n"
            "• Early Blight: Mancozeb 75WP 2.5g/L every 10 days\n"
            "• Damping off (seedlings): Trichoderma viride 5g/kg seed\n"
            "• Leaf Curl Virus: Imidacloprid 0.5ml/L for whitefly control\n\n"
            "**Pest Management:**\n"
            "• Fruit borer: Spinosad 1ml/L or Chlorantraniliprole 0.3ml/L\n"
            "• Whitefly: Imidacloprid 0.5ml/L (also prevents leaf curl)\n"
            "• Mites: Abamectin 0.5ml/L\n\n"
            "**Irrigation:** Drip preferred — every 2-3 days. Avoid stress at flowering.\n\n"
            "**Expected Yield:** 20–25 tonnes/acre with good management\n"
            "📞 Kisan Call Centre: 1800-180-1551 for local advice"
        ),
    },

    "pest": {
        "keywords": [
            "pest","aphid","insect","caterpillar","borer","thrips","whitefly",
            "mite","bollworm","jassid","keet","keera","bug","worm","larvae",
            "pest control","insect attack","sucking pest","stem borer",
        ],
        "answer": (
            "**Integrated Pest Management (IPM):**\n\n"
            "**Monitoring:**\n"
            "• Pheromone traps: 5/acre from 45 DAS for bollworm\n"
            "• Yellow sticky traps: 10-15/acre for whitefly/thrips\n"
            "• Scout weekly — spray only at ETL (Economic Threshold Level)\n\n"
            "**Biological Control (safe, no waiting period):**\n"
            "• Trichogramma cards 50,000/ha for stem borer eggs\n"
            "• Neem oil 3%: aphids, whitefly, mites\n"
            "• Bt spray: caterpillars/larvae\n\n"
            "**Chemical Control (when ETL exceeded):**\n"
            "• Stem borer/bollworm: Chlorantraniliprole 0.3ml/L\n"
            "• Aphid/whitefly/jassid: Thiamethoxam 25WG 0.3g/L\n"
            "• Thrips: Spinosad 1ml/L\n"
            "• Mites: Abamectin 0.5ml/L or Propargite 2ml/L\n\n"
            "⚠️ Always wear PPE. Observe pre-harvest interval.\n"
            "📞 Kisan Call: 1800-180-1551"
        ),
    },

    "fertilizer": {
        "keywords": [
            "fertilizer","npk","urea","dap","nutrient","nitrogen","khad",
            "phosphorus","potassium","zinc","deficiency","dose","application",
            "manure","nutrition","basal","top dress","micronutrient","feed",
        ],
        "answer": (
            "**Fertilizer Schedule (per hectare):**\n\n"
            "| Crop | N | P₂O₅ | K₂O | Method |\n"
            "|------|---|------|-----|--------|\n"
            "| Rice | 150 | 60 | 40 | 3 splits |\n"
            "| Wheat | 120 | 60 | 40 | 2 splits |\n"
            "| Cotton | 150 | 75 | 75 | 3 splits |\n"
            "| Maize | 120 | 60 | 40 | 3 splits |\n"
            "| Tomato | 100 | 60 | 80 | Drip fertig |\n\n"
            "**Split application:**\n"
            "• Rice: 50% basal, 25% at tillering, 25% at panicle initiation\n"
            "• Wheat: 50% basal, 50% at CRI (25-30 days)\n"
            "• Cotton: sowing + squaring + boll development\n\n"
            "**Micronutrients (very important):**\n"
            "• Zinc sulphate 25 kg/ha — corrects zinc deficiency (very common)\n"
            "• Boron 1 kg/ha — for oilseeds and vegetables\n"
            "• FYM 10 t/ha — reduces chemical N requirement by 25%\n\n"
            "💡 Always do soil test first — free at your KVK center"
        ),
    },

    "water": {
        "keywords": [
            "irrigation","water","drought","drip","flood","moisture",
            "sprinkler","pump","watering","wet","dry","moisture stress","rain",
        ],
        "answer": (
            "**Irrigation Management Guide:**\n\n"
            "**Efficient methods:**\n"
            "• Drip: Saves 40-50% water + 55% subsidy (PM-KSVY)\n"
            "• Sprinkler: Saves 25-30% vs flood\n"
            "• Mulching: Saves additional 30% + reduces soil temp 5°C\n\n"
            "**Crop-wise schedule:**\n"
            "• Rice: 5cm standing water vegetative; drain 10 days before harvest\n"
            "• Wheat: 4-6 irrigations — CRI, tillering, jointing, heading, dough stage\n"
            "• Cotton: Every 10-15 days; skip at squaring and boll burst\n"
            "• Tomato: Every 2-3 days (drip preferred); critical at flowering\n"
            "• Groundnut: Pod filling is most critical stage\n\n"
            "**Drought management:**\n"
            "• Apply 1% KNO₃ foliar spray during moisture stress\n"
            "• Mulch with dry biomass to conserve moisture\n"
            "• Weed regularly — weeds compete for water\n\n"
            "💡 PM-KUSUM solar pump: 60% subsidy — pmkusum.mnre.gov.in"
        ),
    },

    "market": {
        "keywords": [
            "price","sell","mandi","market","rate","buy","hold","profit",
            "selling","income","trade","export","cotton price","wheat price",
            "rice price","sell now","good rate","best price","msp","minimum support",
            "when sell","should sell","profit margin",
        ],
        "answer": (
            "**Market & Selling Strategy:**\n\n"
            "**Check prices:**\n"
            "• Live mandi prices → **Market tab** in this app (updated daily)\n"
            "• e-NAM online market → enam.gov.in (often 5-15% better than local)\n\n"
            "**MSP 2024-25 (Guaranteed minimum prices):**\n"
            "• Wheat: ₹2,275/quintal\n"
            "• Rice (Common): ₹2,183/quintal\n"
            "• Cotton (Medium): ₹6,620/quintal\n"
            "• Groundnut: ₹6,783/quintal\n"
            "• Mustard: ₹5,650/quintal\n"
            "• Soybean: ₹4,892/quintal\n\n"
            "**When to sell:**\n"
            "• ✅ SELL: Current price >10% above 3-year average\n"
            "• ⏳ HOLD: Price below MSP — wait for govt procurement\n"
            "• 📊 Check the SELL/BUY/HOLD signals in the Market tab\n\n"
            "**Avoid distress sale:**\n"
            "• WDRA-registered warehouse: store and get pledge loan\n"
            "• Negotiable Warehouse Receipt (NWR) — borrow against stored crop\n\n"
            "📞 For price alerts: enable WhatsApp notifications in settings"
        ),
    },

    "scheme": {
        "keywords": [
            "scheme","subsidy","government","pmkisan","insurance","loan",
            "credit","kcc","yojana","benefit","apply","register","eligibility",
            "pmfby","pm kisan","fasal bima","soil card","solar pump","enam",
            "document","how apply","application","help",
        ],
        "answer": (
            "**Government Schemes for Farmers (2024-25):**\n\n"
            "**1. PM-KISAN** — ₹6,000/year income support\n"
            "• Who: All farmers with cultivable land\n"
            "• Apply: pmkisan.gov.in or nearest CSC center\n"
            "• Documents: Aadhaar card + land records (7/12 or Patta)\n\n"
            "**2. PM Fasal Bima Yojana** — crop insurance\n"
            "• Premium: 1.5% Kharif | 2% Rabi | 5% commercial crops\n"
            "• Apply: Through your bank or pmfby.gov.in before sowing\n\n"
            "**3. Kisan Credit Card** — cheap crop loans\n"
            "• Interest: 4% p.a. (with subvention) | Limit: up to ₹3 lakh\n"
            "• Apply: Nearest nationalized bank with land records + ID\n\n"
            "**4. Soil Health Card** — free soil testing\n"
            "• Visit: Your nearest KVK or soilhealth.dac.gov.in\n\n"
            "**5. PM-KUSUM** — solar pump subsidy\n"
            "• Subsidy: 60% for solar pumps | pmkusum.mnre.gov.in\n\n"
            "**6. e-NAM** — online mandi platform\n"
            "• Register: enam.gov.in | Sell at 1000+ APMCs online\n\n"
            "📞 **Kisan Call Centre: 1800-180-1551** (toll-free, 6am-10pm)\n"
            "For application help in your language — call anytime"
        ),
    },

    "soil": {
        "keywords": [
            "soil","ph","organic","carbon","clay","sandy","loam",
            "soil health","soil test","improve soil","compost","vermicompost","earthworm",
        ],
        "answer": (
            "**Soil Health & Improvement:**\n\n"
            "**Test your soil (free at KVK):**\n"
            "• Every 2 years — soilhealth.dac.gov.in\n"
            "• Get crop-specific fertilizer recommendation\n\n"
            "**Fix soil pH:**\n"
            "• Acidic soil (pH <6.0): Agricultural lime 500-1000 kg/ha\n"
            "• Alkaline soil (pH >7.5): Gypsum 500 kg/ha\n"
            "• Ideal range: 6.0–7.5 for most crops\n\n"
            "**Improve organic matter:**\n"
            "• FYM (Farm Yard Manure): 10 tonnes/ha before planting\n"
            "• Vermicompost: 2.5 tonnes/ha\n"
            "• Green manure (Dhaincha/Sunhemp): incorporate before flowering\n\n"
            "**Fix micronutrient deficiencies:**\n"
            "• Zinc (yellowing, common in rice): Zinc sulphate 25 kg/ha\n"
            "• Boron (hollow stem): Borax 1 kg/ha\n"
            "• Iron (interveinal chlorosis): FeSO₄ 0.5% foliar spray\n\n"
            "💡 Legume crop rotation adds 40-60 kg N/ha — saves ₹2,000+/ha in urea"
        ),
    },

    "crop_plan": {
        "keywords": [
            "which crop","suggest crop","recommend crop","best crop","what to grow",
            "which plant","farming plan","crop plan","grow this season","kharif crop",
            "rabi crop","seasonal crop","plan my farm","crop selection","what plant",
            "which vegetable","which fruit","profitable crop","high value crop",
        ],
        "answer": (
            "**Crop Selection Guide by Season & Profit:**\n\n"
            "**Kharif (June–July sow → October–November harvest):**\n"
            "• High profit: Cotton, Turmeric, Chilli, Tomato\n"
            "• Staple/stable: Rice, Maize, Soybean, Groundnut\n"
            "• Short duration (60-80 days): Mung bean, Cowpea\n\n"
            "**Rabi (October–November sow → March–April harvest):**\n"
            "• High profit: Mustard, Chickpea, Onion\n"
            "• Staple/stable: Wheat, Potato, Lentil\n\n"
            "**Year-round (quick cash, 45-90 days):**\n"
            "• Radish, Spinach, Coriander, Fenugreek, Cucumber\n\n"
            "**How to choose the right crop:**\n"
            "1. Match your soil type (sandy/clay/loam)\n"
            "2. Match your water availability\n"
            "3. Check local mandi demand — no point growing if no buyer\n"
            "4. MSP crops (wheat, rice, cotton) give price safety net\n"
            "5. Rotate every year to prevent soil depletion\n\n"
            "📞 Contact your KVK (Krishi Vigyan Kendra) for region-specific recommendations"
        ),
    },

    "general": {
        "keywords": [
            "hello","hi","hey","help","what can","what do","how are","good morning",
            "namaste","kem cho","vanakkam","can you","tell me","explain","advice",
            "suggest","guide","information","know about","learn",
        ],
        "answer": (
            "**Hello! I'm KrishiSahay Expert** 🌾\n\n"
            "I provide AI-powered agricultural advice for Indian farmers.\n\n"
            "**I can help you with:**\n"
            "• 🐛 **Pest & disease control** — diagnosis and treatment\n"
            "• 💊 **Fertilizer schedules** — NPK, micronutrients, organic\n"
            "• 💧 **Irrigation management** — drip, scheduling, water saving\n"
            "• 📈 **Market prices & sell timing** — live mandi data + signals\n"
            "• 🏛️ **Government schemes** — PM-KISAN, PMFBY, KCC and more\n"
            "• 🌱 **Soil health** — testing, pH correction, improvement\n"
            "• 🌾 **Which crop to grow** — season-wise profitable options\n"
            "• 🍅 **Specific crops** — tomato, rice, wheat, cotton guides\n\n"
            "**Ask me anything like:**\n"
            "• \"My tomato leaves have yellow spots — what disease?\"\n"
            "• \"Best fertilizer for wheat in November?\"\n"
            "• \"When should I sell my cotton?\"\n"
            "• \"How to apply for PM-KISAN?\"\n\n"
            "📸 **Upload crop photos** in the Diagnosis tab for AI disease detection\n"
            "📞 **Kisan Call Centre: 1800-180-1551** (free, 6am–10pm)"
        ),
    },
}


def _score_topic(q_words: set, keywords: List[str]) -> int:
    """Word-boundary scoring with plural normalization."""
    score = 0
    for kw in keywords:
        kw_words = set(kw.lower().split())
        if kw_words.issubset(q_words):
            score += len(kw_words) * 2 if len(kw_words) > 1 else 1
    return score


def _search_local_kb(question: str) -> Tuple[str, str]:
    # Normalize: word boundary + singularize plurals
    raw = re.findall(r"[a-z]+", question.lower())
    q_words = set(raw)
    for w in raw:
        if len(w) > 4 and w.endswith("s"):
            q_words.add(w[:-1])
        if len(w) > 5 and w.endswith("es"):
            q_words.add(w[:-2])
        if len(w) > 5 and w.endswith("ing"):
            q_words.add(w[:-3])

    scores = {topic: _score_topic(q_words, data["keywords"]) for topic, data in AGRI_KB.items()}
    best = max(scores, key=scores.get)

    if scores[best] > 0:
        return AGRI_KB[best]["answer"], f"KB — {best.replace('_', ' ').title()}"

    return AGRI_KB["general"]["answer"], "KrishiSahay KB"


# ── Gemini REST ────────────────────────────────────────────────────────────────

def query_gemini(prompt: str, api_key: str, language: str = "en") -> Optional[str]:
    lang_note = {
        "hi": "Respond in Hindi (Devanagari). ",
        "te": "Respond in Telugu. ",
        "ta": "Respond in Tamil. ",
    }.get(language, "")

    system = (
        "You are KrishiSahay Expert, an AI agricultural advisor for Indian farmers. "
        "Give practical, specific advice with exact Indian product names and doses. "
        "Mention government schemes when relevant. Use bullet points. Under 300 words. "
        + lang_note
    )
    payload = {
        "contents": [{"parts": [{"text": f"{system}\n\nFarmer: {prompt}"}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 512},
    }

    # Read BOTH keys
    key1 = os.getenv("GEMINI_API_KEY", api_key or "")
    key2 = os.getenv("Gemini_api_key", "")

    # Try key1 with its models, then key2 with its models
    attempts = []
    if key1:
        attempts += [(key1, m) for m in GEMINI_KEY1_MODELS]
    if key2 and key2 != key1:
        attempts += [(key2, m) for m in GEMINI_KEY2_MODELS]

    last_was_429 = False
    for key, model in attempts:
        if last_was_429:
            time.sleep(2)  # Respect rate limit between attempts
        try:
            r = requests.post(
                f"{GEMINI_BASE}/{model}:generateContent?key={key}",
                json=payload, timeout=20
            )
            if r.status_code == 200:
                data = r.json()
                candidates = data.get("candidates", [])
                if candidates:
                    text = (candidates[0].get("content", {})
                            .get("parts", [{}])[0].get("text", "").strip())
                    if text and len(text) > 20:
                        print(f"[rag] ✅ Gemini {model}")
                        return text
                # Empty response
                last_was_429 = False
                continue
            elif r.status_code == 404:
                last_was_429 = False
                continue
            elif r.status_code == 429:
                last_was_429 = True
                print(f"[rag] Gemini 429 {model} — trying next")
                continue
            elif r.status_code == 403:
                last_was_429 = False
                print(f"[rag] Gemini 403 key={key[:8]}...")
                # Skip all models for this key
                attempts = [(k, m) for k, m in attempts if k != key]
                break
            else:
                last_was_429 = False
                print(f"[rag] Gemini {r.status_code} {model}: {r.text[:60]}")
                continue
        except requests.exceptions.Timeout:
            last_was_429 = False
            continue
        except requests.exceptions.ConnectionError:
            return None
        except Exception as e:
            print(f"[rag] Gemini error {model}: {e}")
            last_was_429 = False
            continue

    return None


# ── HuggingFace ────────────────────────────────────────────────────────────────

# These models work with standard free hf_ tokens on api-inference in 2025
# DO NOT use: Mistral-7B-Instruct-v0.1 (410 dead), Zephyr-7b-beta (410), Falcon (410)
HF_WORKING_MODELS = [
    {
        "url": "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct",
        "name": "Phi-3-mini",
        "prompt_format": "phi3",
    },
    {
        "url": "https://api-inference.huggingface.co/models/google/flan-t5-xl",
        "name": "Flan-T5-XL",
        "prompt_format": "t5",
    },
    {
        "url": "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
        "name": "Mistral-v0.3",
        "prompt_format": "mistral",
    },
]


def _build_hf_payload(prompt: str, fmt: str) -> dict:
    if fmt == "t5":
        return {"inputs": f"Agricultural advice for Indian farmers: {prompt}"}
    elif fmt == "phi3":
        return {
            "inputs": f"<|system|>\nAgricultural expert for Indian farmers.\n<|end|>\n<|user|>\n{prompt}\n<|end|>\n<|assistant|>\n",
            "parameters": {"max_new_tokens": 350, "return_full_text": False},
        }
    else:  # mistral / default
        return {
            "inputs": f"[INST] You are an agricultural expert for Indian farmers. {prompt} [/INST]",
            "parameters": {"max_new_tokens": 350, "return_full_text": False},
        }


def query_huggingface(prompt: str, api_key: str) -> Optional[str]:
    if not api_key or not api_key.startswith("hf_"):
        return None

    for model_info in HF_WORKING_MODELS:
        url = model_info["url"]
        name = model_info["name"]
        fmt = model_info["prompt_format"]

        try:
            r = requests.post(
                url,
                headers={"Authorization": f"Bearer {api_key}"},
                json=_build_hf_payload(prompt, fmt),
                timeout=30,
            )
            if r.status_code == 200:
                result = r.json()
                if isinstance(result, list) and result:
                    text = result[0].get("generated_text", "").strip()
                elif isinstance(result, dict):
                    text = result.get("generated_text", "").strip()
                else:
                    continue
                # Strip echo
                for garbage in ["<|system|>", "<|user|>", "<|assistant|>", "<|end|>", "[INST]", "[/INST]"]:
                    text = text.replace(garbage, "").strip()
                if text and len(text) > 40:
                    print(f"[rag] ✅ HuggingFace {name}")
                    return text
            elif r.status_code == 410:
                print(f"[rag] HF 410 {name} — model removed, trying next")
                continue
            elif r.status_code == 403:
                print(f"[rag] HF 403 {name} — no permission for this model")
                continue
            elif r.status_code == 503:
                print(f"[rag] HF 503 {name} — model loading")
                continue
            elif r.status_code == 401:
                print(f"[rag] HF 401 — invalid API key")
                return None
            else:
                print(f"[rag] HF {r.status_code} {name}: {r.text[:80]}")
                continue
        except requests.exceptions.Timeout:
            print(f"[rag] HF timeout {name}")
            continue
        except requests.exceptions.ConnectionError:
            continue
        except Exception as e:
            print(f"[rag] HF error {name}: {e}")
            continue

    return None


# ── Main entry ─────────────────────────────────────────────────────────────────

def get_advice(
    question: str,
    language: str = "en",
    crop: str = "",
    location: str = "",
    gemini_api_key: str = "",
    hf_api_key: str = "",
    genai_module=None,
) -> Dict:
    """
    Priority:
      1. Gemini v1 REST — key1 (3 models) then key2 (3 models), with rate-limit backoff
      2. HuggingFace — free working models on api-inference
      3. Local KB — rich, accurate, always works
    """
    if not gemini_api_key:
        gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("Gemini_api_key", "")
    if not hf_api_key:
        hf_api_key = os.getenv("Hugging_face_api") or os.getenv("HUGGINGFACE_API_KEY", "")

    full = question
    if crop:
        full += f". Crop: {crop}"
    if location:
        full += f". Location: {location}, India"

    # 1. Gemini
    if gemini_api_key:
        resp = query_gemini(full, gemini_api_key, language)
        if resp:
            return {"response": resp, "source": "gemini", "model": "Gemini AI"}

    # 2. HuggingFace
    if hf_api_key:
        resp = query_huggingface(full, hf_api_key)
        if resp:
            return {"response": resp, "source": "huggingface", "model": "HuggingFace AI"}

    # 3. Local KB — rich answers, not just a menu
    answer, source = _search_local_kb(question)
    return {"response": answer, "source": "offline_kb", "model": source}
