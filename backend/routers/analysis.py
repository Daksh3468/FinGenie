from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional

from models.schemas import AnalysisResponse, HealthResponse
from services.parser import parse_file
from services.kpi_engine import compute_kpis, detect_risks, detect_trends
from services.llm_analyzer import generate_summary

router = APIRouter(prefix="/api", tags=["analysis"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", message="FinGenie API is running")


@router.post("/upload", response_model=AnalysisResponse)
async def upload_and_analyze(
    file: UploadFile = File(...),
    api_key: Optional[str] = Form(None)
):
    """
    Upload a financial document (PDF/Excel/CSV/SEC ZIP) and receive full analysis.
    """
    # 1. Parse the uploaded file (PDF/Excel/CSV/Zip)
    df, raw_content, mode, statement_type = await parse_file(file)

    sec_metadata = None

    # 2. Handle SEC ZIP specialized mode
    if mode == "sec_zip":
        from services.parser import parse_sec_zip
        from services.sec_processor import process_sec_datasets
        
        # Extract the 4 files from zip
        sec_dfs = parse_sec_zip(raw_content)
        
        # Process datasets (joins, mapping, pivoting)
        df, sec_metadata = process_sec_datasets(
            sec_dfs["sub"], 
            sec_dfs["num"], 
            sec_dfs["tag"], 
            sec_dfs["pre"]
        )
        statement_type = f"SEC {sec_metadata['form']} Filing"
        mode = "sec"

    # 3. If PDF has no tables, use LLM to extract structured data from text
    elif mode == "text" and raw_content:
        # raw_content is actually raw_text in this case (per parser.py return)
        from services.structurer import extract_data_from_text
        df, extracted_type = extract_data_from_text(raw_content, api_key=api_key)
        if not df.empty:
            statement_type = extracted_type

    # 4. Compute KPIs (if we have a DataFrame)
    kpis = []
    risks = []
    trends = []
    if df is not None and not df.empty:
        # Import kpi_engine inside if not already imported
        from services.kpi_engine import compute_kpis, detect_risks, detect_trends
        kpis = compute_kpis(df, statement_type)
        risks = detect_risks(kpis, df)
        trends = detect_trends(df)

    # 5. Generate AI summary
    llm_result = generate_summary(df, statement_type, kpis, risks, trends, api_key=api_key)
    
    # Map mitigations back to risks
    mitigations = llm_result.get("risk_mitigations", {})
    for r in risks:
        if r.risk in mitigations:
            r.mitigation = mitigations[r.risk]
        else:
            # Fallback based on name search
            for risk_name, mit in mitigations.items():
                if risk_name.lower() in r.risk.lower() or r.risk.lower() in risk_name.lower():
                    r.mitigation = mit
                    break

    # 6. Prepare raw data for frontend
    raw_data = []
    column_headers = []
    if df is not None and not df.empty:
        raw_data = df.fillna("").to_dict(orient="records")
        column_headers = list(df.columns)

    return AnalysisResponse(
        statement_type=statement_type,
        raw_data=raw_data,
        column_headers=column_headers,
        kpis=kpis,
        risks=risks,
        trends=trends,
        summary=llm_result["summary"],
        recommendations=llm_result["recommendations"],
        parsing_mode=mode,
        raw_text=raw_content if mode == "text" else None
    )
