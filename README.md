# FinGenie

> **AI-powered financial intelligence at your fingertips.** Analyze PDFs, spreadsheets, and CSV files to uncover trends, risks, and insights in seconds.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104%2B-blue)](https://fastapi.tiangolo.com/)
[![Groq API](https://img.shields.io/badge/Groq-LLM-orange)](https://groq.com/)

---

## � What is FinGenie?

FinGenie is an intelligent document analysis platform that extracts financial insights using AI. Upload financial documents—PDFs, spreadsheets, CSVs—and get:

- **Instant AI summaries** of financial performance
- **Automated trend detection** across revenue, margins, and cash flow
- **Risk assessments** flagging operational vulnerabilities  
- **Interactive chat** to query your documents with grounded, factual answers

**No storage. No tracking. No overhead.** Documents are processed in-memory and discarded—your data never touches persistent storage.

---

## ✨ Key Features

<table>
<tr>
<td>

### 📊 Financial Analysis
- KPI extraction (revenue, margins, cash runway)
- Historical trend charting
- Multi-period comparisons
- AI-powered executive summary

</td>
<td>

### 📄 Multi-Format Support
- Native PDF extraction
- Excel (.xlsx, .xls) ingestion
- CSV data processing
- Clean data normalization

</td>
</tr>
<tr>
<td>

### ⚠️ Risk Insights
- Gross margin trend detection
- Cash runway analysis
- Operational burn flagging
- Weighted risk severity scoring

</td>
<td>

### 💬 Document Chat
- Ask questions about your data
- Get grounded, document-backed answers
- Conversational financial analysis
- No hallucination about missing data

</td>
</tr>
</table>

---

## �️ Screenshots

> Screenshots coming soon. For now, check the `/frontend/src/components/` directory for the UI architecture.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+ and Node.js 16+
- A Groq API key ([get one free here](https://console.groq.com))

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# or: source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
echo GROQ_API_KEY=your_key_here > .env

# Run the server
uvicorn main:app --reload
# Server running at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App running at http://localhost:5173
```

### First Time?
1. Open http://localhost:5173 in your browser
2. Upload a financial PDF or Excel file
3. Wait for analysis (5-15 seconds for Groq LLM)
4. Explore the dashboard—KPIs, trends, risks, chat

---

## 🎯 Who is FinGenie For?

- **Investors & Analysts** — Quickly understand financial positions of companies
- **Corporate Teams** — Analyze internal financials, performance reports, and audit documents
- **Financial Advisors** — Generate client insights from documents in seconds
- **Students & Researchers** — Learn financial analysis from real data
- **Anyone** handling PDF financials who wants AI-powered insights

---

## 💡 Why FinGenie?

| Challenge | FinGenie Solution |
|-----------|-------------------|
| Manual PDF reading takes hours | AI generates summaries in seconds |
| Spreadsheet modeling is tedious | Automatic KPI extraction and trend charting |
| Missed risks in financial data | Automated risk flagging with severity scoring |
| Complex financial documents | Native document parsing with readable summaries |
| Worried about data privacy | Zero-storage architecture; documents never persisted |

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React 19 + Vite)              │
│  ├─ Modern SPA with responsive dashboard                       │
│  ├─ Real-time component updates                                │
│  ├─ Secure credential handling (no client-side API keys)       │
│  └─ Error handling with friendly user messaging                │
└──────────────┬──────────────────────────────────────────────────┘
               │ HTTPS/REST API
┌──────────────▼──────────────────────────────────────────────────┐
│                    Backend (FastAPI + Python)                   │
│  ├─ High-performance async request handling                    │
│  ├─ File validation (magic signatures, size limits)            │
│  ├─ Data processing pipelines (parsing, transformation)        │
│  ├─ Timeout protection (45s analysis, 30s reports)            │
│  └─ Structured error handling & logging                        │
└──────────────┬──────────────────────────────────────────────────┘
               │ API Calls
┌──────────────▼──────────────────────────────────────────────────┐
│              LLM (Groq API - Llama 3.3 70B)                     │
│  ├─ Real-time financial data extraction                        │
│  ├─ Trend synthesis & risk analysis                            │
│  ├─ Document-grounded question answering                       │
│  └─ Zero external data leakage (request-based, not logged)    │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 19 + Vite | Modern, fast, excellent DX |
| **Backend** | FastAPI + Python 3.9+ | Async, high-performance, great API docs |
| **LLM** | Groq (Llama 3.3 70B) | Fast inference, no token limits, cost-effective |
| **Files** | PDF, XLSX, CSV | Universal financial document formats |
| **Testing** | pytest, pytest-asyncio | Async-aware, production-grade reliability |
| **Deployment** | Docker, Gunicorn, systemd | Flexible, scalable, secure |

---

## 🔒 Security & Privacy

FinGenie takes security seriously—see the full [SECURITY.md](SECURITY.md) for comprehensive details.

**Quick highlights:**
- ✅ **Zero persistent storage** — All data processed in-memory, never saved
- ✅ **No tracking** — No cookies, no external scripts, no behavioral logging
- ✅ **API key protection** — Credentials stored server-side in environment variables only
- ✅ **Input validation** — File signatures, size limits, schema enforcement
- ✅ **HTTPS-only** — TLS 1.2+ required for all production deployments
- ✅ **Responsible disclosure** — Security vulnerabilities reported via GitHub security advisories
- ⚠️ **Early-stage project** — Recommended for general use; conduct security review before processing highly sensitive data

**Privacy in a nutshell:** We don't store your documents. We don't collect personal data. We don't track you. That's it.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [Backend Deployment Guide](backend/DEPLOYMENT.md) | Production setup, Docker, Gunicorn, systemd, troubleshooting |
| [Frontend Deployment Guide](frontend/DEPLOYMENT.md) | Build optimization, deployment to Vercel/Netlify/AWS/Docker |
| [Security Policy](SECURITY.md) | Detailed security practices, threat model, responsible disclosure |
| [Backend API Docs](http://localhost:8000/docs) | Interactive Swagger UI (run backend first) |

### Running Tests
```bash
# Backend unit tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## 🗺️ Roadmap

### Current (v1.0)
- ✅ PDF, Excel, CSV analysis
- ✅ KPI extraction & charting
- ✅ Risk assessment engine
- ✅ Document chat interface
- ✅ Secure zero-storage architecture

### Planned
- 🔄 Batch file processing (multiple documents in one analysis)
- 🔄 Export reports as PDF/markdown
- 🔄 Shareable analysis links
- 🔄 Custom KPI definitions
- 🔄 Multi-user accounts and workspace management
- 🔄 Email digest of financial updates

### Considering
- Web-scraping for live stock data correlation
- Integration with accounting software APIs
- Advanced portfolio analytics
- Peer company comparison

Have ideas? [Open a GitHub issue](../../issues) or reach out.

---

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, features, or documentation:

1. **Fork** the repository
2. **Create a branch** (`git checkout -b feature/your-feature`)
3. **Make changes** and test thoroughly
4. **Commit** with clear messages
5. **Push** and **open a Pull Request**

### Development Guidelines
- Follow PEP 8 for Python; Prettier for JavaScript
- Write tests for new features
- Update documentation
- Keep commits atomic and descriptive

### Areas We'd Love Help With
- Backend: Additional file format support (Word, PowerPoint), database integration
- Frontend: Enhanced visualizations, accessibility improvements, mobile optimization
- Deployment: Kubernetes manifests, Terraform IaC, CI/CD pipelines
- Docs: Tutorials, case studies, API documentation

---

## 📄 License

FinGenie is released under the **MIT License**. See [LICENSE](LICENSE) for details.

You're free to use, modify, and distribute FinGenie in personal and commercial projects.

---

## 🙋 Support & Questions

- **Bug reports** — [GitHub Issues](../../issues)
- **Feature requests** — [GitHub Discussions](../../discussions)
- **Security issues** — [GitHub Security Advisories](../../security/advisories) (please don't create public issues)

---

## 🧠 Built By

FinGenie is an open-source project created to demonstrate how modern AI, clean architecture, and security-first design can solve real financial analysis problems.

**Interested in working together?** Check the code, and if you like what you see, reach out.

---

**Last updated:** April 18, 2026  
**Current version:** 1.0  
⭐ **If you find FinGenie useful, please star this repository!**
