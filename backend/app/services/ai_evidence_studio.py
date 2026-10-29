import os
from typing import Dict, Any, Tuple
from ..models import CarrierProof, ElasticPrecedent, WinScoreComponent
from ..config import settings

class AIEvidenceStudio:
    """
    AI Evidence Studio:
    Computes empirical dispute win rates, point-by-point score breakdown,
    and generates professional, policy-backed evidence drafts.
    """

    @classmethod
    def calculate_win_score(
        cls,
        amount: float,
        carrier_proof: CarrierProof,
        precedent: ElasticPrecedent,
        reason: str
    ) -> Tuple[int, Dict[str, WinScoreComponent]]:
        breakdown: Dict[str, WinScoreComponent] = {}
        score = 0

        # 1. Carrier delivery confirmation (+40)
        if carrier_proof and carrier_proof.carrier_verified and carrier_proof.status == "DELIVERED":
            pts = 40
            score += pts
            breakdown["carrier_delivery_verified"] = WinScoreComponent(
                points=pts,
                label=f"Carrier proof of delivery confirmed via KERNEL ({carrier_proof.carrier})",
                positive=True
            )

        # 2. Signature on file (+25)
        if carrier_proof and carrier_proof.has_signature:
            pts = 25
            score += pts
            breakdown["signature_on_file"] = WinScoreComponent(
                points=pts,
                label=f"Recipient signature on file ({carrier_proof.signed_by})",
                positive=True
            )

        # 3. Address match (+20)
        if carrier_proof and carrier_proof.delivery_address_verified:
            pts = 20
            score += pts
            breakdown["address_match"] = WinScoreComponent(
                points=pts,
                label="Delivery destination strictly matches PayPal confirmed shipping address",
                positive=True
            )

        # 4. Elastic precedent match (+12 to +15)
        precedent_pts = int(precedent.benchmark_win_rate * 15)
        score += precedent_pts
        breakdown["elastic_precedent"] = WinScoreComponent(
            points=precedent_pts,
            label=f"Elastic precedent ({precedent.precedent_id}) indicates {int(precedent.benchmark_win_rate * 100)}% historical success",
            positive=True
        )

        # 5. Risk deduction for high value orders
        if amount >= 750:
            deduction = -6
            score += deduction
            breakdown["risk_deduction"] = WinScoreComponent(
                points=deduction,
                label="Transaction over $750 requires signature confirmation under PayPal High-Value Policy",
                positive=False
            )
        else:
            deduction = -3
            score += deduction
            breakdown["risk_deduction"] = WinScoreComponent(
                points=deduction,
                label="Minor chargeback lifecycle risk deduction",
                positive=False
            )

        final_score = max(50, min(99, score))
        return final_score, breakdown

    @classmethod
    def draft_evidence(
        cls,
        dispute_id: str,
        order_id: str,
        transaction_id: str,
        amount: str,
        item_name: str,
        buyer_name: str,
        carrier_proof: CarrierProof,
        precedent: ElasticPrecedent,
        reason: str
    ) -> str:
        """
        Drafts a formal, legal dispute defense letter citing PayPal Seller Protection policies.
        """
        carrier_name = carrier_proof.carrier if carrier_proof else "Carrier"
        tracking_num = carrier_proof.tracking_number if carrier_proof else "N/A"
        kernel_ref = carrier_proof.kernel_audit_id if carrier_proof else "KERNEL-VERIFIED"
        signature_note = f'obtained with signature confirmation ("{carrier_proof.signed_by}")' if carrier_proof and carrier_proof.has_signature else "confirmed delivered to destination address"

        draft = (
            f"Dear PayPal Dispute Resolution Team,\n\n"
            f"We respectfully contest Dispute {dispute_id} regarding Order {order_id} "
            f"(Transaction {transaction_id}) for {item_name} (Amount: ${amount}).\n\n"
            f"1. PROOF OF SHIPMENT & DELIVERY:\n"
            f"The merchandise was dispatched promptly via {carrier_name} under tracking number {tracking_num} "
            f"to the buyer's verified PayPal shipping address on record.\n\n"
            f"2. INDEPENDENT CARRIER AUDIT (KERNEL VERIFICATION):\n"
            f"Carrier records confirm delivery was successfully completed on {carrier_proof.delivery_date[:10] if carrier_proof else 'record'} "
            f"and {signature_note}. Audit verification ref: {kernel_ref}.\n\n"
            f"3. PAYPAL SELLER PROTECTION POLICY SATISFACTION:\n"
            f"As documented above, all qualifying conditions under {precedent.policy_citation} have been conclusively satisfied. "
            f"The physical transit and delivery match all requirements necessary to qualify for comprehensive Seller Protection.\n\n"
            f"We kindly ask the PayPal Dispute Resolution Team to release the held funds and close this case in the merchant's favor.\n\n"
            f"Respectfully submitted,\n"
            f"Authorized Merchant Representative"
        )
        return draft

ai_evidence_studio = AIEvidenceStudio()
