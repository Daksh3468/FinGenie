"""
routers/report.py
-----------------
AI narrative report generation endpoint.
POST /api/report/generate
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.report_generator import generate_report, REPORT_FORMATS

router = APIRouter(prefix="/api/report", tags=["report"])


class ReportRequest(BaseModel):
    format_id: str = Field(
        ...,
        max_length=50,
        description=(
            "Report format. One of: "
            "executive, investor, audit, board, startup, academic"
        ),
        example="executive",
    )

    # Full analysis payload from /api/analyze (same shape as ChatRequest)
    raw_data: list[dict] = Field(default_factory=list, max_items=1000)
    column_headers: list[str] = Field(default_factory=list, max_items=50)
    statement_type: str = Field(default="Financial Statement", max_length=100)
    summary: str = Field(default="", max_length=5000)
    kpis: list[dict] = Field(default_factory=list, max_items=50)
    risks: list[dict] = Field(default_factory=list, max_items=50)
    recommendations: list = Field(default_factory=list, max_items=100)
    parsing_mode: str = Field(default="standard", max_length=50)


class ReportResponse(BaseModel):
    format_id: str
    format_label: str
    report_markdown: str               # full markdown text of the generated report
    word_count: int


@router.post("/generate", response_model=ReportResponse)
async def generate_report_endpoint(body: ReportRequest):
    """
    Generate a Groq-powered narrative report from an already-analysed document.

    Send the full `analysisResult` object from your frontend state (same payload
    returned by /api/analyze) plus the chosen `format_id`.

    Returns markdown text ready to render or download.
    """
    if body.format_id not in REPORT_FORMATS:
        valid = list(REPORT_FORMATS.keys())
        raise HTTPException(
            status_code=400,
            detail=f"Unknown format_id '{body.format_id}'. Valid options: {valid}",
        )

    # Build the analysis_result dict from the flattened request fields
    analysis_result = {
        "raw_data":        body.raw_data,
        "column_headers":  body.column_headers,
        "statement_type":  body.statement_type,
        "summary":         body.summary,
        "kpis":            body.kpis,
        "risks":           body.risks,
        "recommendations": body.recommendations,
        "parsing_mode":    body.parsing_mode,
    }

    try:
        report_md = await generate_report(
            analysis_result=analysis_result,
            format_id=body.format_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {str(e)}")

    word_count = len(report_md.split())

    return ReportResponse(
        format_id=body.format_id,
        format_label=REPORT_FORMATS[body.format_id]["label"],
        report_markdown=report_md,
        word_count=word_count,
    )


@router.get("/formats")
async def list_formats():
    """List all available report formats with labels and descriptions."""
    return {
        "formats": [
            {"id": fid, "label": fdata["label"]}
            for fid, fdata in REPORT_FORMATS.items()
        ]
    }
