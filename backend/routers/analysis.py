from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import logging

from models.schemas import AnalysisResponse, HealthResponse
from services.parser import parse_file
from services.kpi_engine import compute_kpis, detect_risks, detect_trends
from services.llm_analyzer import generate_summary

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["analysis"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", message="FinGenie API is running")


@router.post("/upload", response_model=AnalysisResponse)
async def upload_and_analyze(
    file: UploadFile = File(...),
):
    """
    Upload a financial document (PDF/Excel/CSV/SEC ZIP) and receive full analysis.
    """
    try:
        # 1. Parse the uploaded file (PDF/Excel/CSV/Zip)
        logger.info(f"Starting analysis for file: {file.filename}")
        df, raw_content, mode, statement_type = await parse_file(file)
        logger.info(f"File parsed successfully in {mode} mode: {statement_type}")

        sec_metadata = None

        # 2. Handle SEC ZIP specialized mode
        if mode == "sec_zip":
            from services.parser import parse_sec_zip
            from services.sec_processor import process_sec_datasets
            
            logger.info(f"Processing SEC ZIP file")
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
            logger.info(f"Extracting data from text content (PDF with no tables)")
            # raw_content is actually raw_text in this case (per parser.py return)
            from services.structurer import extract_data_from_text
            df, extracted_type = extract_data_from_text(raw_content)
            if not df.empty:
                statement_type = extracted_type

        # 4. Compute KPIs (if we have a DataFrame)
        kpis = []
        risks = []
        trends = []
        if df is not None and not df.empty:
            logger.info(f"Computing KPIs and risks for {len(df)} rows")
            kpis = compute_kpis(df, statement_type)
            risks = detect_risks(kpis, df)
            trends = detect_trends(df)
            logger.info(f"Computed {len(kpis)} KPIs, {len(risks)} risks, {len(trends)} trends")
        else:
            logger.warning(f"No data extracted from {file.filename} for KPI computation")

        # 5. Generate AI summary
        llm_result = await generate_summary(df, statement_type, kpis, risks, trends)
        
        # Map mitigations back to risks using exact matching only
        mitigations = llm_result.get("risk_mitigations", {})
        for r in risks:
            # Try exact match first
            if r.risk in mitigations:
                r.mitigation = mitigations[r.risk]
            # Try normalized match (lowercase)
            else:
                normalized_mitigations = {k.lower(): v for k, v in mitigations.items()}
                if r.risk.lower() in normalized_mitigations:
                    r.mitigation = normalized_mitigations[r.risk.lower()]
                # If no match, leave mitigation blank (don't guess)
                else:
                    r.mitigation = None
                    logger.warning(f"No mitigation found for risk: {r.risk}")

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
    
    except HTTPException:
        # Re-raise FastAPI HTTP errors as-is
        raise
    
    except Exception as e:
        logger.error(f"Upload analysis failed for {file.filename}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)[:100]}. Please try again or contact support."
        )
