import pandas as pd
from models.schemas import KPI, Risk, Trend


def compute_kpis(df: pd.DataFrame, statement_type: str) -> list[KPI]:
    """
    Compute financial KPIs from the parsed DataFrame.
    Returns a list of KPI objects with name, value, trend, status.
    """
    kpis = []
    data = _extract_financial_figures(df)

    # --- Gross Profit Margin ---
    revenue = data.get("revenue")
    cogs = data.get("cogs")
    if revenue and cogs:
        for period_key in _get_period_keys(revenue, cogs):
            rev = revenue.get(period_key)
            cost = cogs.get(period_key)
            if rev and rev != 0 and cost is not None:
                gpm = ((rev - cost) / rev) * 100
                kpis.append(KPI(
                    name="Gross Profit Margin",
                    value=round(gpm, 2),
                    formatted_value=f"{gpm:.1f}%",
                    trend=_classify_trend(gpm, 40, 20),
                    status=_classify_status(gpm, good_above=40, warn_above=20),
                    description=f"(Revenue − COGS) / Revenue × 100 for {period_key}"
                ))

    # --- Net Profit Margin ---
    net_income = data.get("net_income")
    if revenue and net_income:
        for period_key in _get_period_keys(revenue, net_income):
            rev = revenue.get(period_key)
            ni = net_income.get(period_key)
            if rev and rev != 0 and ni is not None:
                npm = (ni / rev) * 100
                kpis.append(KPI(
                    name="Net Profit Margin",
                    value=round(npm, 2),
                    formatted_value=f"{npm:.1f}%",
                    trend="up" if npm > 0 else "down",
                    status=_classify_status(npm, good_above=10, warn_above=5),
                    description=f"Net Income / Revenue × 100 for {period_key}"
                ))

    # --- Revenue Growth Rate ---
    if revenue:
        periods = sorted(revenue.keys())
        if len(periods) >= 2:
            for i in range(1, len(periods)):
                prev_rev = revenue[periods[i-1]]
                curr_rev = revenue[periods[i]]
                if prev_rev and prev_rev != 0:
                    growth = ((curr_rev - prev_rev) / abs(prev_rev)) * 100
                    kpis.append(KPI(
                        name="Revenue Growth Rate",
                        value=round(growth, 2),
                        formatted_value=f"{growth:+.1f}%",
                        trend="up" if growth > 0 else "down",
                        status="good" if growth > 5 else ("warning" if growth >= 0 else "danger"),
                        description=f"Growth from {periods[i-1]} to {periods[i]}"
                    ))

    # --- Expense Ratio ---
    total_expenses = data.get("total_expenses")
    if revenue and total_expenses:
        for period_key in _get_period_keys(revenue, total_expenses):
            rev = revenue.get(period_key)
            exp = total_expenses.get(period_key)
            if rev and rev != 0 and exp is not None:
                ratio = (abs(exp) / rev) * 100
                kpis.append(KPI(
                    name="Expense Ratio",
                    value=round(ratio, 2),
                    formatted_value=f"{ratio:.1f}%",
                    trend="down" if ratio < 70 else "up",
                    status="good" if ratio < 60 else ("warning" if ratio < 80 else "danger"),
                    description=f"Total Expenses / Revenue × 100 for {period_key}"
                ))

    # --- Burn Rate (Monthly) ---
    monthly_expenses = data.get("monthly_expenses")
    monthly_revenue = data.get("monthly_revenue")
    if monthly_expenses and monthly_revenue:
        for period_key in _get_period_keys(monthly_expenses, monthly_revenue):
            m_exp = monthly_expenses.get(period_key)
            m_rev = monthly_revenue.get(period_key)
            if m_exp is not None and m_rev is not None:
                burn = m_exp - m_rev
                kpis.append(KPI(
                    name="Burn Rate (Monthly)",
                    value=round(burn, 2),
                    formatted_value=f"${burn:,.0f}",
                    trend="down" if burn > 0 else "up",
                    status="danger" if burn > 0 else "good",
                    description=f"Monthly Expenses − Revenue for {period_key}"
                ))

    # --- Cash Runway ---
    cash_on_hand = data.get("cash")
    if cash_on_hand and monthly_expenses and monthly_revenue:
        for period_key in _get_period_keys(cash_on_hand, monthly_expenses):
            cash = cash_on_hand.get(period_key)
            m_exp = monthly_expenses.get(period_key, 0)
            m_rev = monthly_revenue.get(period_key, 0)
            net_burn = m_exp - m_rev if m_exp and m_rev else None
            if cash and net_burn and net_burn > 0:
                runway = cash / net_burn
                kpis.append(KPI(
                    name="Cash Runway",
                    value=round(runway, 1),
                    formatted_value=f"{runway:.0f} months",
                    trend="up" if runway > 12 else "down",
                    status="good" if runway > 12 else ("warning" if runway > 6 else "danger"),
                    description=f"Cash on Hand / Net Burn Rate for {period_key}"
                ))

    # If no KPIs could be computed from specific fields, extract generic ones
    if not kpis:
        kpis = _compute_generic_kpis(df)

    return kpis


