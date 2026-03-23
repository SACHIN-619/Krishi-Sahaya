"""
Notification engine for KrishiSahay.
- Sends WhatsApp alerts via Twilio for price spikes, disease alerts, scheme deadlines.
- Alert rules evaluated from market and disease data.
- Gracefully disabled if Twilio credentials not configured.
"""

import os
from datetime import datetime
from typing import Dict, List, Optional

import requests


class WhatsAppNotifier:
    def __init__(self, account_sid: str, auth_token: str, from_number: str):
        self.account_sid = account_sid
        self.auth_token = auth_token
        self.from_number = from_number  # e.g. whatsapp:+14155238886
        self.enabled = bool(account_sid and auth_token and from_number)

    def send(self, to: str, message: str) -> Dict:
        """Send WhatsApp message. to should be like '+919876543210'."""
        if not self.enabled:
            print(f"[notifier] Twilio not configured. Message: {message[:60]}...")
            return {"status": "skipped", "reason": "Twilio not configured"}
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
            to_wa = f"whatsapp:{to}" if not to.startswith("whatsapp:") else to
            resp = requests.post(
                url,
                data={"From": self.from_number, "To": to_wa, "Body": message},
                auth=(self.account_sid, self.auth_token),
                timeout=10,
            )
            if resp.status_code == 201:
                return {"status": "sent", "sid": resp.json().get("sid")}
            return {"status": "failed", "code": resp.status_code}
        except Exception as e:
            print(f"[notifier] Twilio error: {e}")
            return {"status": "error", "message": str(e)}


def build_price_alert(commodity: str, current_price: float, avg_price: float, signal: str) -> str:
    """Format a price alert message for WhatsApp."""
    delta = ((current_price - avg_price) / avg_price * 100) if avg_price else 0
    emoji = "🔺" if signal == "SELL" else "🔻" if signal == "BUY" else "➡️"
    return (
        f"🌾 *KrishiSahay Price Alert*\n\n"
        f"{emoji} *{commodity}*\n"
        f"Current: ₹{current_price:,.0f}/q\n"
        f"3-yr Avg: ₹{avg_price:,.0f}/q\n"
        f"Change: {delta:+.1f}%\n"
        f"Signal: *{signal}*\n\n"
        f"_Updated: {datetime.now().strftime('%d %b %H:%M')}_\n"
        f"_KrishiSahay — Empowering Farmers with AI_"
    )


def build_disease_alert(disease: str, severity: str, treatment: str) -> str:
    """Format a disease detection alert."""
    sev_emoji = {"high": "🚨", "medium": "⚠️", "low": "ℹ️", "none": "✅"}.get(severity, "⚠️")
    return (
        f"🌿 *KrishiSahay Disease Alert*\n\n"
        f"{sev_emoji} Detected: *{disease}*\n"
        f"Severity: {severity.upper()}\n\n"
        f"💊 *Treatment:*\n{treatment[:200]}...\n\n"
        f"_Contact your local KVK or call 1800-180-1551_"
    )


def check_price_alerts(prices: List[Dict], threshold_pct: float = 15.0) -> List[Dict]:
    """Return list of commodities that breach alert threshold."""
    alerts = []
    for p in prices:
        if abs(p.get("deltaPercent", 0)) >= threshold_pct:
            alerts.append({
                "type": "price",
                "commodity": p["commodity"],
                "signal": p["signal"],
                "deltaPercent": p["deltaPercent"],
                "currentPrice": p["currentPrice"],
                "market": p["market"],
            })
    return alerts


# Module-level singleton (initialized from app.py)
_notifier: Optional[WhatsAppNotifier] = None


def init_notifier(account_sid: str, auth_token: str, from_number: str) -> WhatsAppNotifier:
    global _notifier
    _notifier = WhatsAppNotifier(account_sid, auth_token, from_number)
    return _notifier


def get_notifier() -> Optional[WhatsAppNotifier]:
    return _notifier
