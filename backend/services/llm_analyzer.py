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

    prompt = f"""You are a financial analyst AI assistant. A user has uploaded a {statement_type}.
Below is the extracted data and pre-computed analysis. Your job is to provide a clear, 
plain-language explanation and specific mitigation strategies for identified risks.

## Extracted Financial Data (preview):
{data_preview}

## Computed KPIs:
{kpi_text}

## Detected Risks:
{risk_text}

## Detected Trends:
{trend_text}

Please respond in this exact JSON format:
{{
  "summary": "A 2-3 paragraph plain-language summary of the financial health...",
  "recommendations": [
    "Specific actionable recommendation 1",
    ...
  ],
  "risk_mitigations": {{
    "Risk Name 1": "Specific, practical mitigation protocol or step-by-step action to address this risk.",
    "Risk Name 2": "..."
  }}
}}

Rules:
- Write for someone with NO finance background.
- For each risk in the 'Detected Risks' section, provide a concise 'mitigation protocol'.
- Keep descriptions and mitigations actionable and realistic.
- Return ONLY valid JSON.
"""

    try:
        client = get_groq_client(api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful financial analyst. Always respond in valid JSON."},
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