def detect_risks(kpis: list[KPI], df: pd.DataFrame) -> list[Risk]:
    """Detect financial risks based on KPI values and thresholds."""
    risks = []

    for kpi in kpis:
        if kpi.value is None:
            continue

        # High Expenses: Expense Ratio > 80%
        if kpi.name == "Expense Ratio" and kpi.value > 80:
            risks.append(Risk(
                risk="High Expenses",
                severity="high" if kpi.value > 90 else "medium",
                description=f"Expense ratio is {kpi.value:.1f}%, exceeding the 80% threshold. "
                            f"Costs are consuming most of the revenue."
            ))

        # Low Profitability: Net Profit Margin < 5%
        if kpi.name == "Net Profit Margin" and kpi.value < 5:
            sev = "critical" if kpi.value < 0 else ("high" if kpi.value < 2 else "medium")
            risks.append(Risk(
                risk="Low Profitability",
                severity=sev,
                description=f"Net profit margin is {kpi.value:.1f}%, below the 5% benchmark. "
                            f"{'The company is operating at a loss.' if kpi.value < 0 else 'Profitability is thin.'}"
            ))

        # Declining Revenue
        if kpi.name == "Revenue Growth Rate" and kpi.value < 0:
            risks.append(Risk(
                risk="Declining Revenue",
                severity="high" if kpi.value < -10 else "medium",
                description=f"Revenue declined by {abs(kpi.value):.1f}%. "
                            f"Sustained decline may indicate market or operational challenges."
            ))

        # Negative Cash Flow / Burn
        if kpi.name == "Burn Rate (Monthly)" and kpi.value > 0:
            risks.append(Risk(
                risk="Negative Cash Flow",
                severity="high",
                description=f"Monthly burn rate is ${kpi.value:,.0f}. "
                            f"Company is spending more than it earns."
            ))

        # Low Cash Runway
        if kpi.name == "Cash Runway" and kpi.value < 6:
            risks.append(Risk(
                risk="Low Cash Runway",
                severity="critical" if kpi.value < 3 else "high",
                description=f"At current burn rate, cash runs out in ~{kpi.value:.0f} months. "
                            f"Immediate action required."
            ))

    if not risks:
        risks.append(Risk(
            risk="No Major Risks Detected",
            severity="low",
            description="Financial indicators are within acceptable ranges based on the available data."
        ))

    return risks


def detect_trends(df: pd.DataFrame) -> list[Trend]:
    """Detect financial trends from the data."""
    trends = []
    data = _extract_financial_figures(df)

    for metric_name, values in data.items():
        if not values or len(values) < 2:
            continue

        sorted_periods = sorted(values.keys())
        vals = [values[p] for p in sorted_periods if values[p] is not None]
        if len(vals) < 2:
            continue

        # Calculate overall direction
        first, last = vals[0], vals[-1]
        if first and first != 0:
            change_pct = ((last - first) / abs(first)) * 100
            direction = "up" if change_pct > 2 else ("down" if change_pct < -2 else "stable")
            display_name = metric_name.replace("_", " ").title()
            trends.append(Trend(
                metric=display_name,
                direction=direction,
                magnitude=round(abs(change_pct), 1),
                period=f"{sorted_periods[0]} → {sorted_periods[-1]}"
            ))

    return trends


