import io
import zipfile
import pandas as pd
import pdfplumber
from fastapi import UploadFile, HTTPException


ALLOWED_EXTENSIONS = {".pdf", ".xlsx", ".xls", ".csv", ".zip", ".txt"}
MAX_FILE_SIZE = 200 * 1024 * 1024  # 200MB


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
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB."
        )

    return content


def parse_pdf(content: bytes) -> tuple[pd.DataFrame | None, str | None, str]:
    """Extract tables or raw text from a PDF file using pdfplumber."""
    all_tables = []
    raw_text = ""

    with pdfplumber.open(io.BytesIO(content)) as pdf:
        # 1. Extract raw text from all pages
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                raw_text += text + "\n\n"

            # 2. Extract tables
            tables = page.extract_tables()
            for table in tables:
                if table and len(table) > 1:
                    # Use first row as header
                    header = [str(h).strip() if h else f"Col_{i}" for i, h in enumerate(table[0])]
                    rows = table[1:]
                    df = pd.DataFrame(rows, columns=header)
                    all_tables.append(df)

    if all_tables:
        # Mode: table
        # Combine all tables — take the largest one as primary
        combined = max(all_tables, key=len)
        return clean_dataframe(combined), None, "table"

    if raw_text.strip():
        # Mode: text (fallback)
        return None, raw_text, "text"

    raise HTTPException(
        status_code=400,
        detail="No financial data (tables or text) found in the PDF. Please upload a clear document."
    )


