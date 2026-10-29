from fastapi import APIRouter, Request, HTTPException
from ..models import PayPalWebhookPayload, Dispute, DisputeAmount, Buyer, Item, ShippingAddress
from ..services.carrier_kernel import carrier_kernel
from ..services.elastic_precedents import elastic_precedents
from ..services.ai_evidence_studio import ai_evidence_studio
from ..services.audit_ledger import audit_ledger
from ..services.zapier_service import zapier_service
from ..database import db

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

@router.post("/paypal")
async def handle_paypal_webhook(payload: PayPalWebhookPayload):
    event_type = payload.event_type
    resource = payload.resource or {}

    if event_type == "CUSTOMER.DISPUTE.CREATED":
        dispute_id = resource.get("dispute_id", f"PP-D-{resource.get('id', '9999999')}")
        dispute_amount_val = resource.get("dispute_amount", {}).get("value", "299.00")
        reason = resource.get("reason", "MERCHANDISE_OR_SERVICE_NOT_RECEIVED")
        buyer_name = resource.get("buyer", {}).get("name", "PayPal Customer")

        # 1. Carrier tracking via KERNEL
        carrier_proof = carrier_kernel.verify_tracking(
            carrier="UPS",
            recipient_name=buyer_name
        )

        # 2. Elastic precedent matching
        precedent = elastic_precedents.match_precedent(reason)

        # 3. Dynamic win score calculation
        win_score, breakdown = ai_evidence_studio.calculate_win_score(
            amount=float(dispute_amount_val),
            carrier_proof=carrier_proof,
            precedent=precedent,
            reason=reason
        )

        # 4. Draft formal evidence
        order_id = resource.get("order_id", "ORD-INCOMING-101")
        transaction_id = resource.get("transaction_id", "TRX-INCOMING-909")
        evidence = ai_evidence_studio.draft_evidence(
            dispute_id=dispute_id,
            order_id=order_id,
            transaction_id=transaction_id,
            amount=dispute_amount_val,
            item_name="Purchased Merchandise",
            buyer_name=buyer_name,
            carrier_proof=carrier_proof,
            precedent=precedent,
            reason=reason
        )

        new_dispute = Dispute(
            dispute_id=dispute_id,
            status="WAITING_FOR_SELLER_RESPONSE",
            dispute_amount=DisputeAmount(currency="USD", value=dispute_amount_val),
            reason=reason,
            seller_response_due_date=resource.get("seller_response_due_date", "2026-10-31T23:59:00Z"),
            order_id=order_id,
            transaction_id=transaction_id,
            buyer=Buyer(
                name=buyer_name,
                email=resource.get("buyer", {}).get("email", "buyer@example.com"),
                shipping_address=ShippingAddress(
                    line1="Verified Street",
                    city="San Jose",
                    state="CA",
                    postal_code="95131",
                    country_code="US"
                )
            ),
            item=Item(name="Purchased Merchandise", quantity=1, price=dispute_amount_val),
            carrier_proof=carrier_proof,
            win_score=win_score,
            win_score_breakdown=breakdown,
            elastic_precedent=precedent,
            ai_drafted_evidence=evidence
        )

        db.save(new_dispute)

        # Record in audit ledger
        audit_ledger.record_entry(
            dispute_id=dispute_id,
            actor_type="AI_AGENT",
            actor_id="copilot_webhook_listener",
            action="DISPUTE_WEBHOOK_RECEIVED",
            details=f"Received PayPal webhook {event_type}. AI drafted evidence with {win_score}% win probability."
        )

        # Notify merchant
        await zapier_service.trigger_dispute_notification(new_dispute)

        return {"status": "processed", "dispute_id": dispute_id}

    return {"status": "ignored", "event_type": event_type}
