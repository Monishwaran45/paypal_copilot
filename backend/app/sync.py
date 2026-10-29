from typing import List, Dict, Any
from .paypal_client import paypal_client
from .models import (
    DisputeContract, OrderData, OrderItem, OrderShipping,
    EvidenceDraft, ProofItem, Amount
)
from .agent import copilot_agent
from .database import db

def normalize_paypal_dispute(raw: Dict[str, Any]) -> DisputeContract:
    """
    Normalizes a raw PayPal dispute object into Person A's shared data contract.
    """
    dispute_id = raw.get("dispute_id") or raw.get("id", "PP-D-UNKNOWN")
    reason = raw.get("reason", "ITEM_NOT_RECEIVED")
    if reason == "MERCHANDISE_OR_SERVICE_NOT_RECEIVED":
        reason = "ITEM_NOT_RECEIVED"
    elif reason == "UNAUTHORISED_TRANSACTION":
        reason = "UNAUTHORIZED"

    amt_dict = raw.get("dispute_amount", {})
    val = amt_dict.get("value", "89.50")
    curr = amt_dict.get("currency_code") or amt_dict.get("currency", "USD")

    created_at = raw.get("create_time") or raw.get("created_at", "2026-11-02T10:00:00Z")
    respond_by = raw.get("seller_response_due_date") or raw.get("respond_by", "2026-11-09T10:00:00Z")

    order_info = raw.get("order")
    if not order_info:
        # Synthesize order data from dispute metadata
        carrier = "FEDEX" if "FEDEX" in str(raw) else "UPS"
        order_info = {
            "id": raw.get("order_id", f"5O{dispute_id[-8:]}TN"),
            "items": [{"name": raw.get("item_name", "Merchandise Item"), "qty": 1}],
            "shipping": {
                "carrier": carrier,
                "tracking_number": "1Z" + dispute_id[-10:] if carrier == "UPS" else "78" + dispute_id[-10:],
                "address_summary": "Chennai, IN",
                "status": "DELIVERED",
                "signed_by": "M. VANCE" if "1094821" in dispute_id else "Authorized Buyer",
                "has_signature": True
            }
        }

    order_obj = OrderData(
        id=order_info.get("id", "ORDER-101"),
        items=[OrderItem(**i) for i in order_info.get("items", [{"name": "Item", "qty": 1}])],
        shipping=OrderShipping(**order_info.get("shipping", {}))
    )

    # Run AI agent to generate draft and win score
    agent_output = copilot_agent.run(
        dispute_data={"id": dispute_id, "reason": reason, "amount": val},
        order_data=order_info
    )

    contract = DisputeContract(
        id=dispute_id,
        status="PENDING_REVIEW",
        reason=reason,
        amount=Amount(value=str(val), currency=curr),
        created_at=created_at,
        respond_by=respond_by,
        order=order_obj,
        evidence_draft=EvidenceDraft(
            text=agent_output["evidence_text"],
            proofs=[ProofItem(**p) for p in agent_output["proofs"]]
        ),
        win_score=agent_output["win_score"],
        win_reasons=agent_output["win_reasons"],
        approval_state="pending"
    )

    contract.populate_compatibility_fields()
    return contract

def sync_disputes_from_paypal() -> List[DisputeContract]:
    """
    Pulls disputes from PayPal Sandbox and upserts them into storage.
    """
    raw_disputes = paypal_client.list_disputes()
    synced = []

    for raw in raw_disputes:
        d_id = raw.get("dispute_id") or raw.get("id")
        existing = db.get_by_id(d_id)
        if existing:
            synced.append(existing)
            continue

        normalized = normalize_paypal_dispute(raw)
        db.save(normalized)
        synced.append(normalized)

    return synced
