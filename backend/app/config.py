import os
from pathlib import Path

# Base directory for resolving relative paths like seed data
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------- PayPal (sandbox) ----------
PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com"
PAYPAL_TOKEN_PATH = "/v1/oauth2/token"
PAYPAL_DISPUTES_PATH = "/v1/customer/disputes"
PAYPAL_ORDERS_PATH = "/v2/checkout/orders"
PAYPAL_VERIFY_WEBHOOK_PATH = "/v1/notifications/verify-webhook-signature"
PAYPAL_WEBHOOK_EVENTS = [
    "CUSTOMER.DISPUTE.CREATED",
    "CUSTOMER.DISPUTE.UPDATED",
    "CUSTOMER.DISPUTE.RESOLVED",
]

# ---------- Hosting ----------
PUBLIC_BASE_URL = "http://127.0.0.1:8000"            # your deployed backend URL, used for the webhook
FRONTEND_ORIGIN = "http://localhost:5173"            # Person B's frontend URL, for CORS
WEBHOOK_PATH = "/webhooks/paypal"

# ---------- AI ----------
AI_PROVIDER = "groq"                                 # e.g. a free-tier provider. Verify current limits
AI_MODEL = "llama-3.3-70b-versatile"                 # pick from that provider's current free models
AI_MAX_RETRIES = 3
AI_TIMEOUT_SECONDS = 25                              # keep calls short, especially on serverless hosts
CACHE_AGENT_OUTPUTS = True                           # reuse a draft per dispute to save free-tier quota

# ---------- Search ----------
USE_ELASTIC = False                                  # flip to True after the Elastic trial is set up
ELASTIC_INDEX = "past_disputes"
SEED_FILE = str(BASE_DIR / "seed" / "past_disputes.json")
SIMILAR_CASES_TOP_K = 5

# ---------- App behavior ----------
DEMO_MODE = True                                     # True: use seeded fixtures when PayPal or AI is unavailable
SYNC_PAGE_SIZE = 20
DATABASE_URL = "sqlite:///./local.db"                # local only. On a host with ephemeral disk, use a hosted Postgres URL (TODO)


# ---------- Channel3 & Zapier (Extensions) ----------
CHANNEL3_SPEND_LIMIT_USD = 500.00
ZAPIER_DISPUTE_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/paypal-slack-demo"
ZAPIER_AUDIT_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/audit-sheets-demo"

class _SettingsProxy:
    CHANNEL3_SPEND_LIMIT_USD = CHANNEL3_SPEND_LIMIT_USD
    ZAPIER_DISPUTE_WEBHOOK_URL = ZAPIER_DISPUTE_WEBHOOK_URL
    ZAPIER_AUDIT_WEBHOOK_URL = ZAPIER_AUDIT_WEBHOOK_URL
    PAYPAL_BASE_URL = PAYPAL_BASE_URL
    PAYPAL_CLIENT_ID = "mock_paypal_client_id"
    PAYPAL_CLIENT_SECRET = "mock_paypal_secret"

settings = _SettingsProxy()
