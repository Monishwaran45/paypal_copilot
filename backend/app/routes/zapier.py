from fastapi import APIRouter
from ..services.zapier_service import zapier_service
from ..services.audit_ledger import audit_ledger
from ..database import db

router = APIRouter(prefix="/api/zapier", tags=["Zapier Automations"])

@router.post("/test-notification")
async def test_notification():
    disputes = db.get_all()
    sample_dispute = disputes[0] if disputes else None
    if sample_dispute:
        result = await zapier_service.trigger_dispute_notification(sample_dispute)
    else:
        result = {
            "success": True,
            "channel": "slack",
            "webhook_url": "https://hooks.zapier.com/hooks/catch/paypal-slack-demo"
        }
    return result

@router.post("/test-audit")
async def test_audit():
    entries = audit_ledger.get_entries()
    sample_entry = entries[-1] if entries else None
    if sample_entry:
        result = await zapier_service.trigger_audit_log(sample_entry)
    else:
        result = {
            "success": True,
            "channel": "google_sheets",
            "webhook_url": "https://hooks.zapier.com/hooks/catch/audit-sheets-demo"
        }
    return result
