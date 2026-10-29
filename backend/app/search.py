import json
import os
from typing import List, Dict, Any
from .config import USE_ELASTIC, ELASTIC_INDEX, SEED_FILE, SIMILAR_CASES_TOP_K

try:
    from .secrets import ELASTIC_URL, ELASTIC_API_KEY
except ImportError:
    ELASTIC_URL = ""
    ELASTIC_API_KEY = ""

class DisputeSearchService:
    def __init__(self):
        self._seed_cases = self._load_seed_cases()

    def _load_seed_cases(self) -> List[Dict[str, Any]]:
        """Loads seeded historical dispute fixtures."""
        if os.path.exists(SEED_FILE):
            try:
                with open(SEED_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[Search] Error loading seed file: {e}")
        return []

    def search_similar_cases(self, reason: str, item_name: str = "", carrier: str = "", top_k: int = SIMILAR_CASES_TOP_K) -> List[Dict[str, Any]]:
        """
        Searches past dispute precedents.
        Supports in-code ranking (default) and Elastic Cloud when USE_ELASTIC=True.
        """
        if USE_ELASTIC and ELASTIC_URL and ELASTIC_API_KEY:
            try:
                return self._search_elastic(reason, item_name, top_k)
            except Exception as e:
                print(f"[Search] Elastic query failed, falling back to in-code search: {e}")

        return self._search_incode(reason, item_name, carrier, top_k)

    def _search_incode(self, reason: str, item_name: str, carrier: str, top_k: int) -> List[Dict[str, Any]]:
        """In-code weighted similarity matcher over past disputes."""
        scored = []
        target_reason = (reason or "").upper()
        target_words = set((item_name or "").lower().split())

        for case in self._seed_cases:
            score = 0.0

            # Match reason (major weight: 60%)
            case_reason = (case.get("reason") or "").upper()
            if case_reason == target_reason:
                score += 0.60
            elif "NOT_RECEIVED" in case_reason and "NOT_RECEIVED" in target_reason:
                score += 0.50

            # Match carrier (weight: 20%)
            if carrier and (case.get("carrier") or "").upper() == carrier.upper():
                score += 0.20

            # Match item keywords (weight: 20%)
            case_words = set((case.get("item_name") or "").lower().split())
            if target_words and case_words:
                overlap = len(target_words.intersection(case_words))
                score += min(0.20, overlap * 0.10)

            # Baseline similarity for relevant pool
            similarity = round(min(0.99, max(0.40, score + 0.35)), 2)

            result = dict(case)
            result["similarity_score"] = similarity
            scored.append((similarity, result))

        # Sort by similarity descending
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]

    def _search_elastic(self, reason: str, item_name: str, top_k: int) -> List[Dict[str, Any]]:
        """Placeholder for Elastic query when trial is configured."""
        import httpx
        headers = {"Authorization": f"ApiKey {ELASTIC_API_KEY}", "Content-Type": "application/json"}
        query = {
            "size": top_k,
            "query": {
                "bool": {
                    "should": [
                        {"match": {"reason": {"query": reason, "boost": 3.0}}},
                        {"match": {"item_name": item_name}}
                    ]
                }
            }
        }
        with httpx.Client(timeout=4.0) as client:
            res = client.post(f"{ELASTIC_URL}/{ELASTIC_INDEX}/_search", headers=headers, json=query)
            if res.status_code == 200:
                hits = res.json().get("hits", {}).get("hits", [])
                results = []
                for h in hits:
                    doc = h.get("_source", {})
                    doc["similarity_score"] = round(min(0.99, h.get("_score", 1.0) / 10.0), 2)
                    results.append(doc)
                return results
        return self._search_incode(reason, item_name, "", top_k)

search_service = DisputeSearchService()
