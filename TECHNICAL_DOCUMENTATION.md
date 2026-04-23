# FinGenie Technical Documentation

**Complete Architecture, Feature Guide & Code Analysis**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Breakdown](#architecture-breakdown)
3. [File & Folder Structure](#file--folder-structure)
4. [Core Concepts & Data Models](#core-concepts--data-models)
5. [Feature-by-Feature Working](#feature-by-feature-working)
6. [Upload & Analysis Pipeline](#upload--analysis-pipeline)
7. [LLM Integration & Prompts](#llm-integration--prompts)
8. [Frontend Routing & State Management](#frontend-routing--state-management)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Function-Level Documentation](#function-level-documentation)
11. [Data Flow Diagrams](#data-flow-diagrams)
12. [Architecture Assessment & Improvements](#architecture-assessment--improvements)

---

## Project Overview

### What is FinGenie?

**FinGenie** is an intelligent financial document analysis platform that leverages AI to extract actionable insights from financial documents. Users upload PDFs, spreadsheets, or SEC filings and receive instant analysis including:

- **KPI Extraction** - Automatically calculated metrics (revenue, margins, cash runway)
- **Risk Flagging** - Identifies financial vulnerabilities (low profitability, high burn rate, declining revenue)
- **Trend Detection** - Analyzes changes across multiple periods
- **AI Summaries** - Plain-language financial explanations powered by Groq LLM
- **Interactive Chat** - Question-answering about uploaded documents
- **Multiple Report Formats** - Executive, investor, audit, board, startup, and academic reports

### Core Business Use Case

FinGenie targets:
- **Startup Founders** - Understanding financial health and runway
- **Finance Analysts** - Fast extraction of metrics without manual spreadsheet work
- **Students** - Learning financial analysis with AI guidance
- **Investors** - Quick assessment of financial statements
- **Auditors** - Compliance-focused financial review

### Key Principles

1. **No Data Retention** - Documents processed in-memory, never stored
2. **Zero Configuration** - No signup, API keys, or setup needed
3. **Format Flexibility** - Supports PDFs, Excel, CSV, and raw text with automatic statement type detection
4. **AI-Powered Accessibility** - Makes financial data understandable to non-experts
5. **Privacy-First** - Stateless architecture, immediate data disposal

---

## Architecture Breakdown

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Frontend (React 19)                              │
│  Home → Analyzer → Chat → Reports → Trends → Risks → Compliance        │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓ HTTP/REST
┌────────────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend (Python)                           │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       API Routers                                 │   │
│  │  • /api/upload (POST)      - File upload & analysis             │   │
│  │  • /api/chat/message (POST) - Document Q&A                      │   │
│  │  • /api/report/generate (POST) - Report generation              │   │
│  │  • /api/health (GET)       - Service status                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  ↓                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Core Services                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │   │
│  │  │  parser.py   │  │ kpi_engine   │  │ llm_analyzer │           │   │
│  │  │              │  │              │  │              │           │   │
│  │  │ • Validates  │  │ • Computes   │  │ • Generates  │           │   │
│  │  │ • Parses     │  │   KPIs       │  │   summaries  │           │   │
│  │  │ • Extracts   │  │ • Detects    │  │ • Crafts     │           │   │
│  │  │   tables     │  │   risks      │  │   narratives │           │   │
│  │  │             │  │ • Detects    │  │             │           │   │
│  │  │             │  │   trends     │  │             │           │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │   │
│  │  │ doc_chat.py  │  │sec_processor │  │report_gen...│           │   │
│  │  │              │  │              │  │              │           │   │
│  │  │ • Builds doc │  │ • Joins XBRL │  │ • Generates │           │   │
│  │  │   context    │  │   datasets   │  │   formatted │           │   │
│  │  │ • Handles    │  │ • Maps tags  │  │   reports   │           │   │
│  │  │   Q&A        │  │ • Pivots     │  │             │           │   │
│  │  │             │  │   data       │  │             │           │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │   │
│  │  ┌──────────────────┐                                             │   │
│  │  │ structurer.py    │                                             │   │
│  │  │ • LLM-based text │                                             │   │
│  │  │   extraction     │                                             │   │
│  │  └──────────────────┘                                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  ↓                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │           External API - Groq LLM (llama-3.3-70b)               │   │
│  │  • 70B parameter foundational model                            │   │
│  │  • Used for: summaries, chat, report generation                │   │
│  │  • Temperature: 0.1-0.3 for consistency                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

**Framework**: React 19 with Vite + TypeScript

**Component Hierarchy**:
```
App (Router, State Management)
├── Home (File Upload & Hero)
│   └── FileUpload (Dropzone UI)
├── Analyzer (Results Display)
│   ├── KPICards (Metric Display)
│   ├── TrendChart (Historical Analysis)
│   ├── AISummary (AI Narrative)
│   ├── RiskCards (Risk Visualization)
│   ├── Recommendations (Action Items)
│   └── DataPreview (Raw Data Table)
├── DocChat (Floating Chat Widget)
├── ReportCenter (Report Generation)
├── TrendsAudit (Trend Visualization)
├── RiskAssessment (Risk Analysis)
├── About (Info Page)
├── Compliance (Legal)
├── Privacy (Data Policy)
└── Terms (ToS)
```

**Routing Strategy**: Hash-based routing (`#home`, `#analyzer`, `#chat`, etc.)

**State Management**: Lifted state in App component
- `activeTab` - Current page
- `result` - Cached analysis results
- `isLoading` - Upload/processing state
- `error` - Error messages

### Backend Architecture

**Framework**: FastAPI (Python async)

**Core Layers**:

1. **API Layer** (`routers/`)
   - `analysis.py` - Upload & analyze endpoint
   - `chat.py` - Document Q&A endpoint
   - `report.py` - Report generation endpoint

2. **Business Logic Layer** (`services/`)
   - File parsing & validation
   - Financial metric computation
   - LLM communication
   - Data extraction & processing

3. **Data Layer** (`models/`)
   - Pydantic schemas for type safety
   - Structured requests/responses

4. **Configuration** (`config.py`, `.env`)
   - Environment variables
   - CORS settings
   - API keys

### API Flow

```
User Upload
    ↓
POST /api/upload (file)
    ↓
FileValidation (size, type, magic bytes)
    ↓
Parse File (PDF/Excel/CSV) → Detect Statement Type
    ↓
IF Mode == Text (no tables from PDF):
    → LLM Data Extraction (structurer.py)
    ↓
Validate: Has financial data? (guard check)
    ✗ If no data → HTTPException 422
    ✓ If has data → continue
    ↓
Compute KPIs (revenue, margins, cash runway, etc.)
    ↓
Detect Risks (low profitability, high burn, declining revenue)
    ↓
Detect Trends (directional changes across periods)
    ↓
Generate AI Summary (via Groq LLM)
    ↓
Return AnalysisResponse
    (kpis, risks, trends, summary, recommendations, raw_data)
    ↓
Frontend Displays Results
    ↓
User can:
    • Chat about data (POST /api/chat/message)
    • Generate reports (POST /api/report/generate)
    • Export/Download results
```

---

## File & Folder Structure

### Backend Structure

```
backend/
├── main.py                          # FastAPI app entry point
├── config.py                        # Configuration & logging setup
├── requirements.txt                 # Python dependencies
├── pytest.ini                       # Pytest configuration
│
├── models/
│   ├── __init__.py
│   └── schemas.py                   # Pydantic data models
│
├── routers/
│   ├── __init__.py
│   ├── analysis.py                  # POST /api/upload endpoint
│   ├── chat.py                      # POST /api/chat/message endpoint
│   └── report.py                    # POST /api/report/generate endpoint
│
├── services/
│   ├── __init__.py
│   ├── parser.py                    # File validation & parsing (PDF/Excel/CSV/SEC)
│   ├── kpi_engine.py                # KPI computation & risk/trend detection
│   ├── llm_analyzer.py              # AI summary generation
│   ├── groq_client.py               # Groq API client factory
│   ├── doc_chat.py                  # Document Q&A logic
│   ├── sec_processor.py             # SEC XBRL dataset processing
│   ├── report_generator.py          # Report narrative generation
│   └── structurer.py                # LLM-based text data extraction
│
└── tests/
    ├── __init__.py
    ├── test_parser.py               # File validation tests
    ├── test_kpi_engine.py           # KPI calculation tests
    └── test_schemas.py              # Model validation tests
```

### Frontend Structure

```
frontend/
├── package.json                     # Dependencies (React, Lucide, Axios)
├── vite.config.js                   # Vite bundler config
├── tsconfig.json                    # TypeScript config
├── index.html                       # Entry HTML
│
├── src/
│   ├── main.jsx                     # React entry point
│   ├── App.jsx                      # Root component & routing
│   ├── index.css                    # Global styles
│   ├── style.css                    # Component styles
│   ├── App.css                      # App-level styles
│   │
│   ├── api/
│   │   └── client.js                # Axios HTTP client & API functions
│   │
│   ├── components/
│   │   ├── Home.jsx                 # Landing page & file upload
│   │   ├── FileUpload.jsx           # Dropzone component
│   │   ├── Analyzer.jsx             # Results dashboard
│   │   ├── KPICards.jsx             # KPI metric display
│   │   ├── TrendChart.jsx           # Trend visualization
│   │   ├── AISummary.jsx            # AI summary narrative
│   │   ├── RiskCards.jsx            # Risk cards display
│   │   ├── Recommendations.jsx      # Action items
│   │   ├── DataPreview.jsx          # Raw data table
│   │   ├── DocChat.jsx              # Floating chat widget
│   │   ├── ReportCenter.jsx         # Report generation UI
│   │   ├── TrendsAudit.jsx          # Trend analysis page
│   │   ├── RiskAssessment.jsx       # Risk analysis page
│   │   ├── Compliance.jsx           # Compliance info
│   │   ├── Privacy.jsx              # Privacy policy
│   │   ├── Terms.jsx                # Terms of service
│   │   └── About.jsx                # About page
│   │
│   └── assets/
│       └── [images, icons]
│
└── public/
    └── [static assets]
```

### File-by-File Explanation

#### **backend/main.py**

**Purpose**: Application entry point and middleware setup

**Key Components**:
- FastAPI app creation with metadata
- CORS middleware configuration (reads `ALLOWED_ORIGINS` from env)
- Global exception handler (returns structured error responses)
- Router includes (analysis, chat, report)
- Root health check endpoint

**Why It Exists**: Centralizes app configuration and ensures all routers are properly registered

**Key Functions**:
- `global_exception_handler()` - Catches unhandled exceptions and returns JSON error responses

---

#### **backend/config.py**

**Purpose**: Centralized configuration management

**What It Does**:
- Sets up logging (structured format with timestamps)
- Reads environment variables (`GROQ_API_KEY`, `ALLOWED_ORIGINS`)
- Provides configuration constants

**Key Variables**:
- `GROQ_API_KEY` - API key for Groq LLM
- `ALLOWED_ORIGINS` - CORS whitelist (defaults to localhost:5173)

---

#### **backend/models/schemas.py**

**Purpose**: Pydantic data validation models

**Key Models**:

```python
KPI
  - name: str (e.g., "Gross Profit Margin")
  - value: Optional[float] (numeric value)
  - formatted_value: str (human-readable, e.g., "42.5%")
  - trend: str ("up", "down", "stable")
  - status: str ("good", "warning", "danger")
  - description: str (explanation)

Risk
  - risk: str (risk title)
  - severity: str ("low", "medium", "high", "critical")
  - description: str (detailed explanation)
  - mitigation: Optional[str] (action steps)

Trend
  - metric: str (metric name, e.g., "Revenue Growth Rate")
  - direction: str ("up", "down", "stable")
  - magnitude: Optional[float] (percentage change)
  - period: str (time range, e.g., "2023 → 2024")

AnalysisResponse
  - statement_type: str
  - raw_data: list[dict] (table rows)
  - column_headers: list[str]
  - kpis: list[KPI]
  - risks: list[Risk]
  - trends: list[Trend]
  - summary: str (AI narrative)
  - recommendations: list[str]
  - parsing_mode: str ("table", "text")
  - raw_text: Optional[str] (if PDF with no tables)
```

---

#### **backend/routers/analysis.py**

**Purpose**: Main upload & analysis endpoint

**Endpoint**: `POST /api/upload`

**Flow**:
1. Receive file upload
2. Parse file (determine mode: table/text/sec_zip)
3. Extract financial data
4. Compute KPIs, risks, trends
5. Generate AI summary & recommendations
6. Return complete AnalysisResponse

**Key Imports**: 
- `parse_file()` - Route to correct parser
- `compute_kpis()`, `detect_risks()`, `detect_trends()` - Analysis functions
- `generate_summary()` - LLM-powered summary
- `process_sec_datasets()` - SEC XBRL processing

**Error Handling**: Converts exceptions to structured JSON errors with 500 status

---

#### **backend/routers/chat.py**

**Purpose**: Document Q&A endpoint

**Endpoint**: `POST /api/chat/message`

**Request Body**:
```python
ChatRequest
  - session_id: str (user session identifier)
  - user_message: str (question)
  - raw_data: list[dict] (from analysis)
  - column_headers: list[str]
  - statement_type: str
  - summary: str (AI summary)
  - kpis: list[dict]
  - risks: list[dict]
  - conversation_history: list[dict] (prior messages)
```

**Flow**:
1. Build document context from passed analysis data
2. Send user message + full conversation to LLM
3. Return assistant reply
4. Update conversation history (limited to 20 messages)

**Why This Design**: Keeps conversation context in frontend state; backend is stateless

---

#### **backend/routers/report.py**

**Purpose**: Generate formatted reports from analysis

**Endpoint**: `POST /api/report/generate`

**Supported Formats**:
- `executive` - C-suite brief (400 words)
- `investor` - Growth-focused memo (450 words)
- `audit` - Formal risk audit (500 words)
- `board` - Governance update (400 words)
- `startup` - Pitch narrative (380 words)
- `academic` - Research paper (550 words)

**Flow**:
1. Receive analysis data + format choice
2. Build Groq prompt with specific format instructions
3. Call LLM to generate report
4. Return markdown text + word count

---

#### **backend/services/parser.py**

**Purpose**: File validation and parsing

**Supported Formats**:
- PDF (pdfplumber extraction)
- Excel (.xlsx, .xls)
- CSV
- Text (.txt)

Note: SEC XBRL (ZIP) files are now handled separately in the routers layer, not in parse_file()

**Key Functions**:

`validate_file(file: UploadFile) → bytes`
- Checks extension against whitelist
- Validates file size (max 200MB)
- Verifies magic signatures (binary file type verification)

`detect_statement_type(df: pd.DataFrame) → str`
- Analyzes financial keywords in the DataFrame
- Classifies as: "Balance Sheet", "Income Statement", "Cash Flow Statement", or "Financial Statement"
- Uses keyword-based heuristics (e.g., "revenue", "net income" → Income Statement)
- Returns most likely type based on keyword score

`parse_pdf(content: bytes) → tuple[DataFrame | None, str | None, str]`
- Extracts tables using pdfplumber
- Falls back to raw text extraction
- Returns `(dataframe, raw_text, mode)` where mode is "table" or "text"

`parse_excel(content: bytes) → pd.DataFrame`
- Reads first sheet with data
- Cleans and normalizes

`parse_csv(content: bytes) → pd.DataFrame`
- Simple CSV parsing via pandas

`parse_file(file: UploadFile) → tuple[DataFrame | None, str | None, str, str]`
- Main entry point that routes to correct parser
- Returns `(df, raw_text, mode, statement_type)`
  - `df`: Parsed DataFrame
  - `raw_text`: Raw text (only if mode="text")
  - `mode`: "table" or "text"
  - `statement_type`: Auto-detected statement type ("Balance Sheet", "Income Statement", etc.)

`clean_dataframe(df: pd.DataFrame) → pd.DataFrame`
- Removes empty rows/columns
- Converts to numeric types where possible
- Cleans column names

`_parse_number(val) → float | None`
- Helper function to parse numbers from various formats
- Handles currency symbols ($, €, £, ₹)
- Handles parentheses as negatives: (123) → -123
- Handles percentages, commas, spaces
- Returns None for unparseable values

---

#### **backend/services/kpi_engine.py**

**Purpose**: Financial metric computation and analysis

**Key Functions**:

`compute_kpis(df: pd.DataFrame, statement_type: str) → list[KPI]`

Calculates financial KPIs:
1. **Gross Profit Margin** = (Revenue - COGS) / Revenue × 100
   - Status: "good" if > 40%, "warning" if > 20%, "danger" otherwise
   
2. **Net Profit Margin** = Net Income / Revenue × 100
   - Status: "good" if > 10%, "warning" if > 5%, "danger" otherwise

3. **Revenue Growth Rate** = (Current - Previous) / Previous × 100
   - Status: "good" if > 5%, "warning" if >= 0%, "danger" if negative

4. **Expense Ratio** = Total Expenses / Revenue × 100
   - Status: "good" if < 60%, "warning" if < 80%, "danger" otherwise

5. **Burn Rate (Monthly)** = Monthly Expenses - Monthly Revenue
   - Status: "danger" if positive (cash burn), "good" if negative (cash generation)

6. **Cash Runway** = Cash on Hand / Net Burn Rate (months)
   - Status: "good" if > 12 months, "warning" if > 6 months, "danger" otherwise

**Fallback**: If specific fields not found, computes generic numeric summaries

---

`detect_risks(kpis: list[KPI], df: pd.DataFrame) → list[Risk]`

Flags financial risks based on KPI thresholds:
- **High Expenses** - Expense ratio > 80%
- **Low Profitability** - Net margin < 5%
- **Declining Revenue** - Negative growth
- **Negative Cash Flow** - Positive burn rate
- **Low Cash Runway** - < 6 months (critical if < 3)

---

`detect_trends(df: pd.DataFrame) → list[Trend]`

Identifies directional changes in metrics:
- Calculates percentage change from first to last period
- Classifies as "up" (>2%), "down" (<-2%), or "stable"
- Formats trend description with metric name and period range

---

`_extract_financial_figures(df: pd.DataFrame) → dict`

Core extraction logic:
- Searches DataFrame for known financial metrics using keyword matching
- Maps to standardized names (e.g., "Revenue", "Total Revenue", "Sales" → "revenue")
- Extracts numeric columns as periods
- Returns `{metric_name: {period: value, ...}, ...}`

---

#### **backend/services/llm_analyzer.py**

**Purpose**: Generate AI-powered financial summaries

**Function**: `generate_summary(df, statement_type, kpis, risks, trends) → dict`

**Prompt Structure**:
1. Document context (financial data, KPIs, risks, trends)
2. Task instructions (write as if explaining to non-finance person)
3. Format specifications (JSON with summary, recommendations, risk mitigations)

**Output Format** (Strict JSON):
```json
{
  "summary": "2-3 paragraph plain-language explanation...",
  "recommendations": [
    "Specific actionable recommendation with measurable outcome",
    "Another concrete action..."
  ],
  "risk_mitigations": {
    "Exact Risk Name": "Step-by-step mitigation protocol...",
    "Another Risk": "..."
  }
}
```

**LLM Configuration**:
- Model: llama-3.3-70b-versatile
- Temperature: 0.3 (lower = more consistent)
- Max tokens: 2000
- Timeout: 45 seconds

**Key Feature**: Parses JSON response and strips markdown code blocks if present

---

#### **backend/services/groq_client.py**

**Purpose**: Singleton Groq API client factory

**Function**: `get_groq_client() → Groq`
- Reads `GROQ_API_KEY` from environment
- Returns configured Groq client instance
- Used by all services (no duplication)

**Variable**: `GROQ_MODEL = "llama-3.3-70b-versatile"` (single point of change)

---

#### **backend/services/doc_chat.py**

**Purpose**: Document Q&A logic

**Functions**:

`build_doc_context(raw_data, column_headers, statement_type, summary, kpis, risks) → str`
- Compiles document analysis into single formatted context string
- Includes: document type, data table preview, KPIs, risks, summary
- Used as "system context" for chat

`chat_with_document(user_message, conversation_history, doc_context) → str`
- Sends user question + full conversation history to Groq
- System prompt instructs LLM to:
  - Answer ONLY using provided document data
  - Translate financial jargon
  - Use analogies and real-world examples
  - Be honest about missing data
- Returns assistant reply string

**Conversation Limit**: 20 messages (10 turns) to avoid token overflow

---

#### **backend/services/sec_processor.py**

**Purpose**: SEC XBRL dataset processing

**SEC Files**:
- **SUB.txt** - Submission metadata (company name, CIK, form type, period)
- **NUM.txt** - Numeric values (tags, dates, amounts)
- **TAG.txt** - Tag definitions
- **PRE.txt** - Presentation context (labels, line numbers, report types)

**Function**: `process_sec_datasets(sub_df, num_df, tag_df, pre_df) → tuple[pd.DataFrame, dict]`

**Steps**:
1. Find most recent submission (by period)
2. Filter all datasets by target ADSH (submission ID)
3. Join NUM + TAG + PRE datasets
4. Map XBRL tags to human-readable terms (e.g., "SalesRevenueNet" → "Total Revenue")
5. Pivot data into time-series format (metrics × periods)
6. Return master DataFrame + metadata

**Semantic Tag Map**: Maps XBRL tags to standardized financial terms
- Income Statement: Revenues, COGS, Operating Income, Net Income, EPS
- Balance Sheet: Assets, Cash, Liabilities, Equity, Retained Earnings
- Cash Flow: Operating, Investing, Financing activities

---

#### **backend/services/report_generator.py**

**Purpose**: Generate formatted financial reports

**Supported Formats** (6 templates):

| Format | Audience | Style | Length |
|--------|----------|-------|--------|
| `executive` | C-suite | Concise, decision-ready | 400 words |
| `investor` | Investors | Growth-focused, positive framing | 450 words |
| `audit` | Auditors | Conservative, compliance-focused | 500 words |
| `board` | Board members | Balanced, governance-focused | 400 words |
| `startup` | Fundraisers | Energetic, momentum-forward | 380 words |
| `academic` | Researchers | Formal, acknowledges limitations | 550 words |

**Function**: `generate_report(analysis_result, format_id) → str`
- Builds prompt from analysis data + format template
- Calls Groq to generate markdown report
- Returns formatted report text

---

#### **backend/services/structurer.py**

**Purpose**: LLM-based data extraction from unstructured text

**Function**: `extract_data_from_text(text: str) → tuple[pd.DataFrame, str]`

**When Used**: PDF with no tables (text-only documents)

**LLM Task**:
1. Identify statement type (Balance Sheet, Income Statement, Cash Flow)
2. Extract all financial line items
3. Standardize metric names (e.g., "Sales" → "Total Revenue")
4. Handle unit conversions (thousands, millions)
5. Structure as nested JSON

**Output**: 
```json
{
  "statement_type": "Income Statement",
  "data": {
    "Total Revenue": {"2023": 1500000, "2022": 1200000},
    "Cost of Goods Sold": {"2023": 900000, "2022": 720000},
    ...
  }
}
```

**Conversion to DataFrame**:
- Transpose nested dict to rows (metrics) × columns (periods)
- Return as pandas DataFrame for downstream processing

---

### Frontend Files

#### **frontend/src/api/client.js**

**Purpose**: HTTP client and API functions

**Exports**:

`uploadAndAnalyze(file) → Promise<AnalysisResponse>`
- POST /api/upload with multipart form data
- Timeout: 10 minutes (for large SEC datasets)

`healthCheck() → Promise<HealthResponse>`
- GET /api/health

`getApiBase() → string`
- Returns API base URL from `VITE_API_BASE_URL` env or localhost:8000

---

#### **frontend/src/App.jsx**

**Purpose**: Root component with routing and state management

**State Variables**:
- `activeTab` - Current page (home, analyzer, chat, etc.)
- `result` - Cached analysis response
- `isLoading` - Upload in progress
- `error` - Error message

**Routing**: Hash-based (`window.location.hash`)
- Special handling for page reloads (clears deep links)
- Scroll-to-top on tab change

**Functions**:
- `navigateTo(tab)` - Update hash and state
- `handleFileSelect(file)` - Trigger upload
- `handleAnalyzeNew()` - Reset state and go to home

**Navigation Menu**:
- Home, About, Analyzer, Trends, Risk, Reports
- Privacy, Compliance, Terms (footer)

---

#### **frontend/src/components/Home.jsx**

**Purpose**: Landing page and file upload

**Sections**:
1. Hero section with upload CTA
2. Feature cards (no manual entry, automated anomalies, etc.)
3. Trust signals (no signup, encrypted, zero retention)
4. Technical specs (supported formats, processing modes)

**Imports**: FileUpload component, Lucide icons

---

#### **frontend/src/components/FileUpload.jsx**

**Purpose**: Dropzone file upload component

**Features**:
- Drag-and-drop support
- File type validation (PDF, XLSX, CSV, ZIP)
- Max size: 200MB
- Visual feedback (active state, success state, loading state)
- Error display

**Accepted Types**:
```javascript
{
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
  'application/zip': ['.zip'],
}
```

---

#### **frontend/src/components/Analyzer.jsx**

**Purpose**: Results dashboard after upload

**Sections** (in order):
1. Page header with statement type and parsing mode
2. KPICards - Grid of financial metrics
3. Main grid (8/4 columns):
   - Left (8 cols): TrendChart + AISummary
   - Right (4 cols): RiskCards + Recommendations
4. DataPreview - Full raw data table

**Props**: `result` object from analysis

---

#### **frontend/src/components/DocChat.jsx**

**Purpose**: Floating chat widget for document Q&A

**Features**:
- Fixed position (bottom-right)
- Open/close toggle
- Message history display
- Suggestion buttons
- Loading state with spinner
- Auto-scroll to latest message

**Request Format**:
```javascript
{
  session_id: string,
  user_message: string,
  raw_data: array,
  column_headers: array,
  statement_type: string,
  summary: string,
  kpis: array,
  risks: array,
  conversation_history: array
}
```

---

#### **frontend/src/components/Analyzer-related Components**

- **KPICards.jsx** - Grid display of KPI objects with color-coded status
- **TrendChart.jsx** - Line/bar chart visualization of trends
- **AISummary.jsx** - Renders AI-generated summary text
- **RiskCards.jsx** - Card-style risk display with severity badges
- **Recommendations.jsx** - Bulleted list of action items
- **DataPreview.jsx** - Paginated table view of raw data

---

#### **frontend/src/components/ReportCenter.jsx**

**Purpose**: Report generation UI

**Features**:
- Format selector dropdown
- Generate button
- Report preview/download
- Word count display
- Multiple export formats

---

#### **frontend/src/components/TrendsAudit.jsx, RiskAssessment.jsx**

**Purpose**: Detailed views for trends and risks

**Features**:
- Full-page analysis
- Historical charting
- Comparative analysis
- Mitigation strategies (if available)

---

#### **frontend/src/components/Compliance.jsx, Privacy.jsx, Terms.jsx, About.jsx**

**Purpose**: Legal and informational pages

---

---

## Core Concepts & Data Models

### KPI (Key Performance Indicator)

A financial metric extracted and computed from the uploaded document.

**Structure**:
```python
{
  "name": "Gross Profit Margin",
  "value": 42.5,                    # numeric value for calculations
  "formatted_value": "42.5%",       # human-readable display
  "trend": "up",                    # directional indicator
  "status": "good",                 # health status
  "description": "..."              # explanation
}
```

**Common KPIs Calculated**:
1. **Gross Profit Margin** - (Revenue - COGS) / Revenue
2. **Net Profit Margin** - Net Income / Revenue
3. **Revenue Growth Rate** - Period-over-period % change
4. **Expense Ratio** - Total Expenses / Revenue
5. **Burn Rate (Monthly)** - Monthly deficit
6. **Cash Runway** - Months until cash depletion

---

### Risk

A financial vulnerability flagged based on KPI thresholds.

**Structure**:
```python
{
  "risk": "Low Cash Runway",
  "severity": "critical",           # low, medium, high, critical
  "description": "At current burn rate, cash runs out in ~3 months...",
  "mitigation": "1) Immediate action... 2) Short-term... 3) Long-term..."
}
```

**Risk Detection Logic**:
- Expense Ratio > 80% → "High Expenses"
- Net Margin < 5% → "Low Profitability"
- Revenue Growth < 0% → "Declining Revenue"
- Burn Rate > 0 → "Negative Cash Flow"
- Cash Runway < 6 months → "Low Cash Runway"

---

### Trend

A directional change in a metric across time periods.

**Structure**:
```python
{
  "metric": "Revenue Growth Rate",
  "direction": "up",                # up, down, stable
  "magnitude": 12.5,                # percentage change
  "period": "2023 → 2024"
}
```

---

### Analysis Result

The complete response from `/api/upload` - contains all extracted and computed data.

```python
{
  "statement_type": "Income Statement",
  "raw_data": [                     # raw table rows
    {"Total Revenue": 1500000, "Cost of Goods Sold": 900000, ...},
    ...
  ],
  "column_headers": ["Total Revenue", "Cost of Goods Sold", ...],
  "kpis": [...],                    # list of KPI objects
  "risks": [...],                   # list of Risk objects
  "trends": [...],                  # list of Trend objects
  "summary": "Plain language 2-3 paragraph explanation...",
  "recommendations": [              # 3-6 actionable items
    "Reduce monthly operating expenses by 15%...",
    "Implement weekly revenue tracking...",
    ...
  ],
  "parsing_mode": "table",          # table, text, or sec
  "raw_text": null                  # if mode == text, raw text content
}
```

---

## Feature-by-Feature Working

### Feature 1: File Upload & Analysis

**User Flow**:
1. User opens Home page
2. Drags/drops or selects file (PDF/Excel/CSV)
3. Frontend validates file type and size
4. Sends file to `POST /api/upload`

**Backend Processing**:
```
1. Validate file (extension, size, magic bytes)
2. Parse file and detect statement type:
   IF file is PDF:
     → parse_pdf() → if no tables, structurer.py (LLM extraction)
   ELSE IF file is Excel:
     → parse_excel()
   ELSE IF file is CSV:
     → parse_csv()
   → detect_statement_type() → classify as Balance Sheet/Income Statement/Cash Flow
3. Validate financial data exists (guard check)
4. Compute KPIs
5. Detect Risks
5. Detect Trends
6. Generate AI Summary (Groq)
7. Return AnalysisResponse
```

**Response Time**: 5-15 seconds depending on file size and LLM latency

---

### Feature 2: AI Summary & Recommendations

**How It Works**:
1. After analysis, `generate_summary()` is called
2. Sends formatted prompt to Groq with:
   - KPIs (formatted with status indicators)
   - Risks (with severity levels)
   - Trends
   - Raw data preview
3. Groq generates response in strict JSON format
4. Summary written for "non-finance person"
5. Recommendations are specific and actionable (not generic advice)
6. Risk mitigations linked to detected risks (exact name matching)

**Example Recommendation** (GOOD):
> "Reduce monthly operating expenses by 15% through vendor renegotiation and subscription audit to extend cash runway from 6 to 9 months"

**Example Recommendation** (BAD - too vague):
> "Review expenses regularly"

---

### Feature 3: Interactive Document Chat

**How It Works**:
1. User types question in floating chat widget
2. Question + full conversation history sent to `POST /api/chat/message`
3. Backend builds document context (table preview, KPIs, risks, summary)
4. System prompt instructs LLM to:
   - Answer ONLY from document data
   - Avoid hallucination
   - Explain financial terms simply
5. Assistant reply returned and added to history

**Example Exchanges**:
- Q: "What does gross profit margin mean?"
  A: Explains in plain language, with company's specific metric
- Q: "Should I be worried about the cash runway?"
  A: References specific runway value, discusses implications
- Q: "What should I do about declining revenue?"
  A: Suggests actions based on document data, not generic advice

**Conversation Limit**: Last 20 messages (to stay within token limits)

---

### Feature 4: Report Generation

**User Flow**:
1. User selects report format from dropdown
2. Clicks "Generate Report"
3. Frontend sends `/api/report/generate` with:
   - Entire analysis result
   - Chosen format ID
4. Backend generates report via Groq (format-specific prompt)
5. Returns markdown text
6. Frontend displays and allows download

**6 Format Options**:

| Format | Use Case | Tone | Key Sections |
|--------|----------|------|--------------|
| Executive | C-suite brief | Decisive, concise | Finding, Impact, Immediate Actions |
| Investor | Pitch to investors | Optimistic, growth-focused | Opportunity, Traction, Risks, Ask |
| Audit | Compliance review | Conservative, detailed | Summary, Findings, Risk Register |
| Board | Board meeting | Formal, balanced | Performance, Escalations, Resolution |
| Startup | Fundraising | Energetic, momentum | Bold metrics, Velocity, Why Now |
| Academic | Research paper | Formal, structured | Abstract, Methodology, Findings |

---

### Feature 5: SEC XBRL Support (Deprecated)

**Status**: Currently removed from the main upload flow. The infrastructure remains for potential future use or separate endpoints.

**Historical How It Worked**:
1. User uploads SEC XBRL ZIP archive
2. Backend extracts 4 datasets: SUB, NUM, TAG, PRE
3. `sec_processor.py` joins them:
   - SUB provides company metadata
   - NUM provides numeric values
   - TAG provides definitions
   - PRE provides presentation context
4. Creates "master dataframe" with:
   - Metrics as rows (standardized names)
   - Dates as columns (time periods)
5. Processing continues as normal (KPI, risk, trend detection)

**XBRL Tag Mapping** (for reference):
```
SalesRevenueNet         → Total Revenue
CostOfGoodsAndServicesSold → Cost of Goods Sold
NetIncomeLoss           → Net Profit (Loss)
CashAndCashEquivalentsAtCarryingValue → Cash & Equivalents
StockholdersEquity      → Total Equity
```

**Note**: Users can now upload regular financial statements (PDF/Excel/CSV) and FinGenie automatically detects the statement type (Balance Sheet, Income Statement, Cash Flow) using intelligent keyword analysis.

---

### Feature 6: Automatic Statement Type Detection

**How It Works**:
1. After parsing file (PDF/Excel/CSV), `detect_statement_type()` analyzes the data
2. Uses keyword-based heuristics to identify financial statement type
3. Scans for characteristic keywords:
   - **Balance Sheet**: "Assets", "Liabilities", "Equity", "Total Assets", "Current Assets"
   - **Income Statement**: "Revenue", "Net Income", "Operating Expenses", "EBITDA", "Gross Profit"
   - **Cash Flow Statement**: "Cash Flow", "Operating Activities", "Investing Activities", "Financing Activities"
4. Returns most likely classification: "Balance Sheet", "Income Statement", "Cash Flow Statement", or "Financial Statement"
5. Statement type is passed through analysis pipeline and used in AI summary generation

**Benefits**:
- Automatic classification (no user input required)
- Consistent statement type labeling across reports
- Enables type-specific analysis recommendations

---

### Feature 7: Text Extraction (PDF with No Tables)

**Scenario**: User uploads PDF with financial data in paragraph form (no tables)

**How It Works**:
1. `parse_pdf()` finds no tables
2. Extracts raw text from PDF
3. Router detects mode="text"
4. Calls `structurer.py` → `extract_data_from_text()`
5. Sends raw text to Groq with extraction instructions
6. LLM structures text into JSON:
   ```json
   {
     "statement_type": "Income Statement",
     "data": {
       "Total Revenue": {"2023": 1500000, "2022": 1200000},
       ...
     }
   }
   ```
7. Converts to DataFrame
8. Processing continues normally

---

### Feature 8: Trend Analysis

**How It Works**:
1. `detect_trends()` examines extracted financial figures
2. For each metric with 2+ periods:
   - Calculates first-to-last % change
   - Classifies as "up" (>2%), "down" (<-2%), or "stable"
3. Returns Trend objects with:
   - Metric name
   - Direction
   - Magnitude (absolute % change)
   - Period range (e.g., "2023 → 2024")

**Example**:
```
Metric: Revenue
Direction: up
Magnitude: 25.5%
Period: 2023 → 2024
```

---

### Feature 9: Risk Scoring & Mitigation

**Risk Detection**:
- Threshold-based system (thresholds in `KPI_THRESHOLDS`)
- Each risk checked during KPI computation

**Severity Levels**:
- `low` - Monitor but no action needed
- `medium` - Address within 30 days
- `high` - Address within 7 days
- `critical` - Address immediately

**Mitigation Generation**:
1. Groq generates mitigation steps for each risk
2. Format: "1) Immediate (7 days), 2) Short-term (30 days), 3) Long-term (90 days)"
3. Linked to risks using exact name matching

**Example Mitigation**:
```
Risk: Low Cash Runway (2 months)

Mitigation Protocol:
1. Immediate (within 7 days): Freeze discretionary spending, compile cash forecast
2. Short-term (within 30 days): Renegotiate supplier terms, accelerate receivables
3. Long-term (within 90 days): Secure additional funding or increase sales
```

---

## Upload & Analysis Pipeline

### Complete Step-by-Step Data Flow

```
┌─────────────────────────────────────┐
│  1. FILE UPLOAD                      │
│  User selects file from disk         │
│  (PDF/XLSX/CSV/ZIP/TXT)              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. FRONTEND VALIDATION              │
│  • Check file extension             │
│  • Verify file size (< 200MB)        │
│  • Send to POST /api/upload          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. BACKEND VALIDATION               │
│  parser.validate_file()              │
│  • Check extension again             │
│  • Verify size (MAX_FILE_SIZE)       │
│  • Check magic bytes (file signature)│
│  ✗ If invalid → HTTPException 400    │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  4. FILE PARSING & STATEMENT TYPE DETECTION  │
│  parse_file() → Determine type & parse      │
└──────────────┬───────────────────────────────┘
               │
        ┌──────┴──────────────────┐
        │                         │
        ▼                         ▼
    ┌────────┐            ┌──────────┐
    │ PDF    │            │ EXCEL/CSV│
    └────┬───┘            └────┬─────┘
         │                      │
    parse_pdf()            parse_excel()/
         │                 parse_csv()
    ┌────┴────┐                │
    │          │                │
 Tables?    No Tables?       DataFrame
    │          │                │
    ▼          ▼                ▼
  DataFrame  Raw Text      ┌─────────────┐
    │          │           │ Detect      │
    │          │           │ Statement   │
    │          └──→────────→ Type        │
    │                       │            │
    └───┬──────────────────┘            │
        │                                │
        └────────────┬──────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │ IF Mode = Text:      │
         │ structurer.py        │
         │ (LLM extraction)     │
         │ → DataFrame          │
         └──────────┬───────────┘
                    │
                    ▼
            ┌──────────────┐
            │ DataFrame +  │
            │ Statement    │
            │ Type Ready   │
            └──────┬───────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  5. DATA VALIDATION GUARD                    │
│  Check if document contains financial data  │
│                                              │
│  ✗ If no data & no KPIs & no trends:       │
│    → HTTPException 422 (reject upload)      │
│                                              │
│  ✓ If has financial data:                   │
│    → Continue to analysis                   │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  6. KPI COMPUTATION                      │
│  kpi_engine.compute_kpis(df)             │
│                                          │
│  Extract figures from DataFrame:         │
│  • Revenue, COGS, Net Income             │
│  • Expenses, Cash on Hand                │
│  • Calculate derived metrics:            │
│    - Gross Profit Margin                 │
│    - Net Profit Margin                   │
│    - Revenue Growth                      │
│    - Expense Ratio                       │
│    - Burn Rate (Monthly)                 │
│    - Cash Runway                         │
│                                          │
│  Apply status thresholds:                │
│  • "good", "warning", "danger"           │
│                                          │
│  ✓ Returns: list[KPI]                    │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  7. RISK DETECTION                       │
│  kpi_engine.detect_risks(kpis, df)       │
│                                          │
│  Check KPI thresholds:                   │
│  • Expense Ratio > 80%? → High Expenses  │
│  • Net Margin < 5%? → Low Profitability  │
│  • Revenue < Prev Period? → Declining    │
│  • Burn > 0? → Negative Cash Flow        │
│  • Runway < 6mo? → Low Runway            │
│                                          │
│  Assign severity levels:                 │
│  • low, medium, high, critical           │
│                                          │
│  ✓ Returns: list[Risk]                   │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  8. TREND DETECTION                      │
│  kpi_engine.detect_trends(df)            │
│                                          │
│  For each metric with 2+ periods:        │
│  • Calculate % change (first → last)     │
│  • Classify: up (>2%), down (<-2%), stable
│  • Format period range                   │
│                                          │
│  ✓ Returns: list[Trend]                  │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  9. LLM SUMMARY GENERATION               │
│  llm_analyzer.generate_summary()         │
│                                          │
│  Build prompt with:                      │
│  • Statement type                        │
│  • Data preview (JSON format)            │
│  • KPIs (with status)                    │
│  • Risks (with severity)                 │
│  • Trends                                │
│                                          │
│  Send to Groq (llama-3.3-70b):           │
│  • System: "You are a financial analyst" │
│  • User: Complete prompt                 │
│  • Temperature: 0.3 (consistent)         │
│  • Max tokens: 2000                      │
│                                          │
│  Parse JSON response:                    │
│  {                                       │
│    "summary": "...",                     │
│    "recommendations": ["...", "..."],    │
│    "risk_mitigations": {                 │
│      "Risk Name": "1)... 2)... 3)..."    │
│    }                                     │
│  }                                       │
│                                          │
│  ✓ Returns: dict with summary, recs, mits
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  10. MATCH MITIGATIONS TO RISKS          │
│                                          │
│  For each Risk object:                   │
│  • Try exact match (risk.risk name)      │
│  • Try normalized match (lowercase)      │
│  • If no match, leave mitigation null    │
│                                          │
│  ✓ Updates Risk.mitigation field         │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  11. PREPARE RESPONSE                    │
│                                          │
│  Convert DataFrame to records:           │
│  raw_data = df.to_dict(orient="records")│
│  column_headers = df.columns.tolist()    │
│                                          │
│  Build AnalysisResponse:                 │
│  • statement_type (auto-detected)        │
│  • raw_data (table rows)                 │
│  • column_headers                        │
│  • kpis (list[KPI])                      │
│  • risks (list[Risk])                    │
│  • trends (list[Trend])                  │
│  • summary (AI narrative)                │
│  • recommendations (list[str])           │
│  • parsing_mode (table/text)             │
│  • raw_text (if mode="text")             │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  12. RETURN TO FRONTEND                  │
│                                          │
│  Response: AnalysisResponse (JSON)       │
│  Status: 200 OK                          │
│                                          │
│  Frontend receives and:                  │
│  • Caches result in state                │
│  • Navigates to Analyzer page            │
│  • Renders KPI cards, chart, summary     │
│  • Enables chat widget                   │
│  • Enables report generation             │
└──────────────────────────────────────────┘
```

---

## LLM Integration & Prompts

### Groq API Configuration

**Client Setup**:
```python
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[...],
    temperature=0.3,
    max_tokens=2000
)
```

**Model**: `llama-3.3-70b-versatile`
- 70 billion parameters
- Versatile across tasks (analysis, generation, reasoning)
- Relatively fast inference (Groq's specialty)

---

### Prompt 1: Financial Summary Generation

**When Used**: After KPI/risk/trend computation

**System Prompt**:
> "You are an expert financial analyst who excels at making financial data accessible and actionable for non-experts. You always respond with clear, practical insights in valid JSON format."

**User Prompt Structure**:
```
1. Document context (statement type, extracted data)
2. Computed KPIs (formatted with status)
3. Identified risks (formatted with severity)
4. Detected trends
5. Task instructions:
   - Write summary as if explaining to non-finance person
   - Start with big picture
   - Explain what metrics MEAN (not just numbers)
   - Be direct, not vague
   - Generate 3-6 recommendations (specific, measurable)
   - Create mitigation protocols for each risk (3-step: immediate/short/long)
6. Output format (strict JSON)
```

**Key Instruction Highlights**:
- "Write as if explaining to a smart friend with NO financial background"
- "Use concrete language: avoid 'appears to' or 'seems to' - be direct"
- "Recommendations must be ACTIONABLE and SPECIFIC"
- "Format: Action + why it matters + expected outcome"

**Example Instruction**:
> "Good recommendation: 'Reduce monthly operating expenses by 15% through vendor renegotiation...to extend cash runway from 6 to 9 months'
> Bad recommendation: 'Review expenses regularly'"

**Temperature**: 0.3 (lower = more consistent, less creative)

**Max Tokens**: 2000 (enough for multi-paragraph summary + recommendations)

---

### Prompt 2: Document Chat

**When Used**: When user asks question about analyzed document

**System Prompt**:
```
You are FinGenie, an expert financial advisor specializing in making complex 
financial data accessible to non-finance professionals, founders, and students.

CORE RESPONSIBILITIES:
1. Answer ONLY using provided document data
2. Translate financial jargon into plain language
3. Provide context and practical implications
4. Use analogies and real-world examples
5. Be encouraging and educational

COMMUNICATION STYLE:
- Start with direct answer, then provide context
- Break down complex concepts
- Use percentages, ratios, comparisons to make numbers meaningful
- Format: "In simple terms, [term] means [explanation]. For this company, it shows [insight]."

HANDLING UNCERTAINTIES:
- If data is missing: "Based on available data, [what you know]. However, [what's missing] isn't shown."
- Never fabricate numbers or assumptions
- Suggest what additional documents would help

Remember: Empower with understanding, not overwhelm.
```

**Document Context Included**:
```
DOCUMENT TYPE: [statement type]

=== DATA TABLE (preview) ===
[first 20 rows of data]

=== KEY PERFORMANCE INDICATORS ===
[formatted KPI list]

=== RISK FLAGS ===
[formatted risk list]

=== AI SUMMARY ===
[original summary]
```

**Conversation History**: Last 20 messages (≈10 turns)

**Temperature**: 0.3

**Max Tokens**: 1024

---

### Prompt 3: Report Generation

**When Used**: User generates narrative report in specific format

**Format-Specific Instructions** (examples):

**Executive Brief**:
> "Write a concise, decision-ready Executive Brief for C-suite. Lead with single most critical finding. Use crisp bullet-style language. Include 'Immediate Actions' section with 3 bullets. Max 400 words. No fluff."

**Investor Memo**:
> "Highlight growth vectors and momentum. Minimize negative framing—reframe risks as 'growth unlocks'. Structure: Opportunity → Traction → Risks → Ask. Max 450 words. Forward-looking tone."

**Audit Report**:
> "Use conservative, compliance-oriented language. Enumerate ALL risks by severity. Cite specific data points. Sections: Executive Summary, Findings, Risk Register, Management Response Required. Max 500 words."

**Startup Pitch**:
> "Lead with bold metrics and velocity. Frame every challenge as 'growth unlock'. Use confident, momentum-forward language. End with 'Why Now' paragraph. Max 380 words."

**Academic Paper**:
> "Include: Abstract, Methodology, Findings, Discussion, Conclusion. Acknowledge limitations of AI-generated analysis. Use formal academic prose. Max 550 words."

---

### Prompt 4: Text Data Extraction

**When Used**: PDF with no tables (text-only documents)

**Task Instructions**:
1. Identify statement type (Balance Sheet, Income Statement, Cash Flow)
2. Extract all financial line items
3. Standardize metric names (Revenue/Sales → "Total Revenue")
4. Handle unit indicators (thousands, millions - apply multiplier)
5. Structure as nested JSON

**Output Format**:
```json
{
  "statement_type": "Income Statement",
  "data": {
    "Total Revenue": {"2023": 1500000, "2022": 1200000},
    "Cost of Goods Sold": {"2023": 900000, "2022": 720000},
    ...
  }
}
```

**Edge Case Handling**:
- YTD/MTD → treat as current period
- Percentages → extract as decimals
- "Thousands" notation → multiply all by 1000
- Fiscal year mismatch → use fiscal year notation (FY2023)

**Temperature**: 0.1 (very low - high accuracy, low creativity)

**Response Format**: `{"type": "json_object"}` (enforced JSON output)

---

## Frontend Routing & State Management

### Hash-Based Routing

**Implementation**: `window.location.hash` for client-side routing

**Valid Routes**:
- `#home` (or empty) - Landing page
- `#analyzer` - Results dashboard
- `#chat` - Chat page (or floating widget)
- `#trends` - Trend analysis
- `#risk` - Risk assessment
- `#reports` - Report generation
- `#about` - About page
- `#privacy` - Privacy policy
- `#compliance` - Compliance
- `#terms` - Terms of service

**Navigation Flow**:
```javascript
navigateTo(tab) {
  window.location.hash = tab === 'home' ? '' : tab;
  setActiveTab(tab);
  window.scrollTo({ top: 0, behavior: 'instant' });
}
```

**Special Handling**:
- Page reload detection (resets to home)
- Hash change event listener
- Scroll-to-top on tab change

---

### State Management

**App-Level State**:
```javascript
const [activeTab, setActiveTab] = useState('home');        // Current page
const [result, setResult] = useState(null);                // Cached analysis
const [isLoading, setIsLoading] = useState(false);         // Upload in progress
const [error, setError] = useState(null);                  // Error message
```

**Chat State** (DocChat component):
```javascript
const [messages, setMessages] = useState([                 // Conversation history
  { role: 'assistant', content: 'Hi, I analyzed your...' }
]);
const [input, setInput] = useState('');                    // User input
const [loading, setLoading] = useState(false);             // Chat request in progress
```

**Key Props Flow**:
```
App (state owner)
  ├─→ Home (onFileSelect, isLoading, error)
  ├─→ Analyzer (result)
  ├─→ DocChat (analysisResult)
  └─→ ReportCenter (result)
```

**Data Persistence**: Result cached in React state only (lost on page reload)

---

## API Endpoints Reference

### Health Check

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "ok",
  "message": "FinGenie API is running"
}
```

---

### Upload & Analyze

**Endpoint**: `POST /api/upload`

**Request**: Multipart form data
```
Content-Type: multipart/form-data
Field: file (binary)
```

**Response** (200 OK):
```json
{
  "statement_type": "Income Statement",
  "raw_data": [
    {"Total Revenue": 1500000, "Cost of Goods Sold": 900000, ...},
    ...
  ],
  "column_headers": ["Total Revenue", "Cost of Goods Sold", ...],
  "kpis": [
    {
      "name": "Gross Profit Margin",
      "value": 42.5,
      "formatted_value": "42.5%",
      "trend": "up",
      "status": "good",
      "description": "..."
    },
    ...
  ],
  "risks": [
    {
      "risk": "Low Cash Runway",
      "severity": "critical",
      "description": "...",
      "mitigation": "..."
    },
    ...
  ],
  "trends": [
    {
      "metric": "Revenue Growth Rate",
      "direction": "up",
      "magnitude": 12.5,
      "period": "2023 → 2024"
    },
    ...
  ],
  "summary": "...",
  "recommendations": ["...", "..."],
  "parsing_mode": "table",
  "raw_text": null
}
```

**Error Response** (400/500):
```json
{
  "detail": "Error message here"
}
```

---

### Chat Message

**Endpoint**: `POST /api/chat/message`

**Request**:
```json
{
  "session_id": "user-session-abc",
  "user_message": "What does the cash runway mean?",
  "raw_data": [...],
  "column_headers": [...],
  "statement_type": "Income Statement",
  "summary": "...",
  "kpis": [...],
  "risks": [...],
  "conversation_history": [
    {"role": "assistant", "content": "Hi, I've analyzed..."},
    {"role": "user", "content": "What risks should I worry about?"}
  ]
}
```

**Response** (200 OK):
```json
{
  "reply": "The cash runway is...",
  "conversation_history": [
    {"role": "assistant", "content": "Hi, I've analyzed..."},
    {"role": "user", "content": "What risks should I worry about?"},
    {"role": "assistant", "content": "Based on the analysis..."},
    {"role": "user", "content": "What does the cash runway mean?"},
    {"role": "assistant", "content": "The cash runway is..."}
  ]
}
```

---

### Generate Report

**Endpoint**: `POST /api/report/generate`

**Request**:
```json
{
  "format_id": "executive",
  "raw_data": [...],
  "column_headers": [...],
  "statement_type": "Income Statement",
  "summary": "...",
  "kpis": [...],
  "risks": [...],
  "recommendations": [...],
  "parsing_mode": "table"
}
```

**Response** (200 OK):
```json
{
  "format_id": "executive",
  "format_label": "Executive Brief",
  "report_markdown": "# Executive Summary\n\n...",
  "word_count": 385
}
```

**Available Formats**:
- `executive` - Executive Brief
- `investor` - Investor Memo
- `audit` - Internal Audit Report
- `board` - Board Update
- `startup` - Startup Pitch Narrative
- `academic` - Research Paper

---

### List Report Formats

**Endpoint**: `GET /api/report/formats`

**Response**:
```json
{
  "formats": [
    {"id": "executive", "label": "Executive Brief"},
    {"id": "investor", "label": "Investor Memo"},
    ...
  ]
}
```

---

## Function-Level Documentation

### parser.py

#### `validate_file(file: UploadFile) → bytes`

**Purpose**: Validate uploaded file and return content

**Steps**:
1. Extract extension from filename
2. Check against `ALLOWED_EXTENSIONS`
3. Read file content (await)
4. Verify size ≤ `MAX_FILE_SIZE` (200MB)
5. Check magic bytes (binary file signature)
   - PDF: `%PDF`
   - ZIP/XLSX/XLS: `PK\x03\x04` or `\xd0\xcf\x11\xe0`
6. If mismatch detected, raise HTTPException 400

**Returns**: File bytes (if all checks pass)

**Raises**: HTTPException (400) if validation fails

---

#### `parse_pdf(content: bytes) → tuple[pd.DataFrame | None, str | None, str]`

**Purpose**: Extract tables or text from PDF

**Steps**:
1. Open PDF with pdfplumber
2. Iterate pages:
   - Extract raw text → append to `raw_text`
   - Extract tables → append to `all_tables`
3. If tables found:
   - Take largest table
   - Use first row as column headers
   - Convert to DataFrame
   - Call `clean_dataframe()`
   - Return `(df, None, "table")`
4. Else if text found:
   - Return `(None, raw_text, "text")`
5. Else:
   - Raise HTTPException (no data found)

**Returns**: `(df, raw_text, mode)`
- `df`: DataFrame if tables extracted, else None
- `raw_text`: Raw text if mode="text", else None
- `mode`: "table" or "text"

---

#### `parse_excel(content: bytes) → pd.DataFrame`

**Purpose**: Extract data from Excel

**Steps**:
1. Load Excel file
2. Iterate sheet names
3. Read sheet as DataFrame
4. If not empty and has >1 row:
   - Call `clean_dataframe()`
   - Return DataFrame
5. Else continue to next sheet
6. If no valid sheet found, raise HTTPException

---

#### `parse_csv(content: bytes) → pd.DataFrame`

**Purpose**: Extract data from CSV

**Steps**:
1. Read CSV via pandas
2. Check if empty
3. Call `clean_dataframe()`
4. Return DataFrame

---

#### `parse_sec_zip(content: bytes) → dict[str, pd.DataFrame]` [DEPRECATED]

**Status**: No longer called by `parse_file()`. Removed from main upload flow.

**Purpose**: Extract and process SEC XBRL datasets (for potential future use)

**Steps**:
1. Open ZIP archive
2. Verify required files (sub.txt, num.txt, tag.txt, pre.txt)
3. Read SUB.txt:
   - Find most recent submission (by period)
   - Extract target ADSH
4. Filter NUM.txt by ADSH (chunked for memory efficiency)
5. Filter PRE.txt by ADSH
6. Load TAG.txt (full)
7. Return dict: `{"sub": df, "num": df, "tag": df, "pre": df}`

**Note**: Infrastructure remains in codebase but is not integrated into the main file parsing pipeline.

**Returns**: Dictionary of 4 DataFrames

**Raises**: HTTPException if validation fails or files missing

---

#### `clean_dataframe(df: pd.DataFrame) → pd.DataFrame`

**Purpose**: Clean extracted DataFrame

**Steps**:
1. Drop completely empty rows (all NaN)
2. Drop completely empty columns (all NaN)
3. Reset index
4. Return cleaned DataFrame

---

### kpi_engine.py

#### `compute_kpis(df: pd.DataFrame, statement_type: str) → list[KPI]`

**Purpose**: Calculate financial KPIs from DataFrame

**Steps**:
1. Validate DataFrame (not None, not empty)
2. Extract financial figures via `_extract_financial_figures()`
3. For each KPI formula:
   - Check if required fields exist
   - Calculate value
   - Determine trend ("up", "down", "stable")
   - Determine status ("good", "warning", "danger")
   - Create KPI object
4. If no KPIs found, fallback to generic numeric summaries
5. Return list of KPI objects

**KPIs Calculated**:
- Gross Profit Margin
- Net Profit Margin
- Revenue Growth Rate
- Expense Ratio
- Burn Rate (Monthly)
- Cash Runway

**Returns**: `list[KPI]`

---

#### `detect_risks(kpis: list[KPI], df: pd.DataFrame) → list[Risk]`

**Purpose**: Identify financial risks

**Logic**:
- Iterate KPIs
- For each KPI, check thresholds:
  - Expense Ratio > 80% → High Expenses risk
  - Net Margin < 5% → Low Profitability risk
  - Revenue Growth < 0% → Declining Revenue risk
  - Burn Rate > 0 → Negative Cash Flow risk
  - Cash Runway < 6 months → Low Cash Runway risk (critical if < 3)
- Assign severity based on magnitude
- Return Risk list

**Returns**: `list[Risk]` (at least one "No Major Risks Detected" if empty)

---

#### `detect_trends(df: pd.DataFrame) → list[Trend]`

**Purpose**: Detect financial trends

**Logic**:
- Extract financial figures
- For each metric with 2+ periods:
  - Calculate first-to-last % change
  - Classify: "up" (>2%), "down" (<-2%), "stable"
  - Create Trend object

**Returns**: `list[Trend]`

---

### llm_analyzer.py

#### `generate_summary(df, statement_type, kpis, risks, trends) → dict`

**Purpose**: Generate AI summary and recommendations via Groq

**Steps**:
1. Format prompt with:
   - Document context
   - KPI block (formatted)
   - Risk block (formatted)
   - Trend list
2. Call Groq with specific system/user messages
3. Wait for response (45s timeout)
4. Parse JSON response
5. Strip markdown code blocks if present
6. Extract: summary, recommendations, risk_mitigations
7. Return dictionary

**Returns**: 
```python
{
  "summary": "...",
  "recommendations": ["...", "..."],
  "risk_mitigations": {"Risk Name": "...", ...}
}
```

---

### groq_client.py

#### `get_groq_client() → Groq`

**Purpose**: Return singleton Groq client

**Steps**:
1. Check `GROQ_API_KEY` environment variable
2. If missing, raise ValueError
3. Create and return Groq instance
4. (Implicit singleton - Python module caches function result)

**Returns**: Groq client instance

---

### doc_chat.py

#### `build_doc_context(raw_data, column_headers, statement_type, summary, kpis, risks) → str`

**Purpose**: Build formatted context string for chat

**Steps**:
1. Create DataFrame from raw_data
2. Convert to string (first 20 rows)
3. Format KPIs as bullet list
4. Format risks as bullet list
5. Concatenate into single string
6. Return formatted context

**Returns**: String with formatted document context

---

#### `chat_with_document(user_message, conversation_history, doc_context) → str`

**Purpose**: Answer question about document via Groq

**Steps**:
1. Build system prompt (instructs LLM to answer from document only)
2. Append document context to system prompt
3. Build messages array:
   - System message
   - Conversation history (last 20 messages)
   - Current user message
4. Call Groq
5. Return assistant response

**Returns**: Assistant reply string

---

### sec_processor.py

#### `process_sec_datasets(sub_df, num_df, tag_df, pre_df) → tuple[pd.DataFrame, dict]` [DEPRECATED]

**Status**: No longer called by main upload flow. Removed from active parsing pipeline.

**Purpose**: Join and process SEC XBRL datasets (for potential future use)

**Steps**:
1. Validate required columns in each dataset
2. Filter SUB.txt by most recent period
3. Extract target ADSH and metadata
4. Filter NUM.txt by ADSH
5. Join NUM + TAG on (tag, version)
6. Join with PRE (unique entries only)
7. Map XBRL tags to human-readable labels
8. Filter for standard periods (qtrs in [0, 1, 4])
9. Pivot to time-series format (metrics × dates)
10. Normalize column names
11. Return pivoted DataFrame + metadata dict

**Returns**: 
```python
(
  dataframe,  # Metrics × Periods
  {
    "company_name": str,
    "cik": str,
    "form": str,
    "period": str,
    "adsh": str
  }
)
```

**Note**: Infrastructure remains for potential future use in separate endpoints.

---

### report_generator.py

#### `generate_report(analysis_result: dict, format_id: str) → str`

**Purpose**: Generate narrative report in specific format

**Steps**:
1. Validate `format_id` against `REPORT_FORMATS`
2. Build prompt from analysis data + format-specific instructions
3. Call Groq
4. Return markdown report text

**Returns**: Markdown string (can be rendered or downloaded)

---

### structurer.py

#### `extract_data_from_text(text: str) → tuple[pd.DataFrame, str]`

**Purpose**: Extract financial data from unstructured text via LLM

**Steps**:
1. Build LLM prompt with extraction instructions
2. Call Groq (temperature=0.1, json_object response format)
3. Parse JSON response
4. Check statement_type and data fields
5. Convert nested dict to DataFrame
6. Return DataFrame + statement_type

**Returns**: `(dataframe, statement_type)`

---

## Data Flow Diagrams

### Complete User Journey

```
START: User visits FinGenie
  ↓
  ├─→ [ Home Page ]
  │   ├─→ Hero section with CTA
  │   ├─→ Feature cards
  │   └─→ File upload dropzone
  │
  ├─→ [ User Drags File ]
  │   ├─→ Frontend validates
  │   ├─→ POST /api/upload
  │   └─→ Backend processes (5-15s)
  │
  └─→ [ Results Received ]
      ├─→ [ Analyzer Page ]
      │   ├─→ KPI Cards (colored by status)
      │   ├─→ Trend Chart (visualization)
      │   ├─→ AI Summary (narrative)
      │   ├─→ Risk Cards (severity badges)
      │   ├─→ Recommendations (action items)
      │   └─→ Data Preview (table)
      │
      ├─→ [ User Can ]
      │   ├─→ Click "Chat" → DocChat opens
      │   │   └─→ Ask questions about data
      │   │   └─→ Get document-grounded answers
      │   │
      │   ├─→ Click "Generate Report"
      │   │   └─→ Select format (6 options)
      │   │   └─→ View/download markdown
      │   │
      │   ├─→ View Trends page
      │   │   └─→ Detailed trend analysis
      │   │
      │   ├─→ View Risk page
      │   │   └─→ Risk mitigation steps
      │   │
      │   └─→ Analyze New Document
      │       └─→ Reset state, go to Home
      │
      └─→ END: User has complete financial understanding
```

### Data Structure Evolution

```
RAW FILE
  ↓
FILE CONTENT (bytes)
  ↓
VALIDATION
  ├─→ Size check
  ├─→ Extension check
  └─→ Magic bytes check
  ↓
PARSING
  ├─→ PDF → [Tables | Raw Text]
  ├─→ Excel → [DataFrame]
  └─→ CSV → [DataFrame]
  ↓
STATEMENT TYPE DETECTION
  └─→ detect_statement_type() → [Balance Sheet | Income Statement | Cash Flow]
  ↓
TEXT EXTRACTION (if PDF has no tables)
  └─→ Text → [Structured JSON via LLM] → [DataFrame]
  ↓
DATA VALIDATION GUARD
  ├─→ Check for financial data
  ├─→ Check for KPIs
  └─→ Check for trends (reject if none found)
  ↓
EXTRACTED DATAFRAME
  (rows = metrics, columns = periods, values = numbers)
  ↓
ANALYSIS
  ├─→ KPI Computation → [list[KPI]]
  ├─→ Risk Detection → [list[Risk]]
  └─→ Trend Detection → [list[Trend]]
  ↓
LLM SYNTHESIS
  ├─→ Summary generation
  ├─→ Recommendation generation
  └─→ Mitigation generation
  ↓
RESPONSE ASSEMBLY
  └─→ AnalysisResponse
      (statement_type, raw_data, column_headers,
       kpis, risks, trends, summary, recommendations)
  ↓
FRONTEND RENDERING
  └─→ Cached in React state
      (Analyzer, Chat, Reports all use same data)
```

---

## Architecture Assessment & Improvements

### Current Strengths

1. **Clean Separation of Concerns**
   - Routers handle HTTP contracts
   - Services contain business logic
   - Models define data structures
   - Clear responsibility boundaries

2. **Flexible File Format Support**
   - PDFs (table + text)
   - Excel/CSV
   - Automatic statement type detection (Balance Sheet, Income Statement, Cash Flow)
   - Unstructured text extraction (via LLM)

3. **Comprehensive Analysis**
   - KPI extraction
   - Risk flagging
   - Trend detection
   - AI narrative generation
   - Multiple report formats

4. **Stateless Backend**
   - No persistent storage
   - Privacy-focused
   - Scalable (can parallelize)

5. **Intuitive Frontend**
   - Hash routing (no build changes)
   - Responsive design
   - Floating chat widget
   - Clear information hierarchy

6. **LLM-Powered Features**
   - Text extraction (for PDFs)
   - Summary generation
   - Q&A capability
   - Report generation (6 formats)

---

### Identified Issues & Weaknesses

#### 🔴 CRITICAL Issues

1. **No Session Management**
   - Chat history lost on page reload
   - Can't resume conversations
   - No user authentication
   - Conversation history stored only in frontend state
   
   **Fix**: Implement optional session storage (localStorage or backend)
   ```python
   # backend/services/session_manager.py
   - Store conversation history in persistent store
   - API: POST /api/chat/session/save
   - API: GET /api/chat/session/{session_id}
   ```

2. **Limited Error Recovery for Malformed Files**
   - PDF parsing might fail on corrupted files
   - No retry logic for failed LLM extractions
   - Limited partial result handling
   
   **Fix**: 
   - Add try-catch around each parser step
   - Return partial results if some fields fail
   - Provide detailed error context to user

3. **LLM Timeout Without Fallback**
   - If Groq doesn't respond in 45s, request fails
   - No cached responses
   - No graceful degradation
   
   **Fix**:
   ```python
   # services/llm_analyzer.py
   try:
       # Attempt LLM call
   except asyncio.TimeoutError:
       # Return pre-computed summary from KPIs only
       return generate_fallback_summary(kpis, risks)
   ```

4. **Risk Mitigation Matching is Fragile**
   - String-based exact matching
   - Can fail if risk name slightly different
   - No semantic matching
   
   **Fix**:
   ```python
   # Use fuzzy string matching
   from fuzzywuzzy import fuzz
   
   if fuzz.ratio(risk.risk, mitigation_key) > 80:
       risk.mitigation = mitigations[mitigation_key]
   ```

---

#### 🟡 MAJOR Issues

5. **No Input Sanitization**
   - DataFrame column names not validated
   - Could have SQL injection if backend extended
   - User data not sanitized before LLM
   
   **Fix**:
   ```python
   def sanitize_column_names(df):
       df.columns = [re.sub(r'[^a-zA-Z0-9_]', '', c) for c in df.columns]
       return df
   ```

6. **KPI Thresholds Are Hardcoded**
   - Cannot adjust without code change
   - No support for industry-specific thresholds
   
   **Fix**:
   ```python
   # config.py or environment
   KPI_THRESHOLDS = {
       'gross_profit_margin': {
           'good': float(os.getenv('KPI_GPM_GOOD', 40)),
           'warn': float(os.getenv('KPI_GPM_WARN', 20))
       },
       # ... more
   }
   ```

7. **No Rate Limiting**
   - Anyone can spam upload endpoint
   - No DDoS protection
   - Groq API calls not rate-limited
   
   **Fix**:
   ```python
   from slowapi import Limiter
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   @router.post("/upload")
   @limiter.limit("10/minute")
   async def upload_and_analyze(...):
   ```

8. **Data Validation is Inconsistent**
   - KPI values not validated (could be negative where positive expected)
   - DataFrame dtypes not enforced
   - Chat session_id validation is minimal
   
   **Fix**: Use Pydantic validators across all models

9. **Memory Usage for Large Files**
   - Large PDF/Excel parsing loads all data into memory
   - No streaming for very large datasets
   - Could OOM on 500MB+ files
   
   **Fix**:
   ```python
   # Use chunked reading
   for chunk in pd.read_csv(f, chunksize=50000):
       # Process chunk, aggregate results
       pass
   ```

10. **No Logging for Debugging**
    - Error messages not detailed
    - No audit trail
    - Hard to debug production issues
    
    **Fix**:
    ```python
    logger.info(f"File {file.filename}: parsed in {mode} mode, {len(df)} rows")
    logger.warning(f"No KPIs found for statement type {statement_type}")
    logger.error(f"LLM call failed: {exc}", exc_info=True)
    ```

---

#### 🟠 MODERATE Issues

11. **No Frontend Loading Optimization**
    - Full React bundle loaded even for Home page
    - No code splitting
    - Lucide icons imported globally
    
    **Fix**: Use React.lazy() for component splitting
    ```javascript
    const Analyzer = React.lazy(() => import('./components/Analyzer'));
    const DocChat = React.lazy(() => import('./components/DocChat'));
    ```

12. **Chat API Inefficiency**
    - Full analysis result sent with each chat message
    - Could optimize to send only necessary fields
    
    **Fix**:
    ```python
    class CompactChatRequest(BaseModel):
        session_id: str
        user_message: str
        # Store analysis_id instead of full data
        analysis_id: str
        conversation_history: list[dict]
    ```

13. **No Duplicate Request Prevention**
    - User can click upload multiple times
    - Backend will process duplicates
    
    **Fix**:
    ```javascript
    const [isUploading, setIsUploading] = useState(false);
    
    async function handleFileSelect(file) {
        if (isUploading) return;  // Prevent duplicate
        setIsUploading(true);
        ...
    }
    ```

14. **SEC Processor Doesn't Handle All Edge Cases**
    - Doesn't validate XBRL semantic logic (assets = liabilities + equity)
    - Doesn't handle multi-currency filings
    - Doesn't validate consolidated vs unconsolidated
    
    **Fix**: Add post-processing validation
    ```python
    def validate_balance_sheet_equation(df):
        # Check: Assets ≈ Liabilities + Equity
        for period in df.columns:
            ...
    ```

15. **No Tests for LLM Prompts**
    - Can't verify prompt changes don't break parsing
    - No golden dataset for regression testing
    
    **Fix**: Add integration tests
    ```python
    @pytest.mark.asyncio
    async def test_summary_includes_recommendations():
        result = await generate_summary(test_df, ...)
        assert len(result["recommendations"]) > 0
        assert all(len(rec) > 20 for rec in result["recommendations"])
    ```

---

#### 🟡 MINOR Issues

16. **Type Hints Incomplete**
    - Some functions missing return type hints
    - Dict types not fully specified (should be Dict[str, Any])
    
    **Fix**: Add `from typing import Dict, List, Optional` and type all functions

17. **No Docstring Conventions**
    - Some functions lack docstrings
    - Inconsistent docstring format
    
    **Fix**: Adopt Google-style docstrings
    ```python
    def parse_pdf(content: bytes) -> tuple[pd.DataFrame | None, str | None, str]:
        """Extract tables or text from PDF.
        
        Args:
            content: Raw PDF file bytes
            
        Returns:
            Tuple of (dataframe, raw_text, mode)
            - dataframe: Extracted table as DataFrame or None
            - raw_text: Extracted text or None (only if mode="text")
            - mode: "table" or "text"
            
        Raises:
            HTTPException: If no data found or parsing fails
        """
    ```

18. **Frontend Components Are Large**
    - Analyzer.jsx could be split (KPICards, TrendChart → separate files)
    - Home.jsx has multiple concerns (hero, features, upload)
    
    **Fix**: Split components:
    ```
    components/
    ├── Analyzer.jsx (container)
    ├── analyzer/
    │   ├── KPICards.jsx
    │   ├── TrendChart.jsx
    │   ├── AISummary.jsx
    │   ...
    ```

19. **CSS Not Modularized**
    - Global styles mixed with component styles
    - No CSS modules or styled-components
    - Hard to maintain color scheme
    
    **Fix**: Migrate to CSS modules or styled-components
    ```javascript
    // components/KPICards.module.css
    .card { /* scoped to component */ }
    ```

20. **No Performance Metrics**
    - Can't measure upload/analysis speed
    - No API response time tracking
    - Frontend doesn't report timing to backend
    
    **Fix**: Add timing instrumentation
    ```python
    import time
    start = time.time()
    # ... processing ...
    duration = time.time() - start
    logger.info(f"Upload processed in {duration:.2f}s")
    ```

---

### Recommended Priority Improvements

#### Phase 1 (Critical - Do First)

- [ ] Add fallback summary generation if LLM timeout
- [ ] Implement fuzzy matching for risk mitigations
- [ ] Add rate limiting to upload endpoint
- [ ] Add comprehensive logging

#### Phase 2 (High - Do Soon)

- [ ] Implement optional session storage for chat history
- [ ] Add error recovery for malformed file parsing
- [ ] Move hardcoded thresholds to config
- [ ] Add comprehensive test suite
- [ ] Implement proper error handling with retries

#### Phase 3 (Medium - Do Later)

- [ ] Add frontend code splitting
- [ ] Implement input sanitization
- [ ] Add type hints everywhere
- [ ] Split large components
- [ ] Migrate CSS to modules

#### Phase 4 (Nice to Have)

- [ ] Add performance monitoring
- [ ] Implement caching for repeated analyses
- [ ] Add more report formats
- [ ] Extend LLM features (multi-language support)
- [ ] Add data export formats (PDF, Excel)

---

### Scalability Recommendations

**Current Bottlenecks**:
1. **Groq API latency** - 45s timeout for summary generation
2. **Memory usage** - Large DataFrame in memory
3. **No caching** - Same file analyzed twice = 2x computation

**Scaling Strategies**:

1. **Queue-Based Processing**
   ```python
   # Use Celery + Redis for async processing
   @app.post("/api/upload")
   async def upload_and_analyze(file):
       task_id = analyze_document.delay(file_content)
       return {"task_id": task_id, "status_url": f"/api/status/{task_id}"}
   
   @app.get("/api/status/{task_id}")
   async def get_status(task_id):
       # Return processing status
   ```

2. **Caching**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=100)
   def get_kpis_for_hash(file_hash):
       # Avoid reprocessing same file
   ```

3. **Load Balancing**
   - Deploy multiple backend instances
   - Use nginx for load balancing
   - Horizontal scaling via containers

4. **Database for Sessions**
   - PostgreSQL for conversation history
   - Redis for cache layer
   - Allow multi-device access to chat history

---

### Security Recommendations

1. **File Upload Validation**
   - Add YARA scanning for malware
   - Implement ClamAV integration
   - Quarantine suspicious files

2. **API Security**
   - Add API key authentication
   - Implement CORS properly (whitelist origins)
   - Add CSRF protection if adding state

3. **Data Protection**
   - Encrypt files in transit (already HTTPS)
   - Hash sensitive data
   - Add audit logging for compliance

4. **Rate Limiting & DDoS**
   - Implement IP-based rate limiting
   - Add WAF rules
   - Monitor for abuse patterns

---

### Code Quality Improvements

**Testing**:
- Add unit tests for parser (test all file types)
- Add integration tests for API endpoints
- Add tests for KPI calculation logic
- Mock Groq API for chat/summary tests
- Use pytest fixtures for test data

**Documentation**:
- Add API documentation (Swagger/OpenAPI)
- Add backend setup guide (Docker, env vars)
- Add frontend build guide
- Add deployment guide

**CI/CD**:
- GitHub Actions for automated testing
- Linting (flake8 for Python, ESLint for JS)
- Code coverage reporting
- Automated deployments

---

## Conclusion

**FinGenie** is a well-structured financial analysis platform with clear separation of concerns, comprehensive feature coverage, and intelligent use of LLM capabilities. The codebase demonstrates good architecture patterns but would benefit from enhanced error handling, logging, and scalability considerations.

### Key Takeaways

1. **Data Flow**: File → Parse → Extract → Analyze → LLM Synthesis → UI Rendering
2. **Tech Stack**: FastAPI (Python) + React + Groq LLM
3. **Core Strength**: Accessibility - Makes financial analysis understandable to non-experts
4. **Main Challenge**: Scale (memory usage, API latency) and production hardening
5. **Opportunity**: Session management, caching, and multi-format export

With the recommended improvements implemented, FinGenie would be production-ready for enterprise deployment.

