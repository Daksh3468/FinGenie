# FinGenie - Sovereign Financial Intelligence

**Institutional-grade financial synthesis for the modern enterprise.** FinGenie transforms raw data into high-fidelity "Financial Velocity" reports, leveraging ephemeral AI processing and a zero-retention security framework.

---

## 🏛️ Sovereign Intelligence Philosophy
FinGenie is built for the "Sovereign Intelligence" era—where data extraction must be local, processing must be ephemeral, and insights must be institutional-grade.

- **Zero-Retention Sandbox**: All data processing occurs in a volatile heap. No financial data is persisted to long-term storage.
- **Premium SaaS Aesthetic**: A unified, high-density UI designed for professional analysts. Features glassmorphic components, fluid micro-animations, and a cohesive design system centered around visual performance.
- **Financial Velocity**: Move beyond simple summaries into real-time trend synthesis and risk-matrix evaluation.

## 🚀 Capabilities & Architecture

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | High-performance, low-latency institutional UI with dynamic layout scaling |
| **Intelligence** | Groq (Llama 3.3 70B) | Ephemeral LLM extraction, trend synthesis, and interactive document querying |
| **Backend** | FastAPI | High-speed, stateless data ingestion pipeline |
| **Data Types** | PDF, XLSX, CSV, SEC XBRL ZIP | Handles standard financial files and deep SEC public filing datasets (10-K, 10-Q) |

## 📊 Core Modules

### 1. Financial Performance Pipeline
A radically streamlined analyzer dashboard moving from high-level KPIs -> Trend Charts -> AI Summaries -> Risk Vectors -> Raw Ledger Preview.

### 2. SEC XBRL Deep Integration
Natively ingest SEC filing ZIP packages (`sub.txt`, `num.txt`, `tag.txt`, `pre.txt`). FinGenie semantically translates dense technical tax tags into human-readable business logic without requiring manual spreadsheet alignment.

### 3. Risk Ledger & Trend Audit
Contextual risk detection that flags institutional vulnerabilities. Analyzes Gross Margin health, Cash Runway, and Operational Burn with weighted severity metrics alongside historical projection charts.

### 4. Interactive "DocChat" AI
Query your financial ledgers directly via a floating chat assistant. Ask questions like *"Explain the revenue trend"* or *"What's our most critical operational risk?"* and get contextual answers grounded exclusively in the analyzed document.

---

## 🛠️ Quick Start

### 1. Intelligence Ingestion (Backend)
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
# Add GROQ_API_KEY to .env
uvicorn main:app --reload
```

### 2. Interface Deployment (Frontend)
```bash
cd frontend
npm install
npm run dev
# App synchronized at http://localhost:5173
```

---

## 🔒 Security & Compliance
FinGenie is architected to exceed modern internal audit requirements:
- **Ephemeral Processing**: The analysis engine uses a "process-and-purge" cycle, ensuring your financial secrets stay yours.
- **No Manual Entry**: Upload fragmented statements and get structured, audit-ready data instantly. Skip the modeling grunt work.
- **Minimalist Footprint**: Zero external tracking scripts or cookies.

---
*© 2024 FINGENIE FINANCIAL UTILITIES. ALL RIGHTS RESERVED.*
