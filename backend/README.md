# Person A: Backend, Agent & Data — PayPal AI Dispute Copilot

**Hackathon Track:** Build What's Next with PayPal and AI  
**Role:** Person A (Backend, Agent, Data)  
**Submission Date:** 13 Nov 2026 (Target: Thu 12 Nov 2026)

---

## 1. Overview & Architecture

When a buyer opens a PayPal dispute, this backend:
1. Receives the dispute webhook (or retrieves disputes via the `/sync` polling fallback).
2. Pulls dispute, order, and shipping carrier data from PayPal Sandbox.
3. Runs the **AI Dispute Copilot Agent** which searches similar past dispute precedents (via in-code search or Elastic Cloud), computes empirical win chances, and drafts factual, policy-backed evidence.
4. Enforces a strict in-code **Human-in-the-Loop Approval Gate** (`approval_state = 'pending'`). AI is blocked from submitting evidence or touching merchant money.
5. Only upon explicit human sign-off (protected by `APPROVAL_SECRET`), submits the evidence to PayPal Sandbox and logs the action into a chained SHA-256 cryptographic audit ledger.

```
┌─────────────────────────────────┐
│     PayPal Webhook / /sync      │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  Dispute Normalization Engine   │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐      ┌───────────────────────────────┐
│    AI Dispute Copilot Agent     │◄────▶│ Precedent Search (In-Code /   │
│  (Factual Draft + Win Estimate) │      │ Elastic Cloud past_disputes)  │
└────────────────┬────────────────┘      └───────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│   Human-in-the-Loop Gate        │
│   (Code-enforced approval state)│
└────────────────┬────────────────┘
                 │
       [Human Seller Signs Off]
                 │
                 ▼
┌─────────────────────────────────┐      ┌───────────────────────────────┐
│   Submit Evidence to PayPal     │─────▶│ Chained SHA-256 Audit Ledger  │
│   POST /v1/.../provide-evidence │      │ & Zapier Multi-Channel Alerts │
└─────────────────────────────────┘      └───────────────────────────────┘
```

---

## 2. Shared Data Contract (Agreed with Person B)

Every dispute adheres to this normalized JSON shape:

```json
{
  "id": "PP-D-12345",
  "status": "PENDING_REVIEW",
  "reason": "ITEM_NOT_RECEIVED",
  "amount": { "value": "89.50", "currency": "USD" },
  "created_at": "2026-11-02T10:00:00Z",
  "respond_by": "2026-11-09T10:00:00Z",
  "order": {
    "id": "5O190127TN364715T",
    "items": [{ "name": "Handmade ceramic mug", "qty": 2 }],
    "shipping": {
      "carrier": "FEDEX",
      "tracking_number": "123456789012",
      "address_summary": "Chennai, IN"
    }
  },
  "evidence_draft": {
    "text": "...",
    "proofs": [
      {
        "type": "PROOF_OF_FULFILLMENT",
        "source": "carrier_page",
        "summary": "Delivered 2026-10-30"
      }
    ]
  },
  "win_score": 78,
  "win_reasons": [
    "Online tracking shows delivery via FEDEX",
    "Similar cases won with delivery proof"
  ],
  "approval_state": "pending"
}
```

*Valid `approval_state` values:* `pending`, `approved`, `rejected`, `submitted`.

---

## 3. Ground Rules & Secrets Management

- **All secrets live in ONE file: `backend/app/secrets.py`.**
- `backend/app/secrets.py` is strictly **GITIGNORED** and must never be committed.
- An example template `backend/app/secrets.example.py` is committed for reference.

### Setting Up Secrets:
```bash
cp backend/app/secrets.example.py backend/app/secrets.py
```
Fill in:
- `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`: From PayPal Developer Sandbox app
- `PAYPAL_WEBHOOK_ID`: From the PayPal sandbox webhook configuration
- `AI_API_KEY`: Groq, OpenAI, or Gemini free-tier API key
- `APPROVAL_SECRET`: Secret token used to protect the merchant approval endpoint
- `ELASTIC_URL` & `ELASTIC_API_KEY`: (Optional) When `USE_ELASTIC = True`

---

## 4. REST API Endpoints (For Person B & Frontend)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/disputes` | List disputes with optional `?status=` filter |
| `GET` | `/disputes/{id}` | Full dispute detail conforming to shared contract |
| `PATCH` | `/disputes/{id}/evidence` | Save seller edits to evidence draft |
| `POST` | `/disputes/{id}/approve` | **Approval Gate**: Human signs off, submits to PayPal |
| `POST` | `/disputes/{id}/reject` | Reject draft / concede claim |
| `POST` | `/sync` | Force pull/refresh from PayPal Sandbox |
| `GET` | `/timeline` | Dispute response deadlines sorted chronologically |
| `GET` | `/audit` | SHA-256 chained audit ledger and integrity report |
| `POST` | `/webhooks/paypal` | PayPal webhook receiver (signature verification + deduplication) |
| `POST` | `/disputes/simulate` | Demo test harness to simulate incoming PayPal dispute |

---

## 5. Quick Start (Local Development)

### 1. Requirements
- Python 3.11+
- Virtual Environment

### 2. Install Dependencies
```bash
python -m pip install -r backend/requirements.txt
```

### 3. Run the Backend API
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API docs available at: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

### 4. Run Test Suite
```bash
python -m pytest backend/tests -v -p no:asyncio
```

---

## 6. Sponsor Tools & Integrations

- **PayPal Sandbox REST API**: OAuth2 authentication, dispute resolution API (`/v1/customer/disputes`), and webhook signature verification (`/v1/notifications/verify-webhook-signature`).
- **Elastic Search**: Precedent search over synthetic dispute datasets (`backend/seed/past_disputes.json`), toggled via `USE_ELASTIC = False` (in-code fallback for maximum reliability).
- **Groq / Llama 3.3**: Agentic evidence drafting using few-shot prompt guardrails that strictly prohibit hallucinating tracking or documents.
- **Zapier**: Dispatches Slack alerts on incoming dispute and logs audit entries directly into Google Sheets.
