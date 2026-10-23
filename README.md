# PayPal AI Dispute Copilot

> **An AI dispute assistant for small PayPal sellers with strict human-in-the-loop guardrails.**

An intuitive, enterprise-grade merchant dashboard inspired by PayPal's Business Resolution Center and styled with clean, high-precision Uber-grade typography (**Plus Jakarta Sans**). The copilot analyzes incoming disputes, gathers carrier proof, computes empirical win probabilities, and drafts policy-backed evidence—always requiring human seller approval before any settlement action.

---

## Key Features

- **AG Grid Dispute Queue**: High-performance table with real-time dispute status badges, win-rate progress indicators, multi-field filtering, and sorting.
- **Response Deadline Radar**: Timeline view highlighting critical upcoming deadlines so time-sensitive disputes (< 24 hours) are resolved first.
- **AI Evidence Studio**: Automatically gathers carrier tracking proofs (KERNEL) and citations (Elastic), computes estimated win chances, and generates editable formal dispute responses.
- **Human-in-the-Loop Guardrail**: Protects merchant funds with mandatory human authorization. The AI drafts evidence, but money is never touched without explicit seller sign-off.
- **Cryptographic Audit Ledger**: Records each AI draft, merchant revision, and human authorization in an immutable, chained SHA-256 audit ledger.
- **Channel3 Supply Restock**: Predictive inventory replenishment for packaging materials to prevent fulfillment delay disputes, backed by an autonomous spending cap ($500).
- **Dispute Simulator**: Built-in test harness to instantly simulate incoming PayPal dispute webhook scenarios for live demos.

---

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Monishwaran45/paypal_copilot.git
cd paypal_copilot/frontend

# Install dependencies
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Production Build
```bash
npm run build
```
Creates an optimized production bundle in `frontend/dist`.

---

## Tech Stack

- **Framework**: React 18 & Vite
- **Data Grid**: AG Grid Community
- **Icons**: Lucide React
- **Typography**: Plus Jakarta Sans (Google Fonts) with tabular OpenType numerals
- **Styling**: Vanilla CSS (Tailored PayPal Business Theme)
- **State**: Self-contained client storage with persistent LocalStorage fallback

---

## License

This project is licensed under the [MIT License](LICENSE).
