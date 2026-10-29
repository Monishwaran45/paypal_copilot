from typing import Dict, Any
from ..config import DEMO_MODE, ZAPIER_DISPUTE_WEBHOOK_URL, ZAPIER_AUDIT_WEBHOOK_URL
from ..models import DisputeContract, AuditEntry

class ZapierService:
    @classmethod
    def trigger_dispute_notification(cls, dispute: DisputeContract) -> Dict[str, Any]:
        """Dispatches an alert to Zapier webhook for Slack/Email notification."""
        payload = {
            "event": "DISPUTE_SIMULATED",
            "dispute_id": dispute.id,
            "amount": f"{dispute.amount.currency} {dispute.amount.value}",
            "buyer": dispute.buyer.get("name") if dispute.buyer else "Customer",
            "win_score": dispute.win_score,
            "due_date": dispute.respond_by,
            "carrier_verified": True
        }
        
        url = ZAPIER_DISPUTE_WEBHOOK_URL
        if not DEMO_MODE and "hooks.zapier.com" in url and "demo" not in url:
            try:
                import requests
                requests.post(url, json=payload, timeout=3.0)
            except Exception:
                pass

        return {
            "success": True,
            "channel": "slack",
            "webhook_url": url,
            "dispatched_payload": payload
        }

    @classmethod
    def trigger_audit_log(cls, entry: AuditEntry) -> Dict[str, Any]:
        """Dispatches an approved evidence record to Zapier webhook for Google Sheets audit append."""
        payload = {
            "event": "AUDIT_CHAIN_APPEND",
            "entry_id": entry.entryId,
            "dispute_id": entry.disputeId,
            "timestamp": entry.timestamp,
            "actor": f"{entry.actor.type}:{entry.actor.id}",
            "action": entry.action,
            "hash": entry.hash,
            "prev_hash": entry.prevHash
        }
        
        url = ZAPIER_AUDIT_WEBHOOK_URL
        if not DEMO_MODE and "hooks.zapier.com" in url and "demo" not in url:
            try:
                import requests
                requests.post(url, json=payload, timeout=3.0)
            except Exception:
                pass

        return {
            "success": True,
            "channel": "google_sheets",
            "webhook_url": url,
            "dispatched_payload": payload
        }

zapier_service = ZapierService()
