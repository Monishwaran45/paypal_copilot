import json
from typing import Dict, Any, Set
from fastapi import APIRouter, Request, Header, HTTPException, status
from .config import WEBHOOK_PATH, PAYPAL_WEBHOOK_EVENTS
from .paypal_client import paypal_client
from .sync import normalize_paypal_dispute
from .database import db
from .services.audit_ledger import audit_ledger

router = APIRouter(tags=["PayPal Webhooks"])

# Set of processed event IDs to prevent duplicate actions on PayPal retries
_PROCESSED_EVENT_IDS: Set[str] = set()

@router.post(WEBHOOK_PATH)
@router.post("/api" + WEBHOOK_PATH)
async def paypal_webhook_receiver(request: Request):
    """
    PayPal Dispute Webhook Endpoint:
    - Signature verification
    - Event idempotency / deduplication
    - Ingests CUSTOMER.DISPUTE.CREATED, UPDATED, RESOLVED
    - Automatically invokes AI Dispute Copilot Agent to draft evidence & compute win score
    """
    body_bytes = await request.body()
    try:
        payload = json.loads(body_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_id = payload.get("id")
    event_type = payload.get("event_type")

    # 1. Deduplication check
    if event_id and event_id in _PROCESSED_EVENT_IDS:
        return {"status": "ignored", "reason": "duplicate_event_id", "event_id": event_id}

    # 2. Verify signature
    headers = {k.lower(): v for k, v in request.headers.items()}
    is_valid = paypal_client.verify_webhook_signature(headers, body_bytes)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="PayPal webhook signature verification failed"
        )

    if event_id:
        _PROCESSED_EVENT_IDS.add(event_id)

    # 3. Handle dispute events
    if event_type in PAYPAL_WEBHOOK_EVENTS:
        resource = payload.get("resource", {})
        dispute_id = resource.get("dispute_id") or resource.get("id")

        if event_type == "CUSTOMER.DISPUTE.CREATED":
            contract = normalize_paypal_dispute(resource)
            db.save(contract)

            # Record in audit ledger
            audit_ledger.record_entry(
                dispute_id=contract.id,
                actor_type="AI_AGENT",
                actor_id="copilot_webhook_listener",
                action="DISPUTE_WEBHOOK_RECEIVED",
                details=f"Received PayPal event {event_type}. AI drafted evidence with {contract.win_score}% win estimate."
            )
            return {"status": "processed", "event_type": event_type, "dispute_id": contract.id}

        elif event_type == "CUSTOMER.DISPUTE.RESOLVED":
            if dispute_id:
                dispute = db.get_by_id(dispute_id)
                if dispute:
                    dispute.status = "RESOLVED"
                    dispute.approval_state = "submitted"
                    db.save(dispute)
            return {"status": "processed", "event_type": event_type, "dispute_id": dispute_id}

    return {"status": "acknowledged", "event_type": event_type}
