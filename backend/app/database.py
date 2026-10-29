from typing import List, Dict, Optional
from .models import (
    DisputeContract, Amount, OrderData, OrderItem, OrderShipping,
    EvidenceDraft, ProofItem
)

class InMemoryDatabase:
    def __init__(self):
        self._disputes: Dict[str, DisputeContract] = {}
        self._seed_default_disputes()

    def _seed_default_disputes(self):
        # Case 1: Matching Person A Spec v3 contract example
        d1 = DisputeContract(
            id="PP-D-12345",
            status="PENDING_REVIEW",
            reason="ITEM_NOT_RECEIVED",
            amount=Amount(value="89.50", currency="USD"),
            created_at="2026-11-02T10:00:00Z",
            respond_by="2026-11-09T10:00:00Z",
            order=OrderData(
                id="5O190127TN364715T",
                items=[OrderItem(name="Handmade ceramic mug", qty=2)],
                shipping=OrderShipping(
                    carrier="FEDEX",
                    tracking_number="123456789012",
                    address_summary="Chennai, IN",
                    status="DELIVERED",
                    delivery_date="2026-10-30T14:00:00Z",
                    signed_by="Authorized Recipient",
                    has_signature=True
                )
            ),
            evidence_draft=EvidenceDraft(
                text=(
                    "Dear PayPal Dispute Resolution Team,\n\n"
                    "We respectfully contest Dispute PP-D-12345 regarding Order 5O190127TN364715T for Handmade ceramic mug ($89.50).\n\n"
                    "1. PROOF OF SHIPMENT & DELIVERY:\n"
                    "The merchandise was dispatched via FedEx (Tracking: 123456789012) and successfully delivered on October 30, 2026.\n\n"
                    "2. CARRIER VERIFICATION:\n"
                    "FedEx records confirm full delivery with recipient signature on file.\n\n"
                    "3. SELLER PROTECTION:\n"
                    "All requirements under PayPal Seller Protection Policy Section 11.3 have been satisfied.\n\n"
                    "Respectfully submitted,\nAuthorized Merchant Representative"
                ),
                proofs=[
                    ProofItem(type="PROOF_OF_FULFILLMENT", source="carrier_page", summary="Delivered 2026-10-30 to Chennai, IN"),
                    ProofItem(type="RECIPIENT_SIGNATURE", source="carrier_signature", summary="Signature on file")
                ]
            ),
            win_score=78,
            win_reasons=["Tracking shows delivery", "Similar cases won with delivery proof"],
            approval_state="pending"
        )
        d1.populate_compatibility_fields()

        # Case 2: Sony Alpha Camera High Value
        d2 = DisputeContract(
            id="PP-D-1094821",
            status="WAITING_FOR_SELLER_RESPONSE",
            reason="ITEM_NOT_RECEIVED",
            amount=Amount(value="849.50", currency="USD"),
            created_at="2026-10-20T08:30:00Z",
            respond_by="2026-10-24T08:30:00Z",
            order=OrderData(
                id="ORD-99321",
                items=[OrderItem(name="Sony Alpha a7 IV Mirrorless Camera Body", qty=1)],
                shipping=OrderShipping(
                    carrier="UPS",
                    tracking_number="1Z9999999999999999",
                    address_summary="742 Evergreen Terrace, Springfield, OR 97477",
                    status="DELIVERED",
                    delivery_date="2026-10-20T14:22:10Z",
                    signed_by="M. VANCE",
                    has_signature=True
                )
            ),
            evidence_draft=EvidenceDraft(
                text=(
                    "Dear PayPal Dispute Resolution Team,\n\n"
                    "We respectfully contest Dispute PP-D-1094821 regarding Order ORD-99321 (Transaction TRX-71049281A) for Sony Alpha a7 IV ($849.50).\n\n"
                    "1. PROOF OF SHIPMENT & DELIVERY:\n"
                    "The order was dispatched promptly via UPS tracking number 1Z9999999999999999 to the verified shipping address.\n\n"
                    "2. DIRECT SIGNATURE PROOF:\n"
                    "Per PayPal high-value policy requirements (> $750), an adult Direct Signature was obtained from buyer: 'M. VANCE'.\n\n"
                    "3. POLICY COMPLIANCE:\n"
                    "All conditions under PayPal Seller Protection Policy Section 11.3 are satisfied.\n\n"
                    "Respectfully submitted,\nAuthorized Merchant Representative"
                ),
                proofs=[
                    ProofItem(type="PROOF_OF_FULFILLMENT", source="carrier_page", summary="Delivered 2026-10-20 to Springfield, OR"),
                    ProofItem(type="RECIPIENT_SIGNATURE", source="carrier_signature", summary="Direct signature obtained: M. VANCE")
                ]
            ),
            win_score=94,
            win_reasons=["Direct signature on file", "Carrier GPS confirms postal code match", "96% win rate on similar precedent"],
            approval_state="pending"
        )
        d2.populate_compatibility_fields()

        # Case 3: Bose Headphones Unauthorized claim
        d3 = DisputeContract(
            id="PP-D-2049182",
            status="WAITING_FOR_SELLER_RESPONSE",
            reason="UNAUTHORIZED",
            amount=Amount(value="129.99", currency="USD"),
            created_at="2026-10-18T11:05:00Z",
            respond_by="2026-10-23T23:59:00Z",
            order=OrderData(
                id="ORD-88102",
                items=[OrderItem(name="Bose QuietComfort 45 Wireless Headphones", qty=1)],
                shipping=OrderShipping(
                    carrier="FEDEX",
                    tracking_number="782910492811",
                    address_summary="1204 Pine Hollow Way, Austin, TX 78704",
                    status="DELIVERED",
                    delivery_date="2026-10-18T11:05:00Z",
                    signed_by="S. JENKINS",
                    has_signature=True
                )
            ),
            evidence_draft=EvidenceDraft(
                text=(
                    "Dear PayPal Claims Team,\n\n"
                    "We dispute the unauthorized claim for Order ORD-88102.\n\n"
                    "1. CONFIRMED ADDRESS FULFILLMENT:\n"
                    "The merchandise was shipped to the buyer's PayPal registered address in Austin, TX.\n\n"
                    "2. CARRIER AUDIT:\n"
                    "FedEx tracking 782910492811 confirms delivery prior to claim filing.\n\n"
                    "3. SECTION 11.2 PROTECTION:\n"
                    "Transactions delivered to confirmed account addresses qualify for full unauthorized claim defense.\n\n"
                    "Respectfully submitted,\nAuthorized Merchant Representative"
                ),
                proofs=[
                    ProofItem(type="PROOF_OF_FULFILLMENT", source="carrier_page", summary="Delivered to Austin, TX 78704")
                ]
            ),
            win_score=91,
            win_reasons=["Delivered to account confirmed shipping address", "91% win rate on unauthorized precedents"],
            approval_state="pending"
        )
        d3.populate_compatibility_fields()

        self._disputes[d1.id] = d1
        self._disputes[d2.id] = d2
        self._disputes[d3.id] = d3

    def get_all(self, status: Optional[str] = None) -> List[DisputeContract]:
        disputes = list(self._disputes.values())
        if status:
            return [d for d in disputes if d.status == status or d.approval_state == status]
        return disputes

    def get_by_id(self, dispute_id: str) -> Optional[DisputeContract]:
        return self._disputes.get(dispute_id)

    def save(self, dispute: DisputeContract) -> DisputeContract:
        dispute.populate_compatibility_fields()
        self._disputes[dispute.id] = dispute
        return dispute

db = InMemoryDatabase()