# ─── Internal Helpers ─────────────────────────────────────────────────────────

_LABEL_MAP = {
    "revenue": [
        "revenue", "total revenue", "net revenue", "sales", "net sales",
        "total sales", "income", "total income", "turnover"
    ],
    "cogs": [
        "cost of goods sold", "cogs", "cost of revenue", "cost of sales",
        "cost of goods", "direct costs"
    ],
    "net_income": [
        "net income", "net profit", "net earnings", "profit after tax",
        "net income (loss)", "profit for the year", "profit for the period",
        "bottom line", "profit/(loss)"
    ],
    "total_expenses": [
        "total expenses", "total operating expenses", "operating expenses",
        "total costs", "total cost", "selling general and administrative",
        "sg&a", "total expenditure"
    ],
    "cash": [
        "cash and cash equivalents", "cash", "cash at end",
        "cash end of period", "total cash", "cash & equivalents",
        "cash at end of year", "cash at end of period"
    ],
    "total_assets": [
        "total assets", "assets"
    ],
    "total_liabilities": [
        "total liabilities", "liabilities"
    ],
    "gross_profit": [
        "gross profit", "gross margin", "gross income"
    ],
}


def _extract_financial_figures(df: pd.DataFrame) -> dict:
    """
    Extract key financial figures from the DataFrame.
    Returns: {metric_name: {period: value, ...}, ...}
    """
    result = {}
    numeric_cols = [c for c in df.columns[1:] if _has_numeric(df[c])]

    if not numeric_cols:
        return result

    for metric_key, keywords in _LABEL_MAP.items():
        for _, row in df.iterrows():
            label = str(row.iloc[0]).strip().lower() if pd.notna(row.iloc[0]) else ""
            if any(kw in label for kw in keywords):
                values = {}
                for col in numeric_cols:
                    val = row[col]
                    if pd.notna(val):
                        try:
                            values[str(col)] = float(val)
                        except (ValueError, TypeError):
                            pass
                if values:
                    result[metric_key] = values
                    break  # Take first match per metric

    # Derive monthly figures if we have annual
    if "revenue" in result and "monthly_revenue" not in result:
        result["monthly_revenue"] = {k: v / 12 for k, v in result["revenue"].items()}
    if "total_expenses" in result and "monthly_expenses" not in result:
        result["monthly_expenses"] = {k: abs(v) / 12 for k, v in result["total_expenses"].items()}

    return result


def _has_numeric(series: pd.Series) -> bool:
    """Check if a pandas series has any numeric values."""
    for val in series:
        if pd.notna(val):
            try:
                float(val)
                return True
            except (ValueError, TypeError):
                pass
    return False


def _get_period_keys(*dicts):
    """Get common period keys across multiple dicts."""
    if not dicts:
        return []
    common = set(dicts[0].keys())
    for d in dicts[1:]:
        common &= set(d.keys())
    return sorted(common)


def _classify_trend(value: float, good_threshold: float, warn_threshold: float) -> str:
    if value >= good_threshold:
        return "up"
    elif value >= warn_threshold:
        return "stable"
    return "down"


def _classify_status(value: float, good_above: float, warn_above: float) -> str:
    if value >= good_above:
        return "good"
    elif value >= warn_above:
        return "warning"
    return "danger"


def _compute_generic_kpis(df: pd.DataFrame) -> list[KPI]:
    """Fallback: extract basic numeric summaries when specific fields aren't found."""
    kpis = []
    numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]

    for col in numeric_cols[:6]:  # Limit to 6
        values = df[col].dropna()
        if len(values) > 0:
            total = values.sum()
            kpis.append(KPI(
                name=str(col),
                value=round(float(total), 2),
                formatted_value=f"${total:,.0f}" if abs(total) > 100 else f"{total:.2f}",
                trend="stable",
                status="good",
                description=f"Total for column '{col}'"
            ))

    return kpis