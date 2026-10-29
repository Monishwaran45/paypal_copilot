from typing import Optional
from fastapi import APIRouter, Query
from ..services.audit_ledger import audit_ledger

router = APIRouter(prefix="/api/audit", tags=["Cryptographic Audit Ledger"])

@router.get("")
def get_audit_trail(dispute_id: Optional[str] = Query(None)):
    entries = audit_ledger.get_entries(dispute_id)
    is_valid, report = audit_ledger.verify_chain()
    # Return newest first to match frontend expectation
    reversed_entries = [e.dict() for e in reversed(entries)]
    return {
        "success": True,
        "count": len(reversed_entries),
        "audit_trail": reversed_entries,
        "ledger_integrity": report
    }

@router.get("/verify")
def verify_ledger():
    is_valid, report = audit_ledger.verify_chain()
    return {
        "success": is_valid,
        "ledger_integrity": report
    }
