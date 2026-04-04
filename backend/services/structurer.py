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
    prompt = f"""
    You are a professional financial data extractor. I will provide you with raw text 
    extracted from a financial document. Your goal is to extract the key metrics 
    and values for each period (usually years or quarters) mentioned.

    RAW TEXT:
    ---
    {text[:8000]} # Limit text length to fit context
    ---

    INSTRUCTIONS:
    1. Identify the type of statement (Balance Sheet, Income Statement, or Cash Flow).
    2. Extract all financial items (e.g., Revenue, Net Income, Total Assets, etc.).
    3. For each item, find the value for each period (e.g., '2023', '2022').
    4. Respond ONLY with a valid JSON object in this format:
    {{
      "statement_type": "Income Statement",
      "data": {{
        "Revenue": {{"2023": 50000, "2022": 45000}},
        "Net Income": {{"2023": 5000, "2022": 4000}}
      }}
    }}

    RULES:
    - If a value is missing for a period, use null.
    - Keep metric names concise and professional.
    - Ensure all numbers are integers or floats (no currency symbols or commas).
    - If you can't find any financial data, return an empty data object.
    """

    try:
        client = get_groq_client(api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a financial extraction expert. Return only JSON."},
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
