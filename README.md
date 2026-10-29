# PayPal AI Dispute Copilot

> **An AI dispute assistant for small PayPal sellers with strict human-in-the-loop guardrails.**
> **Hackathon:** Build What's Next with PayPal and AI  
> **Submission Date:** 13 Nov 2026 (Aim to submit Thu 12 Nov)

An intuitive, enterprise-grade merchant dashboard inspired by PayPal's Business Resolution Center and styled with high-precision typography (**Plus Jakarta Sans**). The copilot analyzes incoming disputes, gathers carrier proof, computes empirical win probabilities, and drafts policy-backed evidence—**strictly requiring human seller approval** before any settlement action or submission to PayPal.

---

## Architecture Overview

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

## Key Features

- **AG Grid Dispute Queue**: High-performance table with real-time dispute status badges, win-rate progress indicators, multi-field filtering, and sorting.
- **Response Deadline Radar**: Timeline view highlighting critical upcoming deadlines so time-sensitive disputes (< 24 hours) are resolved first.
- **AI Evidence Studio**: Gathers carrier tracking proofs, matches legal precedents, computes estimated win chances, and generates editable formal dispute responses.
- **Human-in-the-Loop Guardrail**: Protects merchant funds with mandatory human authorization (`approval_state = 'pending'`). AI is strictly blocked in code from autonomously submitting disputes.
- **Cryptographic Audit Ledger**: Records each AI draft, merchant revision, and human authorization in an immutable, chained SHA-256 audit ledger.
- **Channel3 Supply Restock**: Predictive inventory replenishment for packaging materials to prevent fulfillment delay disputes, backed by an autonomous spending cap ($500).
- **Dispute Simulator**: Built-in test harness to instantly simulate incoming PayPal dispute webhook scenarios for live demos.

---

## Shared Data Contract (Person A & Person B)

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
    "shipping": { "carrier": "FEDEX", "tracking_number": "123456789012", "address_summary": "Chennai, IN" }
  },
  "evidence_draft": {
    "text": "...",
    "proofs": [{ "type": "PROOF_OF_FULFILLMENT", "source": "carrier_page", "summary": "Delivered 2026-10-30" }]
  },
  "win_score": 78,
  "win_reasons": ["Tracking shows delivery", "Similar cases won with delivery proof"],
  "approval_state": "pending"
}
```

*Valid `approval_state` values:* `pending`, `approved`, `rejected`, `submitted`.

---

## Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/Vijajraj/paypal_copilot.git
cd paypal_copilot
```

### 2. Configure Secrets (Backend)
All secrets live in one file: `backend/app/secrets.py` (which is **gitignored**).
```bash
cp backend/app/secrets.example.py backend/app/secrets.py
```
Fill in your PayPal Sandbox credentials and keys in `backend/app/secrets.py`.

### 3. Install & Start Backend
```bash
python -m pip install -r backend/requirements.txt
python run_backend.py
```
The FastAPI backend starts at **[http://127.0.0.1:8000](http://127.0.0.1:8000)** (docs at `/docs`).

### 4. Install & Start Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Testing & Verification

Run the automated test suite verifying Person A endpoints, guardrail gates, search, and agent logic:
```bash
python -m pytest backend/tests -v -p no:asyncio
```

---

## Sponsor Tools Used

- **PayPal Sandbox REST API**: Dispute resolution API (`/v1/customer/disputes`), webhook verification (`/v1/notifications/verify-webhook-signature`), and OAuth2 client credentials authentication.
- **Elastic Cloud**: Precedent search over synthetic dispute datasets (`backend/seed/past_disputes.json`), with in-code fallback (`USE_ELASTIC = False`).
- **Groq / Llama 3.3**: Agentic evidence drafting using few-shot prompt guardrails that strictly prohibit inventing tracking or documents.
- **AG Grid Community**: High-performance merchant data grid with sorting, filtering, and custom cell renderers.
- **Zapier**: Dispatches Slack alerts on incoming disputes and logs approved entries directly into Google Sheets.

---

## Repository Layout

```
├── backend/
│   ├── app/
│   │   ├── main.py              # REST API endpoints & CORS
│   │   ├── config.py            # Hardcoded settings (no secrets)
│   │   ├── secrets.example.py   # Committed secrets template
│   │   ├── secrets.py           # GITIGNORED local secrets
│   │   ├── models.py            # Pydantic dispute data contract
│   │   ├── agent.py             # AI Dispute Copilot Agent
│   │   ├── search.py            # Precedent search (in-code & Elastic)
│   │   ├── paypal_client.py     # PayPal Sandbox client
│   │   ├── sync.py              # Polling sync fallback
│   │   ├── webhooks.py          # PayPal webhook receiver
│   │   ├── database.py          # Seeded storage
│   │   └── services/            # Guardrails, audit ledger, carrier verification
│   ├── seed/
│   │   └── past_disputes.json   # 30 synthetic dispute precedent fixtures
│   ├── tests/
│   │   └── test_disputes_and_agent.py
│   └── requirements.txt
├── frontend/                    # React 18 + Vite + AG Grid UI
│   ├── apiClient.js             # Connects to backend with mock fallback
│   └── vite.config.js           # API proxy configuration
├── run_backend.py               # Backend startup entrypoint
├── LICENSE
└── README.md
```

---

## License

This project is licensed under the [MIT License](LICENSE).
