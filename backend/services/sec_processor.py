import pandas as pd
import numpy as np
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Semantic Mapping: XBRL Tags to Human-Readable Terms
TAG_MAP = {
    # Income Statement
    "Revenues": "Total Revenue",
    "SalesRevenueNet": "Total Revenue",
    "CostOfGoodsAndServicesSold": "Cost of Goods Sold",
    "CostOfRevenue": "Cost of Goods Sold",
    "GrossProfit": "Gross Profit",
    "OperatingIncomeLoss": "Operating Income",
    "NetIncomeLoss": "Net Profit (Loss)",
    "EarningsPerShareBasic": "EPS (Basic)",
    "EarningsPerShareDiluted": "EPS (Diluted)",
    
    # Balance Sheet
    "Assets": "Total Assets",
    "AssetsCurrent": "Current Assets",
    "CashAndCashEquivalentsAtCarryingValue": "Cash & Equivalents",
    "Liabilities": "Total Liabilities",
    "LiabilitiesCurrent": "Current Liabilities",
    "StockholdersEquity": "Total Equity",
    "RetainedEarningsAccumulatedDeficit": "Retained Earnings",
    
    # Cash Flow
    "NetCashProvidedByUsedInOperatingActivities": "Operating Cash Flow",
    "NetCashProvidedByUsedInInvestingActivities": "Investing Cash Flow",
    "NetCashProvidedByUsedInFinancingActivities": "Financing Cash Flow"
}

def process_sec_datasets(
    sub_df: pd.DataFrame,
    num_df: pd.DataFrame,
    tag_df: pd.DataFrame,
    pre_df: pd.DataFrame,
    target_adsh: Optional[str] = None
) -> tuple[pd.DataFrame, dict]:
    """
    Process the four SEC XBRL datasets (SUB, NUM, TAG, PRE).
    1. Filter by target_adsh (or take most recent).
    2. Join NUM + SUB + TAG + PRE.
    3. Map tags to human-readable terms.
    4. Return Master DataFrame + Company Metadata.
    """
    
    # Validate required columns exist
    REQUIRED_NUM_COLS = ["adsh", "tag", "ddate", "value"]
    for req_col in REQUIRED_NUM_COLS:
        if req_col not in num_df.columns:
            logger.error(f"Missing required SEC column '{req_col}' in NUM dataset")
            raise ValueError(
                f"Missing required SEC column '{req_col}' in NUM dataset. "
                f"ZIP file may be corrupted or incomplete."
            )
    
    SUB_REQUIRED_COLS = ["adsh", "name", "cik", "form", "period"]
    for req_col in SUB_REQUIRED_COLS:
        if req_col not in sub_df.columns:
            logger.error(f"Missing required SUB column: {req_col}")
            raise ValueError(f"Missing required SUB column: {req_col}")
    
    # Validate input DataFrames are not empty
    if sub_df.empty:
        raise ValueError("SUB dataset is empty. ZIP file may be corrupted.")
    if num_df.empty:
        raise ValueError("NUM dataset is empty. ZIP file may be corrupted.")
    
    # 1. Filter Submissions
    if target_adsh:
        sub = sub_df[sub_df["adsh"] == target_adsh]
    else:
        # Default to the most recent submission in the file
        sub = sub_df.sort_values("period", ascending=False).head(1)
        target_adsh = sub["adsh"].iloc[0]
    
    if sub.empty:
        raise ValueError(f"Submission {target_adsh} not found.")

    metadata = {
        "company_name": sub["name"].iloc[0],
        "cik": str(sub["cik"].iloc[0]),
        "form": sub["form"].iloc[0],
        "period": str(sub["period"].iloc[0]),
        "adsh": target_adsh
    }

    # 2. Join NUM + SUB
    # NUM contains the data points
    df = num_df[num_df["adsh"] == target_adsh].copy()
    
    # 3. Join with TAG for definitions
    df = pd.merge(df, tag_df, on=["tag", "version"], how="left")
    
    # 4. Join with PRE for presentation context
    pre_fil = pre_df[pre_df["adsh"] == target_adsh].copy()
    df = pd.merge(df, pre_fil[["tag", "version", "plabel", "line", "report"]], 
                  on=["tag", "version"], how="left")

    # 5. Semantic Mapping & Cleaning
    df["label"] = df["tag"].map(TAG_MAP).fillna(df["plabel"]).fillna(df["tag"])
    
    # Filter for standard periods (avoid duplicates from dimension/segments if possible)
    # Usually qtrs=1 for Q and qtrs=4 for Annual
    df = df[df["qtrs"].isin([0, 1, 4])] # 0 for balance sheet (instant), 1 or 4 for duration
    
    # Normalize units
    df["value"] = df["value"].astype(float)
    
    # 6. Pivot to a standard format (Metrics as Rows, Dates as Columns)
    # We sort by ddate to get time-series columns
    df["ddate"] = pd.to_datetime(df["ddate"].astype(str))
    
    # To avoid aggregation issues, we take the most relevant entry per tag/date/report
    pivoted = df.pivot_table(
        index="label", 
        columns="ddate", 
        values="value", 
        aggfunc="last"
    ).reset_index()

    # Normalize column names (especially dates)
    pivoted.columns = [
        c.strftime('%Y-%m-%d') if isinstance(c, pd.Timestamp)
        else str(c).split(' ')[0] if ' ' in str(c)
        else str(c)
        for c in pivoted.columns
    ]
    # Ensure all columns are strings
    pivoted.columns = [str(col) for col in pivoted.columns]
    
    # Sort columns by date (Metrics, Year1, Year2...)
    date_cols = sorted([c for c in pivoted.columns if c != "label"])
    pivoted = pivoted[["label"] + date_cols]

    return pivoted, metadata

def compute_sec_kpis(df: pd.DataFrame, metadata: dict):
    """
    Compute SEC-specific KPIs from the pivoted data.
    """
    # Logic similar to kpi_engine.py but adapted for XBRL labels
    pass