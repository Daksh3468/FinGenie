import json
import os
import pandas as pd
from groq import Groq
from dotenv import load_dotenv
from models.schemas import KPI, Risk, Trend

load_dotenv()


def get_groq_client(api_key: str = None) -> Groq:
    """Get a Groq client with the provided or env API key."""
    key = api_key or os.getenv("GROQ_API_KEY")
    if not key:
        raise ValueError("Groq API key not found. Set GROQ_API_KEY env variable or provide via request.")
    return Groq(api_key=key)


def generate_summary(
    df: pd.DataFrame,
    statement_type: str,
    kpis: list[KPI],
    risks: list[Risk],
    trends: list[Trend],
    api_key: str = None
) -> dict:
    """
    Send financial data + computed KPIs to Groq LLM for plain-language explanation.
    Returns {summary: str, recommendations: [str]}
    """
    # Prepare data context
    data_preview = df.head(20).to_string(index=False)
    kpi_text = "\n".join(
        f"- {k.name}: {k.formatted_value} ({k.status}) — {k.description}"
        for k in kpis
    )
    risk_text = "\n".join(
        f"- [{r.severity.upper()}] {r.risk}: {r.description}"
        for r in risks
    )
    trend_text = "\n".join(
        f"- {t.metric}: {t.direction} by {t.magnitude}% over {t.period}"
        for t in trends
    ) if trends else "No clear trends detected from the available data."

    prompt = f"""You are a financial analyst AI specializing in translating complex financial data into clear, actionable insights for non-finance professionals, startup founders, and students.

DOCUMENT CONTEXT:
The user uploaded a {statement_type}. Below is the extracted financial data and pre-computed analysis.

## EXTRACTED FINANCIAL DATA (First 20 rows):
{data_preview}

## COMPUTED KEY PERFORMANCE INDICATORS:
{kpi_text}

## IDENTIFIED RISK FLAGS:
{risk_text}

## DETECTED FINANCIAL TRENDS:
{trend_text}

YOUR TASK:
Generate a comprehensive financial health report in JSON format with three components:

1. SUMMARY (2-3 paragraphs):
   - Write as if explaining to a smart friend with NO financial background
   - Start with the big picture: Is this company healthy, struggling, or somewhere in between?
   - Explain what the key metrics actually MEAN in practical terms (e.g., "The company keeps $0.15 of every dollar it makes" vs "15% profit margin")
   - Highlight the most important story the numbers tell
   - Use concrete language: avoid phrases like "appears to" or "seems to" - be direct
   - Make it encouraging where appropriate, but honest about challenges

2. RECOMMENDATIONS (3-6 specific actions):
   - Each recommendation must be ACTIONABLE and SPECIFIC
   - Focus on what someone can actually DO, not just "monitor" or "review"
   - Prioritize recommendations by impact and urgency
   - Format: "Action to take + why it matters + expected outcome"
   - Examples of GOOD recommendations:
     * "Reduce monthly operating expenses by 15% through vendor renegotiation and subscription audit to extend cash runway from 6 to 9 months"
     * "Implement weekly revenue tracking dashboard to catch declining sales trends 30 days earlier"
   - Examples of BAD recommendations (too vague):
     * "Review expenses regularly"
     * "Monitor cash flow"

3. RISK_MITIGATIONS (for each risk identified above):
   - Provide a step-by-step mitigation protocol for EACH risk in the "Detected Risks" section
   - Format as practical, sequential actions someone could start tomorrow
   - Include specific thresholds, timeframes, or metrics where applicable
   - Example structure: "1) Immediate action (within 7 days), 2) Short-term fix (within 30 days), 3) Long-term solution (within 90 days)"

RESPONSE FORMAT (STRICT JSON):
{{
  "summary": "A clear, encouraging 2-3 paragraph explanation of financial health in plain language...",
  "recommendations": [
    "Specific actionable recommendation with expected outcome",
    "Another concrete action with measurable impact",
    ...
  ],
  "risk_mitigations": {{
    "Exact Risk Name from Above": "Step-by-step mitigation protocol: 1) Immediate action... 2) Short-term... 3) Long-term...",
    "Another Exact Risk Name": "Detailed practical steps to address this specific risk..."
  }}
}}

CRITICAL RULES:
- Return ONLY valid JSON (no markdown, no code blocks, no preamble)
- Use the EXACT risk names from the "Identified Risk Flags" section as keys in risk_mitigations
- Make every recommendation specific enough that success can be measured
- Write summary as if talking to a founder who needs to make decisions, not as an academic report
- Be honest but constructive - frame challenges as opportunities for improvement"""

    try:
        client = get_groq_client(api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert financial analyst who excels at making financial data accessible and actionable for non-experts. You always respond with clear, practical insights in valid JSON format."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        content = response.choices[0].message.content.strip()

        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            content = content.rsplit("```", 1)[0]
        content = content.strip()

        result = json.loads(content)
        return {
            "summary": result.get("summary", "Analysis completed but summary generation had issues."),
            "recommendations": result.get("recommendations", ["Review the KPIs and risks above for further insights."]),
            "risk_mitigations": result.get("risk_mitigations", {})
        }

    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        return {
            "summary": content if 'content' in dir() else "AI summary generation failed. Please review the KPIs and risk flags above for insights.",
            "recommendations": [
                "Review the computed KPIs for detailed financial metrics.",
                "Address any flagged risks immediately.",
                "Compare trends across periods to identify patterns.",
                "Consult a financial advisor for personalized guidance.",
                "Consider the expense ratio and profit margins for cost optimization."
            ]
        }
    except Exception as e:
        return {
            "summary": f"AI analysis could not be completed: {str(e)}. Please check your API key and try again. "
                       f"The KPIs and risk flags above are still available for your review.",
            "recommendations": [
                "Ensure your Groq API key is valid.",
                "Review the computed KPIs and risk flags for financial insights.",
                "Try uploading the file again if the issue persists."
            ]
        }