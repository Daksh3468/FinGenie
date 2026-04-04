# FinGenie — AI Financial Document Analyzer

Upload PDFs, Excel, or CSV financial statements and get instant AI-powered insights: KPI calculations, risk detection, trend analysis, and plain-language summaries.

---

## Quick Start

### 1. Backend (FastAPI)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Set up your Groq API key
copy .env.example .env
# Edit .env and add your GROQ_API_KEY

# Start the server
uvicorn main:app --reload
# API runs at http://localhost:8000
# Docs at   http://localhost:8000/docs
```

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## Features

| Feature | Description |
|---|---|
| **File Upload** | PDF (text-based), Excel (.xlsx/.xls), CSV |
| **Auto-Detection** | Identifies Balance Sheet / Income Statement / Cash Flow |
| **KPIs** | Gross Profit Margin, Net Profit Margin, Revenue Growth, Expense Ratio, Burn Rate, Cash Runway |
| **Risk Flags** | High Expenses (>80%), Declining Revenue, Negative Cash Flow, Low Profitability |
| **AI Summary** | Plain-language explanation via Groq Llama 3.3 70B |
| **Charts** | Bar, Area/Line, Pie/Donut — all interactive via Recharts |
| **Dark Theme** | Glassmorphism design, gradient accents |

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/upload` | POST | Analyze a financial document |
| `/api/health` | GET | Health check |
| `/docs` | GET | Interactive API docs (Swagger) |

## Getting a Free Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Create an API key
4. Add it to `backend/.env` as `GROQ_API_KEY=gsk_...`
   — or enter it directly in the app's sidebar
