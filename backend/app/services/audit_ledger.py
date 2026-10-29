import hashlib
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from ..models import AuditEntry, Actor

def compute_entry_hash(
    entry_id: str,
    dispute_id: str,
    timestamp: str,
    actor_type: str,
    actor_id: str,
    action: str,
    details: str,
    prev_hash: str
) -> str:
    """Computes an immutable SHA-256 block hash for an audit ledger record."""
    payload = f"{entry_id}|{dispute_id or ''}|{timestamp}|{actor_type}:{actor_id}|{action}|{details}|{prev_hash}"
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()

class CryptographicAuditLedger:
    def __init__(self):
        self._entries: List[AuditEntry] = []
        self._seed_default_ledger()

    def _seed_default_ledger(self):
        """Initializes the ledger with a cryptographic genesis block and sample entries."""
        genesis_prev = "0000000000000000000000000000000000000000000000000000000000000000"
        
        # Genesis / First entry
        e1_id = "AUD-99120"
        e1_dispute = "PP-D-1094821"
        e1_time = "2026-10-23T11:15:00.000Z"
        e1_actor_type = "AI_AGENT"
        e1_actor_id = "copilot_agent_v2"
        e1_action = "DRAFT_EVIDENCE_GENERATED"
        e1_details = "AI Agent retrieved carrier delivery proof (UPS tracking 1Z9999999999999999) via KERNEL and matched Elastic precedent PREC-88219 (96% win probability)."
        e1_hash = compute_entry_hash(e1_id, e1_dispute, e1_time, e1_actor_type, e1_actor_id, e1_action, e1_details, genesis_prev)

        e1 = AuditEntry(
            entryId=e1_id,
            disputeId=e1_dispute,
            timestamp=e1_time,
            actor=Actor(type=e1_actor_type, id=e1_actor_id),
            action=e1_action,
            details=e1_details,
            hash=e1_hash,
            prevHash=genesis_prev
        )

        # Second entry chained to first
        e2_id = "AUD-99121"
        e2_dispute = "PP-D-2049182"
        e2_time = "2026-10-23T12:05:30.000Z"
        e2_actor_type = "AI_AGENT"
        e2_actor_id = "copilot_agent_v2"
        e2_action = "DRAFT_EVIDENCE_GENERATED"
        e2_details = "AI Agent drafted unauthorized claim response citing PayPal Seller Protection Policy Section 11.2."
        e2_hash = compute_entry_hash(e2_id, e2_dispute, e2_time, e2_actor_type, e2_actor_id, e2_action, e2_details, e1_hash)

        e2 = AuditEntry(
            entryId=e2_id,
            disputeId=e2_dispute,
            timestamp=e2_time,
            actor=Actor(type=e2_actor_type, id=e2_actor_id),
            action=e2_action,
            details=e2_details,
            hash=e2_hash,
            prevHash=e1_hash
        )

        self._entries = [e1, e2]

    def get_latest_hash(self) -> str:
        if not self._entries:
            return "0000000000000000000000000000000000000000000000000000000000000000"
        return self._entries[-1].hash

    def record_entry(
        self,
        dispute_id: str,
        actor_type: str,
        actor_id: str,
        action: str,
        details: str
    ) -> AuditEntry:
        """Appends a new cryptographically chained block to the audit ledger."""
        now = datetime.now(timezone.utc).isoformat()
        entry_id = f"AUD-{len(self._entries) + 10001}"
        prev_hash = self.get_latest_hash()
        
        entry_hash = compute_entry_hash(
            entry_id=entry_id,
            dispute_id=dispute_id,
            timestamp=now,
            actor_type=actor_type,
            actor_id=actor_id,
            action=action,
            details=details,
            prev_hash=prev_hash
        )

        entry = AuditEntry(
            entryId=entry_id,
            disputeId=dispute_id,
            timestamp=now,
            actor=Actor(type=actor_type, id=actor_id),
            action=action,
            details=details,
            hash=entry_hash,
            prevHash=prev_hash
        )

        self._entries.append(entry)
        return entry

    def get_entries(self, dispute_id: str = None) -> List[AuditEntry]:
        if dispute_id:
            return [e for e in self._entries if e.disputeId == dispute_id]
        return list(self._entries)

    def verify_chain(self) -> Tuple[bool, Dict[str, Any]]:
        """
        Validates the integrity of the cryptographic chain.
        Returns (is_valid, validation_report).
        """
        if not self._entries:
            return True, {"valid": True, "checked_entries": 0, "message": "Ledger is empty"}

        expected_prev = "0000000000000000000000000000000000000000000000000000000000000000"
        for idx, entry in enumerate(self._entries):
            # Check previous hash link
            if entry.prevHash != expected_prev:
                return False, {
                    "valid": False,
                    "tampered_index": idx,
                    "entry_id": entry.entryId,
                    "error": f"Broken chain link at index {idx}: expected prevHash {expected_prev}, got {entry.prevHash}"
                }
            
            # Recalculate hash
            computed = compute_entry_hash(
                entry_id=entry.entryId,
                dispute_id=entry.disputeId or "",
                timestamp=entry.timestamp,
                actor_type=entry.actor.type,
                actor_id=entry.actor.id,
                action=entry.action,
                details=entry.details,
                prev_hash=entry.prevHash
            )

            if computed != entry.hash:
                return False, {
                    "valid": False,
                    "tampered_index": idx,
                    "entry_id": entry.entryId,
                    "error": f"Hash mismatch at index {idx}: stored {entry.hash}, calculated {computed}"
                }

            expected_prev = entry.hash

        return True, {
            "valid": True,
            "checked_entries": len(self._entries),
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "latest_hash": expected_prev
        }

audit_ledger = CryptographicAuditLedger()
