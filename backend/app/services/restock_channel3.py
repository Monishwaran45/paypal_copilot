import random
from typing import List, Dict, Any
from ..models import RestockItem
from .guardrails import guardrail_engine
from ..config import settings

class RestockChannel3Service:
    def __init__(self):
        self._items: Dict[str, RestockItem] = {}
        self._seed_default_items()

    def _seed_default_items(self):
        initial = [
            RestockItem(
                id="C3-INV-101",
                name="4x6 Direct Thermal Shipping Labels (500/roll)",
                category="Packaging",
                current_stock=4,
                safety_stock=10,
                unit_cost_usd=14.50,
                recommended_order_qty=15,
                urgency="HIGH",
                ai_recommendation_reason="Dispute velocity up 42% due to package tracking delays. Immediate restock prevents shipment stalls."
            ),
            RestockItem(
                id="C3-INV-102",
                name="Bubble Mailer Padded Envelopes #0 (Pack of 100)",
                category="Packaging",
                current_stock=12,
                safety_stock=20,
                unit_cost_usd=22.00,
                recommended_order_qty=10,
                urgency="MEDIUM",
                ai_recommendation_reason="Restock before upcoming weekend volume surge to maintain SLA fulfillment."
            ),
            RestockItem(
                id="C3-INV-103",
                name="Heavy-Duty Reinforced Packing Tape (6-Pack)",
                category="Shipping Supplies",
                current_stock=3,
                safety_stock=8,
                unit_cost_usd=18.50,
                recommended_order_qty=8,
                urgency="HIGH",
                ai_recommendation_reason="Carrier damage dispute defense requires reinforced sealing. Current supply critically low."
            ),
            RestockItem(
                id="C3-INV-104",
                name="ESD Anti-Static Component Bags (Pack of 50)",
                category="Electronics Protection",
                current_stock=45,
                safety_stock=30,
                unit_cost_usd=16.00,
                recommended_order_qty=0,
                urgency="LOW",
                ai_recommendation_reason="Sufficient inventory buffer. Restock not required at current sales velocity."
            )
        ]
        for itm in initial:
            self._items[itm.id] = itm

    def get_inventory(self) -> Dict[str, Any]:
        return {
            "spending_limit_usd": settings.CHANNEL3_SPEND_LIMIT_USD,
            "items": list(self._items.values())
        }

    def place_order(self, item_id: str, quantity: int, approver_id: str) -> Dict[str, Any]:
        if item_id not in self._items:
            raise KeyError(f"Restock item '{item_id}' not found.")
        
        item = self._items[item_id]
        total_usd = guardrail_engine.validate_spending_cap(item.unit_cost_usd, quantity)

        # Update stock
        item.current_stock += quantity
        if item.current_stock >= item.safety_stock:
            item.urgency = "LOW"
            item.recommended_order_qty = 0

        order_record = {
            "order_id": f"C3-ORD-{random.randint(1000, 9999)}",
            "item_id": item_id,
            "item_name": item.name,
            "quantity": quantity,
            "total_usd": total_usd,
            "status": "DISPATCHED",
            "approver_id": approver_id
        }
        return order_record

restock_channel3 = RestockChannel3Service()
