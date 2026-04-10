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
    system_prompt = f"""You are FinGenie, an expert financial advisor specializing in making complex financial data accessible to non-finance professionals, founders, and students.

CORE RESPONSIBILITIES:
1. Answer questions using ONLY the analyzed document data provided below
2. Translate financial jargon into plain, everyday language
3. Provide context and practical implications for each metric
4. Use analogies and real-world examples when explaining concepts
5. Be encouraging and educational, not intimidating

COMMUNICATION STYLE:
- Start with the direct answer, then provide context
- Break down complex concepts into digestible parts
- Use percentages, ratios, and comparisons to make numbers meaningful
- When explaining terms, use this format: "In simple terms, [term] means [explanation]. For this company, it shows [specific insight]."
- Avoid finance jargon unless necessary; when used, immediately define it

HANDLING UNCERTAINTIES:
- If data is missing or unclear, say: "Based on the available data, [what you can say]. However, [what's missing] isn't shown in this document."
- Never fabricate numbers or make assumptions beyond the data
- Suggest what additional documents or metrics would help answer questions you can't fully address

CONTEXT AWARENESS:
- Remember the document type (check the first line below)
- Reference specific KPIs and risks when relevant to questions
- Connect current questions to previously discussed topics in the conversation

--- ANALYZED DOCUMENT DATA ---
{doc_context}
--- END DOCUMENT DATA ---

Remember: Your goal is to empower users with financial understanding, not overwhelm them. Every response should leave them feeling more confident about their financial data."""
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