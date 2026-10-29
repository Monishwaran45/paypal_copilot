import pytest
from backend.app.main import (
    health, list_disputes, get_dispute, update_evidence,
    approve_dispute, reject_dispute, sync_disputes, get_timeline, get_audit
)
from backend.app.models import EvidenceUpdateRequest, ApproveRequest, RejectRequest
from backend.app.agent import copilot_agent
from backend.app.search import search_service
from backend.app.services.audit_ledger import audit_ledger
from backend.app.services.guardrails import guardrail_engine, GuardrailViolationException

def test_health():
    res = health()
    assert res["status"] == "ok"

def test_list_disputes():
    data = list_disputes()
    assert data["success"] is True
    assert len(data["disputes"]) >= 3
    first = data["disputes"][0]
    assert "id" in first
    assert "amount" in first
    assert "order" in first
    assert "evidence_draft" in first
    assert "win_score" in first
    assert "approval_state" in first

def test_get_dispute():
    data = get_dispute("PP-D-12345")
    assert data["success"] is True
    assert data["dispute"]["id"] == "PP-D-12345"

def test_update_evidence():
    req = EvidenceUpdateRequest(text="Updated evidence statement from test.")
    data = update_evidence("PP-D-12345", req)
    assert data["success"] is True
    assert data["dispute"]["evidence_draft"]["text"] == "Updated evidence statement from test."

def test_approve_dispute():
    req = ApproveRequest(
        approver_id="Authorized Merchant Manager",
        approval_secret="demo_approval_secret_hackathon_2026"
    )
    data = approve_dispute("PP-D-12345", req)
    assert data["success"] is True
    assert data["dispute"]["approval_state"] == "submitted"
    assert data["dispute"]["status"] == "UNDER_REVIEW"
    assert "audit" in data
    assert data["audit"]["action"] == "DISPUTE_EVIDENCE_SUBMITTED"

def test_ai_approver_blocked():
    with pytest.raises(GuardrailViolationException):
        guardrail_engine.validate_human_authorization("copilot_agent_v2")

def test_search_similar_cases():
    results = search_service.search_similar_cases(reason="ITEM_NOT_RECEIVED", item_name="mug", carrier="FEDEX", top_k=3)
    assert len(results) > 0
    assert results[0]["similarity_score"] > 0.50

def test_agent_run():
    dispute = {"id": "TEST-1", "reason": "ITEM_NOT_RECEIVED", "amount": "99.00"}
    order = {
        "id": "ORD-TEST",
        "items": [{"name": "Smart Watch", "qty": 1}],
        "shipping": {
            "carrier": "UPS",
            "tracking_number": "1Z9999",
            "address_summary": "Austin, TX",
            "status": "DELIVERED",
            "signed_by": "J. DOE",
            "has_signature": True
        }
    }
    output = copilot_agent.run(dispute, order)
    assert "evidence_text" in output
    assert "proofs" in output
    assert "win_score" in output
    assert 50 <= output["win_score"] <= 100
    assert len(output["win_reasons"]) > 0

def test_sync_disputes():
    res = sync_disputes()
    assert res["success"] is True
    assert res["synced_count"] >= 3

def test_timeline():
    res = get_timeline()
    assert res["success"] is True
    assert len(res["timeline"]) >= 3

def test_audit_ledger_chain_verification():
    is_valid, report = audit_ledger.verify_chain()
    assert is_valid is True
    assert report["valid"] is True
    assert report["checked_entries"] >= 2
