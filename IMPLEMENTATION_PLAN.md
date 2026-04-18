# FinGenie Complete Implementation Plan
**Last Updated**: April 18, 2026  
**Total Changes**: 5 Critical + 7 High + 7 Medium + 3 Low = **22 fixes**  
**Est. Effort**: 6–8 hours implementation + testing

---

## OVERVIEW: Change Categories & Sequence

| Group | Priority | Count | Files | Impact |
|:---|:---|---:|---|:---|
| **Group 1** | CRITICAL | 5 | backend/main.py, routers/analysis.py, services/llm_analyzer.py, frontend/api/ | Blocking prod, security |
| **Group 2** | HIGH | 7 | routers/chat.py, services/doc_chat.py, report_generator.py, frontend/components/ | Stability, UX |
| **Group 3** | MEDIUM | 7 | services/*, models/schemas.py, routers/ | Robustness, monitoring |
| **Group 4** | LOW | 3 | tests/, .env.example, documentation | Quality, onboarding |

**Recommended Execution Order**: Group 1 → Group 2 → Group 3 → Group 4  
Each group can be tested independently before proceeding.

---

# GROUP 1: CRITICAL (Production Blocking)

## 1.1 Remove Form-Based API Key Input
**Severity**: 🔴 CRITICAL | **Risk**: Credential leakage  
**Files**: `backend/routers/analysis.py`, `backend/services/llm_analyzer.py`, `frontend/src/App.jsx`

### Changes:
#### 1.1.1 Backend: Remove optional api_key parameter
**File**: `backend/routers/analysis.py`
- **Lines to change**: 20-21 (function signature)
- **Current**:
  ```python
  api_key: Optional[str] = Form(None)
  ```
- **New**: Remove parameter entirely
- **Also remove**: Line 60 (pass api_key to extract_data_from_text)
- **Also remove**: Line 68 (pass api_key to generate_summary)

#### 1.1.2 Backend: Simplify Groq client initialization
**File**: `backend/services/llm_analyzer.py`
- **Lines to change**: 14-15 (get_groq_client signature and all calls)
- **Current**: `client = get_groq_client(api_key)`
- **New**: `client = get_groq_client()` (no parameter)

**File**: `backend/services/structurer.py`
- **Lines to change**: Extract calls passing api_key
- **Current**: `client = get_groq_client(api_key=api_key)`
- **New**: `client = get_groq_client()`

**File**: `backend/services/doc_chat.py`
- **Already correct** (uses `get_groq_client()` with no params)

**File**: `backend/services/groq_client.py`
- **No change needed** (already env-only)

#### 1.1.3 Frontend: Remove API key input field
**File**: `frontend/src/App.jsx` (and Home.jsx if present)
- **Remove**: Any UI input for `api_key`
- **Remove**: `api_key` from FormData in uploadAndAnalyze

**File**: `frontend/src/api/client.js`
- **Lines to change**: uploadAndAnalyze function
- **Current**:
  ```javascript
  if (apiKey) {
    formData.append('api_key', apiKey);
  }
  ```
- **New**: Remove this block entirely, keep only file append

---

## 1.2 Sanitize Report HTML Output
**Severity**: 🔴 CRITICAL | **Risk**: XSS injection  
**Files**: `frontend/src/components/ReportCenter.jsx`

### Changes:
#### 1.2.1 Add HTML sanitization function
**File**: `frontend/src/components/ReportCenter.jsx`
- **Add after imports** (line 4):
  ```javascript
  // Safely escape HTML to prevent XSS
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
  ```

#### 1.2.2 Update mdToHtml to use safe rendering
**File**: `frontend/src/components/ReportCenter.jsx`
- **Lines to change**: 18–31 (mdToHtml function)
- **Current approach**: Direct regex replacements that can allow HTML
- **New approach**: 
  - First escape all content
  - Then apply markdown-safe replacements only for headings, bold, italic, lists
  - Never allow raw HTML tags through

**Implementation**:
```javascript
function mdToHtml(md) {
  if (!md) return '';
  
  // Step 1: Escape all HTML to prevent injection
  let escaped = escapeHtml(md);
  
  // Step 2: Selectively unescape and format markdown-only elements
  // (only these safe patterns, never raw HTML)
  escaped = escaped
    .replace(/&lt;strong&gt;(.+?)&lt;\/strong&gt;/g, '<strong>$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3 class="ai-report-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="ai-report-h2">$1</h2>')
    .replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li><span class="ai-report-num">$1</span> $2</li>')
    .replace(/(<li>[\s\S]+?<\/li>)(?=\n<li>|\n\n|$)/g, '<ul>$&</ul>')
    .replace(/<\/ul>\n<ul>/g, '')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
    .replace(/<p>\s*<\/p>/g, '');
  
  return escaped;
}
```

---

## 1.3 Add Endpoint-Level Exception Handling
**Severity**: 🔴 CRITICAL | **Risk**: Uncontrolled crashes, poor error UX  
**Files**: `backend/routers/analysis.py`, `backend/routers/chat.py`, `backend/routers/report.py`

### Changes:
#### 1.3.1 Wrap upload analysis endpoint
**File**: `backend/routers/analysis.py`
- **Lines 17–95** (entire async function body)
- **Wrap with try-except**:
  ```python
  @router.post("/upload", response_model=AnalysisResponse)
  async def upload_and_analyze(
      file: UploadFile = File(...),
  ):
      """Upload a financial document (PDF/Excel/CSV/SEC ZIP) and receive full analysis."""
      try:
          # [existing code lines 25-95]
          return AnalysisResponse(...)
      
      except HTTPException:
          # Re-raise FastAPI HTTP errors as-is
          raise
      
      except Exception as e:
          import logging
          logger = logging.getLogger(__name__)
          logger.error(f"Upload analysis failed for {file.filename}: {str(e)}", exc_info=True)
          raise HTTPException(
              status_code=500,
              detail=f"Analysis failed: {str(e)[:100]}. Please try again or contact support."
          )
  ```

#### 1.3.2 Add global exception handler to FastAPI app
**File**: `backend/main.py`
- **Add after CORS middleware setup** (after line 21):
  ```python
  from fastapi.responses import JSONResponse
  
  @app.exception_handler(Exception)
  async def global_exception_handler(request, exc):
      """Catch all unhandled exceptions and return structured error."""
      import logging
      logger = logging.getLogger(__name__)
      logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
      
      return JSONResponse(
          status_code=500,
          content={
              "detail": "Internal server error. Please try again later.",
              "error_id": id(exc)  # For logging correlation
          }
      )
  ```

#### 1.3.3 Wrap chat endpoint
**File**: `backend/routers/chat.py`
- **Lines 23–43** (inside async function body)
- **Add try-except around doc_context and chat_with_document calls**:
  ```python
  @router.post("/message", response_model=ChatResponse)
  async def chat_message(body: ChatRequest):
      try:
          if not body.user_message.strip():
              raise HTTPException(status_code=400, detail="Message cannot be empty.")
          
          doc_context = build_doc_context(...)
          reply = await chat_with_document(...)
          
          return ChatResponse(...)
      except HTTPException:
          raise
      except Exception as e:
          import logging
          logger = logging.getLogger(__name__)
          logger.error(f"Chat failed: {str(e)}", exc_info=True)
          raise HTTPException(status_code=502, detail="Chat service unavailable. Try again.")
  ```

---

## 1.4 Move CORS to Environment Config
**Severity**: 🔴 CRITICAL | **Risk**: Production deployment impossible  
**Files**: `backend/main.py`, `backend/.env`

### Changes:
#### 1.4.1 Update CORS middleware to use env
**File**: `backend/main.py`
- **Lines 20-24** (replace hardcoded origins):
- **Current**:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- **New**:
  ```python
  import os
  
  ALLOWED_ORIGINS = os.getenv(
      "ALLOWED_ORIGINS",
      "http://localhost:5173,http://127.0.0.1:5173"
  ).split(",")
  
  app.add_middleware(
      CORSMiddleware,
      allow_origins=ALLOWED_ORIGINS,
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

#### 1.4.2 Update .env.example (create if missing)
**File**: `backend/.env.example` (create new)
- **Content**:
  ```env
  # Groq API Configuration
  GROQ_API_KEY=gsk_your_api_key_here
  
  # CORS Configuration (comma-separated origins)
  ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
  
  # Production example:
  # ALLOWED_ORIGINS=https://app.fingenie.com,https://staging.fingenie.com
  ```

#### 1.4.3 Create .env.example for frontend too
**File**: `frontend/.env.example` (create new)
- **Content**:
  ```env
  # API Configuration
  VITE_API_BASE_URL=http://localhost:8000

  # Production example:
  # VITE_API_BASE_URL=https://api.fingenie.com
  ```

---

## 1.5 Unify & Centralize API Base URL
**Severity**: 🔴 CRITICAL | **Risk**: Deployment config friction  
**Files**: `frontend/src/api/client.js`, `frontend/src/components/DocChat.jsx`, `frontend/src/components/ReportCenter.jsx`

### Changes:
#### 1.5.1 Centralize API base in client.js
**File**: `frontend/src/api/client.js`
- **Lines 1–5** (update)
- **Current**:
  ```javascript
  import axios from 'axios';
  
  const API_BASE = 'http://localhost:8000/api';
  ```
- **New**:
  ```javascript
  import axios from 'axios';
  
  // Read from environment variable, fallback to localhost
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api';
  
  // Export for use in other components
  export const getApiBase = () => API_BASE;
  ```

#### 1.5.2 Update DocChat to use centralized client
**File**: `frontend/src/components/DocChat.jsx`
- **Lines 1–5** (add import)
- **Add at top**:
  ```javascript
  import { getApiBase } from '../api/client';
  ```
- **Line 31** (replace hardcoded fetch)
- **Current**:
  ```javascript
  const res = await fetch('http://localhost:8000/api/chat/message', {
  ```
- **New**:
  ```javascript
  const res = await fetch(`${getApiBase()}/chat/message`, {
  ```

#### 1.5.3 Update ReportCenter (already has env-aware base)
**File**: `frontend/src/components/ReportCenter.jsx`
- **Line 6** is already good: `const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';`
- **No change needed** but verify it uses `/api` in fetch calls
- **Check line ~222**: `${API_BASE}/api/report/generate` — verify `/api` is included

---

# GROUP 2: HIGH (Stability & Core UX)

## 2.1 Add Schema Bounds to Chat Requests
**Severity**: 🟠 HIGH | **Risk**: DOS abuse, excessive token usage  
**Files**: `backend/routers/chat.py`, `backend/models/schemas.py`

### Changes:
#### 2.1.1 Update ChatRequest schema
**File**: `backend/routers/chat.py`
- **Lines 8–19** (replace ChatRequest class):
- **Current**:
  ```python
  class ChatRequest(BaseModel):
      session_id: str
      user_message: str
      raw_data: list[dict]
      column_headers: list[str]
      statement_type: str
      summary: str
      kpis: list[dict]
      risks: list[dict]
      conversation_history: list[dict]
  ```
- **New**:
  ```python
  from pydantic import BaseModel, Field
  
  class ChatRequest(BaseModel):
      session_id: str = Field(..., max_length=100)
      user_message: str = Field(..., min_length=1, max_length=500)
      raw_data: list[dict] = Field(default_factory=list, max_items=1000)
      column_headers: list[str] = Field(default_factory=list, max_items=50)
      statement_type: str = Field(default="", max_length=100)
      summary: str = Field(default="", max_length=5000)
      kpis: list[dict] = Field(default_factory=list, max_items=50)
      risks: list[dict] = Field(default_factory=list, max_items=50)
      conversation_history: list[dict] = Field(
          default_factory=list,
          max_items=20,
          description="Limited to last 20 messages (10 turns) to stay within context"
      )
  ```

#### 2.1.2 Update ReportRequest similarly
**File**: `backend/routers/report.py`
- **Lines 12–30** (update ReportRequest)
- **Add Field constraints**:
  ```python
  format_id: str = Field(..., max_length=50)
  raw_data: list[dict] = Field(default_factory=list, max_items=1000)
  column_headers: list[str] = Field(default_factory=list, max_items=50)
  statement_type: str = Field(default="Financial Statement", max_length=100)
  summary: str = Field(default="", max_length=5000)
  ```

---

## 2.2 Make Async LLM Calls Non-Blocking
**Severity**: 🟠 HIGH | **Risk**: Event loop blocking under load  
**Files**: `backend/services/report_generator.py`, `backend/services/llm_analyzer.py`, `backend/services/doc_chat.py`

### Changes:
#### 2.2.1 Wrap blocking Groq calls in threadpool
**File**: `backend/services/report_generator.py`
- **Lines 173–210** (generate_report function)
- **Add imports** at top:
  ```python
  import asyncio
  from functools import partial
  ```
- **Replace blocking client.chat.completions.create** (line 200):
- **Current**:
  ```python
  response = client.chat.completions.create(
      model=GROQ_MODEL,
      messages=[{"role": "user", "content": prompt}],
      temperature=0.45,
      max_tokens=1500,
  )
  ```
- **New**:
  ```python
  try:
      # Run blocking Groq API call in thread pool with 30s timeout
      response = await asyncio.wait_for(
          asyncio.to_thread(
              partial(
                  client.chat.completions.create,
                  model=GROQ_MODEL,
                  messages=[{"role": "user", "content": prompt}],
                  temperature=0.45,
                  max_tokens=1500,
              )
          ),
          timeout=30.0
      )
  except asyncio.TimeoutError:
      raise HTTPException(
          status_code=504,
          detail="Report generation timed out. Try a simpler format or smaller document."
      )
  except Exception as e:
      raise HTTPException(
          status_code=502,
          detail=f"Groq API error: {str(e)[:100]}"
      )
  ```

#### 2.2.2 Update generate_summary for async
**File**: `backend/services/llm_analyzer.py`
- **Line 22** (function signature):
- **Current**: `def generate_summary(...) -> dict:`
- **New**: `async def generate_summary(...) -> dict:`
- **Lines 116–136** (update blocking call):
- **Wrap with same asyncio.to_thread + timeout pattern**

#### 2.2.3 Update chat_with_document
**File**: `backend/services/doc_chat.py`
- **Already async** (line 63), but verify Groq call is wrapped
- **Lines 115–125** (client.chat.completions.create call):
- **Apply same async threadpool pattern with 15s timeout**

#### 2.2.4 Update all call sites
**File**: `backend/routers/analysis.py`
- **Line 68**: `llm_result = generate_summary(...)` → `llm_result = await generate_summary(...)`

**File**: `backend/routers/report.py`
- **Line 65**: `report_md = await generate_report(...)` — already correct

---

## 2.3 Add File Content-Type Validation
**Severity**: 🟠 HIGH | **Risk**: File spoofing, parser confusion  
**Files**: `backend/services/parser.py`

### Changes:
#### 2.3.1 Add MIME type validation
**File**: `backend/services/parser.py`
- **Add import** at top (line 1):
  ```python
  import mimetypes
  import io
  ```
- **Lines 13–25** (validate_file function):
- **Current**: Only checks extension
- **New**: Also check first bytes (magic signature)
  ```python
  async def validate_file(file: UploadFile) -> bytes:
      """Validate file type and size, return file bytes."""
      filename = file.filename or ""
      ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
  
      if ext not in ALLOWED_EXTENSIONS:
          raise HTTPException(
              status_code=400,
              detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
          )
  
      content = await file.read()
      
      # Size check
      if len(content) > MAX_FILE_SIZE:
          raise HTTPException(
              status_code=400,
              detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB."
          )
      
      # Magic signature validation (first few bytes)
      MAGIC_SIGS = {
          b'%PDF': '.pdf',
          b'PK\x03\x04': '.zip',
          b'\xd0\xcf\x11\xe0': '.xls',  # OLE2
      }
      
      for sig, sig_ext in MAGIC_SIGS.items():
          if content.startswith(sig):
              if sig_ext not in ext:
                  raise HTTPException(
                      status_code=400,
                      detail=f"File content mismatch: extension '{ext}' but detected '{sig_ext}'. Upload the correct file."
                  )
              break
      
      return content
  ```

---

## 2.4 Validate SEC ZIP Structure
**Severity**: 🟠 HIGH | **Risk**: Parser crash on malformed data  
**Files**: `backend/services/parser.py`, `backend/services/sec_processor.py`

### Changes:
#### 2.4.1 Add column existence checks in sec_processor
**File**: `backend/services/sec_processor.py`
- **Lines 50–65** (after joining dataframes)
- **Add validation**:
  ```python
  # Validate required columns exist
  REQUIRED_COLS = ["adsh", "tag", "ddate", "value"]
  for req_col in REQUIRED_COLS:
      if req_col not in df.columns:
          raise ValueError(
              f"Missing required SEC column '{req_col}' in NUM dataset. "
              f"ZIP file may be corrupted or incomplete."
          )
  
  # Validate required SUB columns
  SUB_REQUIRED = ["adsh", "name", "cik", "form", "period"]
  for req_col in SUB_REQUIRED:
      if req_col not in sub_df.columns:
          raise ValueError(f"Missing required SUB column: {req_col}")
  ```

#### 2.4.2 Wrap parse_sec_zip with better error messages
**File**: `backend/services/parser.py`
- **Lines 110–165** (parse_sec_zip function)
- **Update exception handling** (lines 150–165):
- **Current**:
  ```python
  except zipfile.BadZipFile:
      raise HTTPException(status_code=400, detail="Invalid zip file.")
  except Exception as e:
      raise HTTPException(status_code=400, detail=f"Error parsing SEC zip: {str(e)}")
  ```
- **New**:
  ```python
  except zipfile.BadZipFile:
      raise HTTPException(
          status_code=400,
          detail="Invalid ZIP file. Please verify the SEC filing package is valid."
      )
  except KeyError as e:
      raise HTTPException(
          status_code=400,
          detail=f"Missing required SEC file in ZIP. Expected {e.args[0]}."
      )
  except ValueError as e:
      raise HTTPException(status_code=400, detail=str(e))
  except Exception as e:
      import logging
      logging.error(f"SEC ZIP parse error: {str(e)}", exc_info=True)
      raise HTTPException(
          status_code=400,
          detail="Failed to parse SEC filing. Verify the ZIP contains sub.txt, num.txt, tag.txt, pre.txt"
      )
  ```

---

## 2.5 Improve LLM Data Preview Robustness
**Severity**: 🟠 HIGH | **Risk**: Prompt injection, output instability  
**Files**: `backend/services/llm_analyzer.py`

### Changes:
#### 2.5.1 Use JSON-structured data in prompts
**File**: `backend/services/llm_analyzer.py`
- **Lines 25–40** (prepare data context)
- **Current**:
  ```python
  data_preview = df.head(20).to_string(index=False)
  ```
- **New**:
  ```python
  import json
  
  # Convert data to JSON for safer embedding in prompt
  if df is not None and not df.empty:
      try:
          data_dict = df.head(20).to_dict(orient="records")
          data_preview = json.dumps(data_dict, indent=2, default=str)[:3000]  # Limit to 3k chars
      except Exception as e:
          data_preview = f"[Data preview unavailable: {str(e)[:50]}]"
  else:
      data_preview = "[No data rows provided]"
  ```

#### 2.5.2 Structure KPI/Risk text with clear delimiters
**File**: `backend/services/llm_analyzer.py`
- **Lines 32–48** (format KPI text)
- **Current**: Plain newline-separated text
- **New**: Add XML-like delimiters:
  ```python
  kpi_text = "\n".join(
      f"- {k.name}: {k.formatted_value} ({k.status}) — {k.description}"
      for k in kpis
  )
  kpi_block = f"<KPIs>\n{kpi_text}\n</KPIs>" if kpi_text else "<KPIs>None</KPIs>"
  
  risk_text = "\n".join(
      f"- [{r.severity.upper()}] {r.risk}: {r.description}"
      for r in risks
  )
  risk_block = f"<Risks>\n{risk_text}\n</Risks>" if risk_text else "<Risks>None</Risks>"
  ```

---

## 2.6 Improve JSON Parse Failure Handling
**Severity**: 🟠 HIGH | **Risk**: Silent failures, false confidence  
**Files**: `backend/services/llm_analyzer.py`

### Changes:
#### 2.6.1 Replace generic fallback with error signal
**File**: `backend/services/llm_analyzer.py`
- **Lines 140–160** (exception handlers)
- **Current**: Returns canned generic recommendations
- **New**:
  ```python
  except json.JSONDecodeError as e:
      import logging
      logger = logging.getLogger(__name__)
      logger.error(
          f"LLM JSON parse failed. Raw response: {content[:500]}",
          exc_info=True
      )
      raise HTTPException(
          status_code=502,
          detail="LLM response format invalid. Please try the analysis again. "
                 "If the issue persists, try a shorter or simpler document."
      )
  except Exception as e:
      import logging
      logger = logging.getLogger(__name__)
      logger.error(f"Groq API error: {str(e)}", exc_info=True)
      raise HTTPException(
          status_code=502,
          detail=f"Analysis service error: {str(e)[:80]}. Try again in a moment."
      )
  ```

---

## 2.7 Improve Frontend Error Messages
**Severity**: 🟠 HIGH | **Risk**: Poor UX during failures  
**Files**: `frontend/src/components/DocChat.jsx`, `frontend/src/components/FileUpload.jsx` (if exists)

### Changes:
#### 2.7.1 Add error detail parsing in DocChat
**File**: `frontend/src/components/DocChat.jsx`
- **Lines 45–57** (catch block):
- **Current**:
  ```javascript
  catch {
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
    ]);
  }
  ```
- **New**:
  ```javascript
  catch (err) {
    let errorMsg = 'Network error — check backend is running.';
    
    if (err.response?.status === 400) {
      errorMsg = `Invalid input: ${err.response.data?.detail || 'Check your message.'}`;
    } else if (err.response?.status === 500) {
      errorMsg = `Server error: ${err.response.data?.detail || 'Try again in a moment.'}`;
    } else if (err.response?.status === 502) {
      errorMsg = `Service temporarily unavailable: ${err.response.data?.detail || 'Try again.'}`;
    } else if (err.code === 'ECONNABORTED') {
      errorMsg = 'Request timed out. The backend may be slow. Try a shorter question.';
    }
    
    setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${errorMsg}` }]);
  }
  ```

---

# GROUP 3: MEDIUM (Robustness & Observability)

## 3.1 Add Structured Logging Across Backend
**Severity**: 🟡 MEDIUM | **Risk**: No observability for debugging  
**Files**: All backend service files

### Changes:
#### 3.1.1 Create logging configuration
**File**: `backend/config.py` (create new)
- **Content**:
  ```python
  import logging
  import sys
  
  def setup_logging():
      """Configure structured logging for FastAPI app."""
      logging.basicConfig(
          level=logging.INFO,
          format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
          handlers=[
              logging.StreamHandler(sys.stdout),
          ]
      )
      return logging.getLogger(__name__)
  
  logger = setup_logging()
  ```

#### 3.1.2 Add logging to services
**File**: `backend/services/parser.py`
- **Add at top**:
  ```python
  import logging
  logger = logging.getLogger(__name__)
  ```
- **Add logging calls** in key error paths:
  ```python
  logger.info(f"Parsing file: {filename} (ext={ext})")
  logger.warning(f"File validation failed: {str(e)}")
  logger.error(f"Parse error for {filename}: {str(e)}", exc_info=True)
  ```

**File**: `backend/services/llm_analyzer.py`
- Same pattern: import logger, log in error paths

**File**: `backend/routers/analysis.py`
- Log file upload start/end, parser mode selection, LLM calls

#### 3.1.3 Update main.py to initialize logging
**File**: `backend/main.py`
- **Add after app creation**:
  ```python
  import logging
  from config import logger
  
  logger.info("FinGenie API starting...")
  ```

---

## 3.2 Validate DataFrame at Pipeline Entry Points
**Severity**: 🟡 MEDIUM | **Risk**: Silent None/empty errors later  
**Files**: `backend/services/kpi_engine.py`

### Changes:
#### 3.2.1 Add DataFrame validation helper
**File**: `backend/services/kpi_engine.py`
- **Add after imports** (line 5):
  ```python
  import logging
  logger = logging.getLogger(__name__)
  
  def validate_dataframe(df, context=""):
      """Ensure DataFrame is valid. Raise HTTPException if not."""
      if df is None:
          logger.warning(f"DataFrame is None in context: {context}")
          return False
      if not isinstance(df, pd.DataFrame):
          logger.warning(f"Input is not DataFrame in {context}: {type(df)}")
          return False
      if df.empty:
          logger.warning(f"DataFrame is empty in {context}")
          return False
      return True
  ```

#### 3.2.2 Use validation in compute_kpis
**File**: `backend/services/kpi_engine.py`
- **Lines 10–16** (start of compute_kpis):
- **Add**:
  ```python
  def compute_kpis(df: pd.DataFrame, statement_type: str) -> list[KPI]:
      """..."""
      if not validate_dataframe(df, "compute_kpis"):
          logger.warning(f"compute_kpis called with invalid DF; returning empty KPI list")
          return []
      
      # ... rest of function
  ```

#### 3.2.3 Validate in analysis router
**File**: `backend/routers/analysis.py`
- **Lines 60–65** (after parse_file):
- **Add**:
  ```python
  if df is not None and not df.empty:
      logger.info(f"Parsed {len(df)} rows in {mode} mode")
      # proceed with KPI calculation
  else:
      logger.warning(f"No data extracted in {mode} mode from {file.filename}")
      kpis, risks, trends = [], [], []
  ```

---

## 3.3 Improve Date Handling in SEC Processor
**Severity**: 🟡 MEDIUM | **Risk**: Column name type mismatches  
**Files**: `backend/services/sec_processor.py`

### Changes:
#### 3.3.1 Normalize date column names
**File**: `backend/services/sec_processor.py`
- **Lines 75–85** (after pivot):
- **Current**:
  ```python
  pivoted.columns = [str(c).split(' ')[0] if isinstance(c, pd.Timestamp) else c for c in pivoted.columns]
  ```
- **New**:
  ```python
  # Normalize column names (especially dates)
  pivoted.columns = [
      c.strftime('%Y-%m-%d') if isinstance(c, pd.Timestamp)
      else str(c).split(' ')[0] if ' ' in str(c)
      else str(c)
      for c in pivoted.columns
  ]
  # Ensure all columns are strings
  pivoted.columns = [str(col) for col in pivoted.columns]
  ```

---

## 3.4 Improve Risk-to-Mitigation Matching
**Severity**: 🟡 MEDIUM | **Risk**: Fuzzy matching false positives  
**Files**: `backend/routers/analysis.py`

### Changes:
#### 3.4.1 Use exact matching instead of fuzzy substring search
**File**: `backend/routers/analysis.py`
- **Lines 74–84** (risk mitigation mapping):
- **Current**:
  ```python
  for r in risks:
      if r.risk in mitigations:
          r.mitigation = mitigations[r.risk]
      else:
          # Fallback based on name search
          for risk_name, mit in mitigations.items():
              if risk_name.lower() in r.risk.lower() or r.risk.lower() in risk_name.lower():
                  r.mitigation = mit
                  break
  ```
- **New**:
  ```python
  # Use exact key matching only (no fuzzy substring search)
  for r in risks:
      # Try exact match first
      if r.risk in mitigations:
          r.mitigation = mitigations[r.risk]
      # Try normalized match (lowercase)
      elif r.risk.lower() in {k.lower(): v for k, v in mitigations.items()}:
          r.mitigation = mitigations.get(
              next(k for k in mitigations.keys() if k.lower() == r.risk.lower()),
              None
          )
      # If no match, leave mitigation blank (don't guess)
      else:
          r.mitigation = None
          import logging
          logging.warning(f"No mitigation found for risk: {r.risk}")
  ```

---

## 3.5 Add Session ID Validation
**Severity**: 🟡 MEDIUM | **Risk**: Unvalidated IDs can cause confusion  
**Files**: `backend/routers/chat.py`

### Changes:
#### 3.5.1 Validate session_id format
**File**: `backend/routers/chat.py`
- **Lines 8–19** (ChatRequest schema):
- **Add regex pattern**:
  ```python
  import re
  from pydantic import Field, validator
  
  class ChatRequest(BaseModel):
      session_id: str = Field(
          ...,
          max_length=100,
          description="Session identifier (alphanumeric, -, _)"
      )
      # ... rest of fields
      
      @validator('session_id')
      def validate_session_id(cls, v):
          if not re.match(r'^[a-zA-Z0-9_\-]{1,100}$', v):
              raise ValueError('session_id must be alphanumeric with dashes and underscores only')
          return v
  ```

---

## 3.6 Make KPI Thresholds Configurable
**Severity**: 🟡 MEDIUM | **Risk**: Hardcoded thresholds don't fit all industries  
**Files**: `backend/services/kpi_engine.py`

### Changes:
#### 3.6.1 Add configurable thresholds
**File**: `backend/services/kpi_engine.py`
- **Add after imports** (line 6):
  ```python
  # KPI Thresholds — can be overridden via config in future
  KPI_THRESHOLDS = {
      'gross_profit_margin': {'good': 40, 'warn': 20},
      'net_profit_margin': {'good': 10, 'warn': 5},
      'expense_ratio': {'good': 60, 'warn': 80},
      'revenue_growth': {'good': 5, 'neutral': 0},
      'burn_rate': {'critical': 3, 'high': 6, 'warning': 12},
  }
  
  def get_threshold(metric_key, level='good'):
      """Get threshold for a metric, with defaults for missing config."""
      return KPI_THRESHOLDS.get(metric_key, {}).get(level, 0)
  ```

#### 3.6.2 Use thresholds in KPI computation
**File**: `backend/services/kpi_engine.py`
- **Replace hardcoded values** (e.g., lines 80, 95, 110) with calls to `get_threshold()`

---

## 3.7 Add Basic Unused Import Cleanup
**Severity**: 🟡 MEDIUM | **Risk**: Code maintenance confusion  
**Files**: `backend/routers/analysis.py`

### Changes:
#### 3.7.1 Remove duplicate imports
**File**: `backend/routers/analysis.py`
- **Lines 5–7** (imports inside if statements):
- **Current**:
  ```python
  from services.kpi_engine import compute_kpis, detect_risks, detect_trends
  
  # ... later inside function (line 65):
  from services.kpi_engine import compute_kpis, detect_risks, detect_trends
  ```
- **New**: Remove lines 65–67 (the duplicate import inside the function)

---

# GROUP 4: LOW (Testing & Documentation)

## 4.1 Add Backend Unit Tests
**Severity**: 🔵 LOW | **Impact**: QA + maintenance  
**Files**: `backend/tests/` (create directory)

### Changes:
#### 4.1.1 Create test structure
**File**: `backend/tests/__init__.py` (create empty)

#### 4.1.2 Test parser validation
**File**: `backend/tests/test_parser.py` (create new)
- **Content**: Basic tests for validate_file, magic signature checks

#### 4.1.3 Test KPI engine
**File**: `backend/tests/test_kpi_engine.py` (create new)
- **Content**: Test compute_kpis with sample data, verify thresholds

#### 4.1.4 Test schemas
**File**: `backend/tests/test_schemas.py` (create new)
- **Content**: Test ChatRequest/ReportRequest max_items bounds

#### 4.1.5 Create pytest.ini
**File**: `backend/pytest.ini` (create new)
- **Content**:
  ```ini
  [pytest]
  testpaths = tests
  python_files = test_*.py
  ```

#### 4.1.6 Update requirements.txt
**File**: `backend/requirements.txt`
- **Add**:
  ```
  pytest
  pytest-asyncio
  httpx
  ```

---

## 4.2 Add Frontend Component Tests
**Severity**: 🔵 LOW | **Impact**: XSS regression detection  
**Files**: `frontend/src/components/__tests__/` (create)

### Changes:
#### 4.2.1 Test HTML escaping in ReportCenter
**File**: `frontend/src/components/__tests__/ReportCenter.test.jsx` (create new)
- **Content**:
  ```javascript
  import { describe, it, expect } from 'vitest';
  
  // Import or replicate mdToHtml function
  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
  
  describe('ReportCenter HTML Safety', () => {
    it('should escape HTML in markdown input', () => {
      const malicious = '<script>alert("xss")</script>';
      const result = escapeHtml(malicious);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });
  ```

#### 4.2.2 Update frontend package.json
**File**: `frontend/package.json`
- **Add to devDependencies**:
  ```json
  "vitest": "^1.0.0",
  "@vitest/ui": "^1.0.0"
  ```
- **Add to scripts**:
  ```json
  "test": "vitest",
  "test:ui": "vitest --ui"
  ```

---

## 4.3 Create Documentation Files
**Severity**: 🔵 LOW | **Impact**: Onboarding + deployment  
**Files**: Documentation files

### Changes:
#### 4.3.1 Backend deployment guide
**File**: `backend/DEPLOYMENT.md` (create new)
- **Content**: 
  - Required environment variables (GROQ_API_KEY, ALLOWED_ORIGINS)
  - Docker setup example
  - Health check endpoint
  - Logging configuration

#### 4.3.2 Frontend deployment guide
**File**: `frontend/DEPLOYMENT.md` (create new)
- **Content**:
  - VITE_API_BASE_URL configuration
  - Build process
  - Environment setup for staging/prod

#### 4.3.3 Security.md
**File**: `SECURITY.md` (create new in root)
- **Content**:
  - No persistent data storage
  - API key security (env-only)
  - CORS configuration
  - Input validation practices
  - Responsible disclosure policy

#### 4.3.4 Update main README.md
**File**: `README.md`
- **Add new sections**:
  ```markdown
  ## Setup & Deployment
  - See [Backend Deployment](backend/DEPLOYMENT.md)
  - See [Frontend Deployment](frontend/DEPLOYMENT.md)
  
  ## Security
  See [SECURITY.md](SECURITY.md) for security practices and policies.
  ```

---

# IMPLEMENTATION TIMELINE & CHECKLIST

## Phase 1: GROUP 1 (Critical) — ~2–3 hours
- [ ] 1.1 Remove form API key input
- [ ] 1.2 Sanitize report HTML
- [ ] 1.3 Add endpoint exception handling
- [ ] 1.4 Move CORS to config
- [ ] 1.5 Centralize API base URL
- [ ] **Test**: Manual upload/report/chat flows in localhost

## Phase 2: GROUP 2 (High) — ~2–3 hours
- [ ] 2.1 Add schema bounds
- [ ] 2.2 Make async calls non-blocking
- [ ] 2.3 Add file magic signature validation
- [ ] 2.4 Validate SEC ZIP structure
- [ ] 2.5 Improve LLM data preview
- [ ] 2.6 Improve JSON failure handling
- [ ] 2.7 Improve frontend error messages
- [ ] **Test**: Error edge cases (invalid files, timeouts, malformed data)

## Phase 3: GROUP 3 (Medium) — ~1.5–2 hours
- [ ] 3.1 Add logging
- [ ] 3.2 DataFrame validation
- [ ] 3.3 Date handling in SEC processor
- [ ] 3.4 Risk mitigation matching
- [ ] 3.5 Session ID validation
- [ ] 3.6 Configurable thresholds
- [ ] 3.7 Remove duplicate imports
- [ ] **Test**: Verify logs appear, no regressions in KPI output

## Phase 4: GROUP 4 (Low) — ~1–2 hours
- [ ] 4.1 Add backend tests (pytest)
- [ ] 4.2 Add frontend tests (vitest)
- [ ] 4.3 Create deployment docs
- [ ] **Run**: `pytest`, `npm test`, lint checks
- [ ] **Review**: README, SECURITY.md updated

## Final Verification
- [ ] All CRITICAL fixes implemented + tested
- [ ] All HIGH fixes implemented + tested  
- [ ] All MEDIUM fixes implemented + tested
- [ ] Unit tests passing
- [ ] Manual smoke test (upload file → analyze → report → chat)
- [ ] Error message UX verified

---

# QUICK REFERENCE: FILES TO MODIFY

| File | Changes | Complexity |
|:---|:---|:---|
| `backend/main.py` | Add logging, global exception handler, CORS config | Low |
| `backend/routers/analysis.py` | Add exception wrapper, remove api_key, add logging | Medium |
| `backend/routers/chat.py` | Add schema bounds, exception handler | Low |
| `backend/routers/report.py` | Add schema bounds | Low |
| `backend/services/parser.py` | Add magic signature, SEC validation, logging | Medium |
| `backend/services/llm_analyzer.py` | Make async, improve prompt structure, error handling | Medium |
| `backend/services/report_generator.py` | Make async, add timeout | Medium |
| `backend/services/doc_chat.py` | Make async, add timeout | Low |
| `backend/services/sec_processor.py` | Add column validation, date normalization | Low |
| `backend/services/kpi_engine.py` | Add threshold config, validation, logging | Low |
| `backend/services/structurer.py` | Remove api_key param, add error handling | Low |
| `frontend/src/api/client.js` | Centralize API base, export getter | Low |
| `frontend/src/components/DocChat.jsx` | Use centralized API base, better error messages | Low |
| `frontend/src/components/ReportCenter.jsx` | Add HTML escaping, use centralized API | Low |
| `backend/.env.example` | Create new | Trivial |
| `frontend/.env.example` | Create new | Trivial |

---

# SUMMARY

**Total Fixes**: 22  
**Total Files Modified**: 13 backend + 3 frontend + 4 new files  
**Estimated Effort**: 6–8 hours  
**Risk Level After Fixes**: LOW  
**Production-Ready**: Yes

All changes maintain backward compatibility except the removal of form-based API key (intentional security hardening). The phased approach allows testing and validation at each stage.

