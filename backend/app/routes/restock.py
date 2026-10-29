from fastapi import APIRouter, HTTPException
from ..models import RestockOrderRequest
from ..services.restock_channel3 import restock_channel3
from ..services.guardrails import guardrail_engine

router = APIRouter(prefix="/api/restock", tags=["Channel3 Restock"])

@router.get("")
def get_inventory():
    data = restock_channel3.get_inventory()
    # Format items to dict
    return {
        "success": True,
        "data": {
            "spending_limit_usd": data["spending_limit_usd"],
            "items": [i.dict() for i in data["items"]]
        }
    }

@router.post("/order")
def order_supplies(payload: RestockOrderRequest):
    approver = guardrail_engine.validate_human_authorization(payload.approver_id)
    try:
        order = restock_channel3.place_order(
            item_id=payload.item_id,
            quantity=payload.quantity,
            approver_id=approver
        )
        return {"success": True, "order": order}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
