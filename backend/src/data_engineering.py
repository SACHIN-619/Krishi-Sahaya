"""
Data engineering utilities for KrishiSahay.
Uses only stdlib csv module — no numpy/pandas dependency.
"""

import csv, random
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).parent.parent / "data"
CSV_PATH = DATA_DIR / "mandi_prices_3yr.csv"

COMMODITIES = [
    {"name":"Wheat",    "base":2400,"market":"Azadpur Mandi",   "state":"Delhi",          "variety":"HD-2967"},
    {"name":"Rice",     "base":3200,"market":"Guntur Market",    "state":"Andhra Pradesh", "variety":"BPT-5204"},
    {"name":"Cotton",   "base":6800,"market":"Adilabad APMC",    "state":"Telangana",      "variety":"Bt Cotton"},
    {"name":"Soybean",  "base":4500,"market":"Indore Mandi",     "state":"Madhya Pradesh", "variety":"JS-335"},
    {"name":"Groundnut","base":5200,"market":"Rajkot Market",    "state":"Gujarat",        "variety":"GG-20"},
    {"name":"Maize",    "base":1900,"market":"Nizamabad APMC",   "state":"Telangana",      "variety":"DHM-117"},
    {"name":"Turmeric", "base":7500,"market":"Nizamabad Market", "state":"Telangana",      "variety":"Rajapuri"},
    {"name":"Chilli",   "base":8200,"market":"Guntur APMC",      "state":"Andhra Pradesh", "variety":"S-334"},
    {"name":"Onion",    "base":2100,"market":"Lasalgaon Market", "state":"Maharashtra",    "variety":"Nasik Red"},
    {"name":"Tomato",   "base":1800,"market":"Kolar Market",     "state":"Karnataka",      "variety":"Hybrid"},
    {"name":"Potato",   "base":1400,"market":"Agra Mandi",       "state":"Uttar Pradesh",  "variety":"Kufri Jyoti"},
    {"name":"Mustard",  "base":5600,"market":"Jaipur Mandi",     "state":"Rajasthan",      "variety":"Pusa Bold"},
]


def generate_sample_csv(days: int = 1095):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    rows, start = [], datetime.now() - timedelta(days=days)
    for i in range(days):
        date = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        for c in COMMODITIES:
            seasonal = 1 + 0.12 * (0.5 - abs(i % 365 - 182) / 365)
            noise = 1 + (random.random() - 0.5) * 0.10
            price = c["base"] * seasonal * noise
            rows.append({
                "date": date, "commodity": c["name"],
                "market": c["market"], "state": c["state"], "variety": c["variety"],
                "min_price": round(price * 0.93),
                "max_price": round(price * 1.07),
                "modal_price": round(price),
                "avg_price": round(c["base"] * seasonal),
            })
    with open(CSV_PATH, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["date","commodity","market","state","variety",
                                           "min_price","max_price","modal_price","avg_price"])
        w.writeheader()
        w.writerows(rows)
    print(f"[data_eng] ✅ Generated {len(rows)} price records → {CSV_PATH}")
    return len(rows)


def ensure_csv_exists():
    if not CSV_PATH.exists() or CSV_PATH.stat().st_size < 100:
        print("[data_eng] CSV missing — generating 3-year sample data...")
        generate_sample_csv()


def get_3yr_avg(commodity: str) -> Optional[float]:
    if not CSV_PATH.exists():
        return None
    try:
        with open(CSV_PATH) as f:
            rows = list(csv.DictReader(f))
        prices = [
            float(r.get("modal_price") or 0)
            for r in rows
            if r.get("commodity", "").lower() == commodity.lower()
            and float(r.get("modal_price") or 0) > 0
        ]
        return sum(prices) / len(prices) if prices else None
    except Exception:
        return None
