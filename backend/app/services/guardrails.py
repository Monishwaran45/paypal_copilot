from typing import Optional
from fastapi import HTTPException
from ..config import settings

class GuardrailViolationException(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=403, detail=f"GUARDRAIL_VIOLATION: {detail}")

class SpendingLimitExceededException(HTTPException):
    def __init__(self, amount: float, limit: float):
        super().__init__(
            status_code=400,
            detail=f"SPENDING_LIMIT_EXCEEDED: Requested order amount (${amount:.2f}) exceeds autonomous limit of (${limit:.2f})"
        )

class GuardrailEngine:
    @staticmethod
    def validate_human_authorization(approver_id: Optional[str]) -> str:
        """
        Enforces strict Human-in-the-Loop authorization.
        Disputes and money settlements can NEVER be submitted autonomously by AI.
        """
        if not approver_id or approver_id.strip() == "":
            raise GuardrailViolationException(
                "Human seller signature/approver ID is mandatory before evidence can be submitted to PayPal."
            )
        
        # Block if an AI agent tries to pose as the final human approver
        forbidden_actors = ["ai", "copilot", "bot", "auto", "automated_agent", "copilot_agent_v2"]
        if any(f in approver_id.lower() for f in forbidden_actors):
            raise GuardrailViolationException(
                f"Autonomous identity '{approver_id}' is forbidden from signing dispute submissions. Only verified merchant humans may authorize settlement actions."
            )
        
        return approver_id.strip()

    @staticmethod
    def validate_spending_cap(unit_cost: float, quantity: int) -> float:
        """
        Enforces the Channel3 autonomous supply replenishment spending cap ($500.00).
        """
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than zero.")
        
        total = round(unit_cost * quantity, 2)
        if total > settings.CHANNEL3_SPEND_LIMIT_USD:
            raise SpendingLimitExceededException(total, settings.CHANNEL3_SPEND_LIMIT_USD)
        
        return total

guardrail_engine = GuardrailEngine()