def parse_excel(content: bytes) -> pd.DataFrame:
    """Parse an Excel file, reading the first sheet with data."""
    try:
        xls = pd.ExcelFile(io.BytesIO(content))
        # Read first sheet that has data
        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            if not df.empty and len(df) > 1:
                return clean_dataframe(df)

        raise HTTPException(
            status_code=400,
            detail="No data found in the Excel file."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading Excel file: {str(e)}")


def parse_csv(content: bytes) -> pd.DataFrame:
    """Parse a CSV file."""
    try:
        df = pd.read_csv(io.BytesIO(content))
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty.")
        return clean_dataframe(df)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")


def parse_sec_zip(content: bytes) -> dict[str, pd.DataFrame]:
    """
    Extract SUB, NUM, TAG, PRE datasets from an SEC zip archive with memory efficiency.
    1. Read 'sub' to find the most recent/relevant filing (adsh).
    2. Filter 'num', 'tag', 'pre' by that adsh while reading in chunks.
    """
    dfs = {}
    required_files = ["sub.txt", "num.txt", "tag.txt", "pre.txt"]
    
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as z:
            filenames = {f.lower(): f for f in z.namelist()}
            
            for req in required_files:
                if req not in filenames:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Missing required SEC file: {req} in zip archive."
                    )
            
            # 1. Read SUB.txt first to find the target ADSH
            with z.open(filenames["sub.txt"]) as f:
                sub_df = pd.read_csv(f, sep="\t", encoding_errors="replace")
                # Pick the most recent submission
                sub_df["period"] = pd.to_numeric(sub_df["period"], errors='coerce')
                sub_df = sub_df.sort_values("period", ascending=False)
                target_adsh = sub_df["adsh"].iloc[0]
                dfs["sub"] = sub_df[sub_df["adsh"] == target_adsh].copy()

            # 2. Filter NUM.txt in chunks (Memory optimization)
            with z.open(filenames["num.txt"]) as f:
                num_chunks = pd.read_csv(f, sep="\t", encoding_errors="replace", chunksize=100000)
                filtered_num = pd.concat([chunk[chunk["adsh"] == target_adsh] for chunk in num_chunks])
                dfs["num"] = filtered_num

            # 3. Filter PRE.txt in chunks
            with z.open(filenames["pre.txt"]) as f:
                pre_chunks = pd.read_csv(f, sep="\t", encoding_errors="replace", chunksize=50000)
                filtered_pre = pd.concat([chunk[chunk["adsh"] == target_adsh] for chunk in pre_chunks])
                dfs["pre"] = filtered_pre

            # 4. Load TAG.txt (usually small enough to load fully, but let's be safe)
            with z.open(filenames["tag.txt"]) as f:
                dfs["tag"] = pd.read_csv(f, sep="\t", encoding_errors="replace")
                
        return dfs
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid zip file.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing SEC zip: {str(e)}")


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the extracted DataFrame: remove empty rows/cols, parse numbers."""
    # Drop completely empty rows and columns
    df = df.dropna(how="all").dropna(axis=1, how="all")

    # Reset index
    df = df.reset_index(drop=True)

    # Clean column names
    df.columns = [str(c).strip() for c in df.columns]

    # Try to convert numeric columns
    for col in df.columns[1:]:  # Skip first column (usually labels)
        df[col] = df[col].apply(_parse_number)

    return df


def _parse_number(val):
    """Attempt to parse a value as a number, stripping currency symbols."""
    if pd.isna(val) or val is None:
        return None
    s = str(val).strip()
    if not s or s in ("-", "—", "N/A", "n/a", ""):
        return None

    # Remove currency symbols and formatting
    s = s.replace("$", "").replace("€", "").replace("£", "").replace("₹", "")
    s = s.replace(",", "").replace(" ", "")

    # Handle parentheses as negatives: (123) -> -123
    if s.startswith("(") and s.endswith(")"):
        s = "-" + s[1:-1]

    # Handle percentage
    s = s.replace("%", "")

    try:
        return float(s)
    except ValueError:
        return val


def detect_statement_type(df: pd.DataFrame) -> str:
    """
    Heuristic detection of financial statement type
    based on common row/column labels.
    """
    text = " ".join(str(v).lower() for v in df.values.flatten() if v is not None)
    text += " " + " ".join(str(c).lower() for c in df.columns)

    balance_sheet_keywords = [
        "total assets", "total liabilities", "shareholders equity",
        "current assets", "non-current assets", "current liabilities",
        "retained earnings", "accounts receivable", "accounts payable",
        "long-term debt", "stockholders"
    ]
    income_keywords = [
        "revenue", "net income", "gross profit", "operating income",
        "cost of goods sold", "cogs", "operating expenses", "ebitda",
        "earnings per share", "eps", "sales", "net profit"
    ]
    cashflow_keywords = [
        "cash flow", "operating activities", "investing activities",
        "financing activities", "net cash", "capital expenditure",
        "free cash flow", "depreciation"
    ]

    bs_score = sum(1 for kw in balance_sheet_keywords if kw in text)
    is_score = sum(1 for kw in income_keywords if kw in text)
    cf_score = sum(1 for kw in cashflow_keywords if kw in text)

    scores = {"Balance Sheet": bs_score, "Income Statement": is_score, "Cash Flow Statement": cf_score}
    best = max(scores, key=scores.get)

    return best if scores[best] > 0 else "Financial Statement"


async def parse_file(file: UploadFile) -> tuple[pd.DataFrame | None, str | None, str, str]:
    """Main entry point: validate, parse, detect type."""
    content = await validate_file(file)
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    df = None
    raw_text = None
    mode = "table"

    if ext == ".pdf":
        df, raw_text, mode = parse_pdf(content)
    elif ext in (".xlsx", ".xls"):
        df = parse_excel(content)
    elif ext == ".csv":
        df = parse_csv(content)
    elif ext == ".zip":
        # ZIP is special, return the content for specialized SEC routing
        return None, content, "sec_zip", "SEC Filing"
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    # Detect statement type (fallback to 'Financial Statement')
    if df is not None:
        statement_type = detect_statement_type(df)
    else:
        # For text mode, we'll detect type later or use a generic one
        statement_type = "Financial Statement"

    return df, raw_text, mode, statement_type