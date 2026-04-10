import json
import os
import pandas as pd
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def get_groq_client(api_key: str = None) -> Groq:
    key = api_key or os.getenv("GROQ_API_KEY")
    if not key:
        raise ValueError("Groq API key not found.")
    return Groq(api_key=key)

def extract_data_from_text(text: str, api_key: str = None) -> tuple[pd.DataFrame, str]:
    """
    Uses LLM to extract structured financial data from raw text.
    Returns (DataFrame, statement_type).
    """
    prompt = f"""You are an expert financial data extraction specialist. Your task is to convert raw, unstructured text from financial documents into clean, structured JSON data.

RAW DOCUMENT TEXT:
---
{text[:8000]}
---

EXTRACTION INSTRUCTIONS:

STEP 1 - IDENTIFY STATEMENT TYPE:
Analyze the text and determine which financial statement this is:
- "Balance Sheet" - Shows assets, liabilities, and equity at a point in time
- "Income Statement" - Shows revenue, expenses, and profit over a period
- "Cash Flow Statement" - Shows cash inflows and outflows from operations, investing, and financing

STEP 2 - EXTRACT ALL FINANCIAL LINE ITEMS:
For each metric found in the text:
- Use clear, professional naming (e.g., "Total Revenue" not "Sales" or "Rev")
- Standardize common terms:
  * Revenue/Sales → "Total Revenue"
  * Net Income/Profit → "Net Profit"
  * COGS/Cost of Sales → "Cost of Goods Sold"
  * SG&A → "Operating Expenses"
- Include ALL periods mentioned (years, quarters, or months)
- Extract actual numeric values only (remove currency symbols, commas, parentheses)
- Convert accounting notation: (1000) → -1000
- If a metric appears multiple times, use the most detailed/complete entry

STEP 3 - STRUCTURE THE DATA:
- Create a nested dictionary where:
  * Top-level keys = metric names (rows)
  * Second-level keys = time periods (columns)
  * Values = numeric amounts (integers or floats)
- For missing values, use null (not 0, not empty string)
- Ensure period names are consistent (e.g., all "2023" or all "FY2023", not mixed)

STEP 4 - QUALITY CHECKS:
- Verify numbers make logical sense (revenue > net income, assets = liabilities + equity for balance sheets)
- Check that all periods have similar metrics (don't extract 2023 revenue but 2022 EBITDA)
- Ensure at least 3-5 key metrics are extracted (if fewer, the document may not contain financial data)

OUTPUT FORMAT (STRICT JSON):
{{
  "statement_type": "Income Statement",
  "data": {{
    "Total Revenue": {{"2023": 1500000, "2022": 1200000, "2021": 1000000}},
    "Cost of Goods Sold": {{"2023": 900000, "2022": 720000, "2021": 600000}},
    "Gross Profit": {{"2023": 600000, "2022": 480000, "2021": 400000}},
    "Operating Expenses": {{"2023": 350000, "2022": 300000, "2021": 250000}},
    "Net Profit": {{"2023": 250000, "2022": 180000, "2021": 150000}}
  }}
}}

CRITICAL RULES:
- Return ONLY valid JSON (no markdown formatting, no code blocks, no explanations)
- Use null for missing values, never 0 unless explicitly stated
- All numbers must be pure integers or floats (no strings, no currency symbols)
- If the text contains no financial data, return: {{"statement_type": "Unknown", "data": {{}}}}
- Metric names should be title case and descriptive
- Periods should be sorted chronologically when possible

EDGE CASES:
- If you see "YTD" or "MTD", treat as the current period
- If you see percentage signs, extract as decimal multipliers (e.g., "15%" → 15, not 0.15)
- If you see "thousands" or "millions" indicators, apply the multiplier to all numbers in that section
- If fiscal year differs from calendar year, use the fiscal year notation (e.g., "FY2023")"""

    try:
        client = get_groq_client(api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a financial data extraction expert with perfect accuracy in converting unstructured text to structured JSON. You always follow the exact format specified and never add explanations outside the JSON."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        statement_type = result.get("statement_type", "Financial Statement")
        data_dict = result.get("data", {})

        if not data_dict:
            return pd.DataFrame(), statement_type

        # Convert the nested dict to a DataFrame
        # The keys of data_dict are the row labels (metrics)
        # The values are dicts of period: value
        df = pd.DataFrame.from_dict(data_dict, orient='index')
        
        # Move the index (metrics) to the first column
        df.reset_index(inplace=True)
        df.rename(columns={'index': 'Metric'}, inplace=True)

        return df, statement_type

    except Exception as e:
        print(f"Error in extraction: {e}")
        return pd.DataFrame(), "Financial Statement"