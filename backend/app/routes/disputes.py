import random
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from ..models import (
    DisputeContract, Amount, OrderData, OrderItem, OrderShipping,
    EvidenceDraft, ProofItem, EvidenceUpdateRequest, ApproveRequest,
    RejectRequest, SimulateRequest
)
from ..database import db
from ..services.guardrails import guardrail_engine
from ..services.audit_ledger import audit_ledger
from ..services.carrier_kernel import carrier_kernel
from ..services.elastic_precedents import elastic_precedents
from ..services.ai_evidence_studio import ai_evidence_studio
from ..services.zapier_service import zapier_service
from ..agent import copilot_agent

router = APIRouter(prefix="/api/disputes", tags=["Disputes"])

@router.post("/simulate")
async def simulate_dispute(payload: SimulateRequest):
    """
    Dispute Simulator (Person B test harness):
    Simulates an incoming PayPal dispute event, creates the order and carrier proof,
    runs the AI copilot agent to draft evidence, and records in the audit ledger.
    """
    new_id = f"PP-D-{random.randint(4000000, 9999999)}"
    due_hours = payload.due_hours or 48
    due_date = (datetime.now(timezone.utc) + timedelta(hours=due_hours)).isoformat()
    amount_str = f"{float(payload.amount or '450.00'):.2f}"
    item_name = payload.item_name or "USB-C Dual 4K Pro Docking Station"
    buyer_name = payload.buyer_name or "Alexander Wright"
    carrier_name = payload.carrier or "UPS"
    reason = payload.reason or "ITEM_NOT_RECEIVED"
    order_id = f"ORD-{random.randint(10000, 99999)}"
    tracking_num = f"1Z{random.randint(1000000000, 9999999999)}"

    order_info = {
        "id": order_id,
        "items": [{"name": item_name, "qty": 1}],
        "shipping": {
            "carrier": carrier_name,
            "tracking_number": tracking_num,
            "address_summary": "120 Market Street, Seattle, WA 98101",
            "status": "DELIVERED",
            "delivery_date": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
            "signed_by": buyer_name.upper(),
            "has_signature": True
        }
    }

    order_obj = OrderData(
        id=order_id,
        items=[OrderItem(name=item_name, qty=1)],
        shipping=OrderShipping(**order_info["shipping"])
    )

    # Run AI copilot agent
    agent_output = copilot_agent.run(
        dispute_data={"id": new_id, "reason": reason, "amount": amount_str},
        order_data=order_info
    )

    new_dispute = DisputeContract(
        id=new_id,
        status="WAITING_FOR_SELLER_RESPONSE",
        reason=reason,
        amount=Amount(value=amount_str, currency="USD"),
        created_at=datetime.now(timezone.utc).isoformat(),
        respond_by=due_date,
        order=order_obj,
        evidence_draft=EvidenceDraft(
            text=agent_output["evidence_text"],
            proofs=[ProofItem(**p) for p in agent_output["proofs"]]
        ),
        win_score=agent_output["win_score"],
        win_reasons=agent_output["win_reasons"],
        approval_state="pending"
    )
    new_dispute.populate_compatibility_fields()
    db.save(new_dispute)

    # Record AI draft generation in audit ledger
    audit_ledger.record_entry(
        dispute_id=new_id,
        actor_type="AI_AGENT",
        actor_id="copilot_agent_v2",
        action="DRAFT_EVIDENCE_GENERATED",
        details=f"AI Agent drafted evidence for dispute {new_id} ({carrier_name} {tracking_num}) with {new_dispute.win_score}% win probability."
    )

    # Trigger Zapier notification alert
    await zapier_service.trigger_dispute_notification(new_dispute)

    return {"success": True, "dispute": new_dispute.dict()}
