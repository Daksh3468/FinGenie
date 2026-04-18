"""
services/report_generator.py
------------------------------
AI narrative report generation service.
Powered by Groq (same llama-3.3-70b model used throughout the app).

Supports 6 report formats:
  executive  → Concise C-suite brief
  investor   → Growth-framed investor memo
  audit      → Formal compliance/risk audit report
  board      → Governance-focused board update
  startup    → Energetic fundraising pitch narrative
  academic   → Structured research-style paper
"""

import asyncio
from functools import partial
from services.groq_client import get_groq_client, GROQ_MODEL
from fastapi import HTTPException

# ── Format definitions ───────────────────────────────────────────────────────

REPORT_FORMATS = {
    "executive": {
        "label": "Executive Brief",
        "instructions": (
            "Write a concise, decision-ready Executive Brief for a C-suite audience. "
            "Lead with the single most critical finding. Use crisp bullet-style language. "
            "Include a section called 'Immediate Actions' with exactly 3 bullet points. "
            "Maximum 400 words. No fluff."
        ),
    },
    "investor": {
        "label": "Investor Memo",
        "instructions": (
            "Write an Investor Memo that frames the business opportunity compellingly. "
            "Highlight growth vectors and momentum. Minimise negative framing — reframe "
            "risks as 'growth unlocks'. Structure: Opportunity → Traction → Risks → Ask. "
            "Maximum 450 words. Forward-looking tone."
        ),
    },
    "audit": {
        "label": "Internal Audit Report",
        "instructions": (
            "Write a formal Internal Audit Report using conservative, compliance-oriented language. "
            "Enumerate ALL risks by severity (critical → high → medium → low). "
            "Cite specific data points from the KPIs. "
            "Include sections: Executive Summary, Findings, Risk Register, Management Response Required. "
            "Maximum 500 words."
        ),
    },
    "board": {
        "label": "Board Update",
        "instructions": (
            "Write a formal Board Update suitable for a governance meeting. "
            "Present a balanced view of performance vs expectations. "
            "Flag any items requiring board-level escalation. "
            "End with a 'Board Resolution Suggestion' section. "
            "Maximum 400 words. Formal tone."
        ),
    },
    "startup": {
        "label": "Startup Pitch Narrative",
        "instructions": (
            "Write an energetic Startup Pitch Narrative targeting seed/Series A investors. "
            "Lead with bold metrics and velocity. Frame every challenge as a 'growth unlock'. "
            "Use confident, momentum-forward language. "
            "End with a clear 'Why Now' paragraph. "
            "Maximum 380 words."
        ),
    },
    "academic": {
        "label": "Research Paper",
        "instructions": (
            "Write a structured Academic Research Report on this financial data. "
            "Include clearly labelled sections: Abstract, Methodology, Findings, Discussion, Conclusion. "
            "Acknowledge the limitations of AI-generated analysis in the Methodology section. "
            "Use formal academic prose. Avoid first-person. "
            "Maximum 550 words."
        ),
    },
}


def _build_report_prompt(
    analysis_result: dict,
    format_id: str,
) -> str:
    """Build the full Groq prompt from analysis data + chosen format."""

    fmt = REPORT_FORMATS.get(format_id, REPORT_FORMATS["executive"])

    kpis           = analysis_result.get("kpis", [])
    risks          = analysis_result.get("risks", [])
    recs           = analysis_result.get("recommendations", [])
    raw_data       = analysis_result.get("raw_data", [])
    col_headers    = analysis_result.get("column_headers", [])
    statement_type = analysis_result.get("statement_type", "Financial Statement")
    summary        = analysis_result.get("summary", "")
    parsing_mode   = analysis_result.get("parsing_mode", "standard")

    # Build readable KPI block
    kpi_lines = [
        f"  • {k.get('name', '?')}: {k.get('formatted_value', k.get('value', '—'))} "
        f"[trend: {k.get('trend', 'stable')}] — {k.get('description', '')}"
        for k in kpis[:10]
    ]
    kpi_block = "\n".join(kpi_lines) if kpi_lines else "  No KPI data available."

    # Build risk block
    risk_lines = [
        f"  • [{r.get('severity', 'medium').upper()}] {r.get('risk', '?')}"
        f" — {r.get('implication', r.get('description', ''))}"
        for r in risks[:8]
    ]
    risk_block = "\n".join(risk_lines) if risk_lines else "  No risks identified."

    # Build recommendations block
    rec_lines = [
        f"  {i+1}. {r if isinstance(r, str) else str(r)}"
        for i, r in enumerate(recs[:6])
    ]
    rec_block = "\n".join(rec_lines) if rec_lines else "  No recommendations available."

    # Sample raw data (up to 6 rows for context, avoid token overflow)
    data_lines = []
    for row in raw_data[:6]:
        cells = " | ".join(f"{c}: {row.get(c, '')}" for c in col_headers[:6])
        data_lines.append(f"  {cells}")
    data_block = (
        "\n".join(data_lines)
        if data_lines
        else "  No raw data available."
    )

    from datetime import date
    today = date.today().strftime("%B %d, %Y")

    return f"""You are FinGenie AI, a sophisticated financial analysis engine.
Generate a professional financial report in markdown format from the structured data below.

=== DOCUMENT METADATA ===
Type:          {statement_type}
Parsing mode:  {parsing_mode}
Report format: {fmt['label']}
Date:          {today}

=== AI SUMMARY (from initial analysis) ===
{summary or 'Not available.'}

=== KEY PERFORMANCE INDICATORS ===
{kpi_block}

=== RISK FACTORS ===
{risk_block}

=== STRATEGIC RECOMMENDATIONS ===
{rec_block}

=== RAW DATA SAMPLE ({len(raw_data)} total rows) ===
{data_block}

=== FORMAT INSTRUCTIONS ===
{fmt['instructions']}

=== STYLE RULES ===
- Use markdown: ## for main sections, ### for subsections, bullet points where appropriate
- Reference ACTUAL numbers from the KPIs — do not invent figures
- Do NOT repeat the raw data verbatim — synthesise and interpret it
- End every report with this exact line:
  *Disclaimer: This report is AI-generated by FinGenie for informational purposes only. It does not constitute financial advice. Consult a qualified financial professional before making decisions.*
- Output ONLY the report text. No preamble, no "Here is your report:", no markdown code fences.
"""


async def generate_report(
    analysis_result: dict,
    format_id: str,
) -> str:
    """
    Generate a markdown narrative report from analysis data.

    Args:
        analysis_result: The full analysis payload from /api/analyze
        format_id:       One of: executive, investor, audit, board, startup, academic

    Returns:
        Markdown string of the generated report.

    Raises:
        ValueError: If format_id is not recognised.
        HTTPException: On API errors.
    """
    if format_id not in REPORT_FORMATS:
        valid = ", ".join(REPORT_FORMATS.keys())
        raise ValueError(
            f"Unknown report format '{format_id}'. Valid options: {valid}"
        )

    prompt = _build_report_prompt(analysis_result, format_id)

    try:
        # Run blocking Groq API call in thread pool with 30s timeout
        client = get_groq_client()
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
        return response.choices[0].message.content.strip()
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
