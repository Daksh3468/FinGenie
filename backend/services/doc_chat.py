import os
import pandas as pd
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


def get_groq_client() -> Groq:
    key = os.getenv("GROQ_API_KEY")
    if not key:
        raise ValueError("GROQ_API_KEY not found in environment variables.")
    return Groq(api_key=key)


def build_doc_context(
    raw_data: list[dict],
    column_headers: list[str],
    statement_type: str,
    summary: str,
    kpis: list[dict],
    risks: list[dict],
) -> str:
    """Build a compact context string from already-analyzed document data."""

    df = pd.DataFrame(raw_data, columns=column_headers if column_headers else None)
    table_str = df.head(20).to_string(index=False) if not df.empty else "No tabular data."

    kpi_str = "\n".join(
        f"- {k['name']}: {k['formatted_value']} ({k['status']})" for k in kpis
    )
    risk_str = "\n".join(
        f"- [{r['severity'].upper()}] {r['risk']}: {r['description']}" for r in risks
    )

    return f"""
DOCUMENT TYPE: {statement_type}

=== DATA TABLE (preview) ===
{table_str}

=== KEY PERFORMANCE INDICATORS ===
{kpi_str or 'None computed.'}

=== RISK FLAGS ===
{risk_str or 'None detected.'}

=== AI SUMMARY ===
{summary or 'Not available.'}
""".strip()


async def chat_with_document(
    user_message: str,
    conversation_history: list[dict],
    doc_context: str,
) -> str:
    """
    Send a user question + full conversation history to Groq.
    Returns the assistant's reply string.
    """
    system_prompt = f"""You are FinGenie, an expert financial document assistant.
The user has uploaded a financial document that has been analyzed.
Answer questions based ONLY on the document context below.
If something is not in the context, say so clearly.
Always be concise, clear, and helpful. Explain financial terms simply.

--- DOCUMENT CONTEXT ---
{doc_context}
--- END CONTEXT ---
"""
    messages = [{"role": "system", "content": system_prompt}]

    # Include prior conversation (last 20 messages = 10 turns to stay within context limits)
    messages += conversation_history[-20:]
    messages.append({"role": "user", "content": user_message})

    client = get_groq_client()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.3,
        max_tokens=1024,
    )
    return response.choices[0].message.content.strip()