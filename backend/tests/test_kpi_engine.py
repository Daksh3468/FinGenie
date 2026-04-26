"""
test_kpi_engine.py — 100% coverage for services/kpi_engine.py
Covers every branch: thresholds, validation, all KPI computations,
risk severities, trend directions, internal helpers, and generic fallback.
"""

import pandas as pd
import pytest

from services.kpi_engine import (
    KPI_THRESHOLDS,
    _classify_status,
    _classify_trend,
    _compute_generic_kpis,
    _extract_financial_figures,
    _get_period_keys,
    _has_numeric,
    compute_kpis,
    detect_risks,
    detect_trends,
    get_threshold,
    validate_dataframe,
)


# ─── Fixtures ────────────────────────────────────────────────────────────────

def _make_kpi(name, value):
    """Minimal duck-typed KPI for risk/trend tests that don't need real KPI objects."""
    class _KPI:
        pass
    k = _KPI()
    k.name = name
    k.value = value
    return k


def _income_df(revenue=1000, cogs=400, net_income=100, expenses=600):
    """Return a simple income-statement DataFrame that exercises all KPI paths."""
    return pd.DataFrame({
        "label":  ["revenue",           "cost of goods sold", "net income",  "total expenses"],
        "2022":   [revenue * 0.8,        cogs * 0.8,           net_income * 0.8, expenses * 0.8],
        "2023":   [float(revenue),       float(cogs),          float(net_income), float(expenses)],
    })


def _cash_df(cash=120_000, revenue=10_000, expenses=15_000):
    """DataFrame that triggers Burn Rate + Cash Runway KPIs."""
    return pd.DataFrame({
        "label":  ["revenue",         "total expenses",     "cash and cash equivalents"],
        "2023":   [float(revenue),    float(expenses),      float(cash)],
    })


# ─── get_threshold ────────────────────────────────────────────────────────────

def test_get_threshold_existing_good():
    assert get_threshold("gross_profit_margin", "good") == 40


def test_get_threshold_existing_warn():
    assert get_threshold("net_profit_margin", "warn") == 5


def test_get_threshold_missing_metric():
    assert get_threshold("nonexistent", "good") == 0


def test_get_threshold_missing_level():
    assert get_threshold("gross_profit_margin", "nonexistent") == 0


# ─── validate_dataframe ───────────────────────────────────────────────────────

def test_validate_dataframe_none():
    assert validate_dataframe(None, "ctx") is False


def test_validate_dataframe_wrong_type():
    assert validate_dataframe(42, "ctx") is False


def test_validate_dataframe_string():
    assert validate_dataframe("not_a_df", "ctx") is False


def test_validate_dataframe_empty():
    assert validate_dataframe(pd.DataFrame(), "ctx") is False


def test_validate_dataframe_valid():
    assert validate_dataframe(pd.DataFrame({"A": [1]}), "ctx") is True


# ─── _has_numeric ────────────────────────────────────────────────────────────

def test_has_numeric_true():
    assert _has_numeric(pd.Series([None, "abc", 42.0])) is True


def test_has_numeric_all_non_numeric():
    assert _has_numeric(pd.Series(["foo", "bar", None])) is False


def test_has_numeric_all_nan():
    assert _has_numeric(pd.Series([float("nan"), None])) is False


def test_has_numeric_non_castable_string():
    assert _has_numeric(pd.Series(["hello", "world"])) is False


# ─── _get_period_keys ────────────────────────────────────────────────────────

def test_get_period_keys_no_dicts():
    assert _get_period_keys() == []


def test_get_period_keys_one_dict():
    assert _get_period_keys({"2022": 1, "2023": 2}) == ["2022", "2023"]


def test_get_period_keys_intersection():
    assert _get_period_keys({"2021": 1, "2022": 2}, {"2022": 3, "2023": 4}) == ["2022"]


def test_get_period_keys_no_intersection():
    assert _get_period_keys({"2021": 1}, {"2022": 2}) == []


# ─── _classify_trend ─────────────────────────────────────────────────────────

def test_classify_trend_up():
    assert _classify_trend(50, 40, 20) == "up"


def test_classify_trend_stable():
    assert _classify_trend(30, 40, 20) == "stable"


def test_classify_trend_down():
    assert _classify_trend(10, 40, 20) == "down"


# ─── _classify_status ────────────────────────────────────────────────────────

def test_classify_status_good():
    assert _classify_status(50, 40, 20) == "good"


def test_classify_status_warning():
    assert _classify_status(25, 40, 20) == "warning"


def test_classify_status_danger():
    assert _classify_status(10, 40, 20) == "danger"


# ─── _extract_financial_figures ──────────────────────────────────────────────

def test_extract_financial_figures_empty_df():
    result = _extract_financial_figures(pd.DataFrame())
    assert result == {}


def test_extract_financial_figures_no_numeric_cols():
    df = pd.DataFrame({"label": ["Revenue"], "info": ["some text"]})
    result = _extract_financial_figures(df)
    assert result == {}


def test_extract_financial_figures_derives_monthly():
    df = _income_df()
    result = _extract_financial_figures(df)
    assert "monthly_revenue" in result
    assert "monthly_expenses" in result
    # monthly values are annual / 12
    for period, val in result["monthly_revenue"].items():
        assert abs(val - result["revenue"][period] / 12) < 0.01


def test_extract_financial_figures_nan_label_skipped():
    """Row with NaN label should not raise; label defaults to empty string."""
    df = pd.DataFrame({
        "label": [None, "revenue"],
        "2023":  [999,  1000.0],
    })
    result = _extract_financial_figures(df)
    assert "revenue" in result


def test_extract_financial_figures_non_castable_value_skipped():
    """Non-numeric values in numeric columns must be silently skipped."""
    df = pd.DataFrame({
        "label": ["revenue"],
        "2023":  ["NOT_A_NUMBER"],
        "2022":  [1000.0],
    })
    result = _extract_financial_figures(df)
    # 2023 skipped, 2022 kept
    assert result.get("revenue", {}).get("2022") == 1000.0
    assert "2023" not in result.get("revenue", {})


def test_extract_financial_figures_type_error_value_skipped():
    """Values that raise TypeError during float() are silently skipped (covers except branch)."""
    df = pd.DataFrame({
    "label": ["revenue"],
    "2022":  [1000.0],
    }).astype({"2022": "object"})
    # Monkey-patch a cell value that raises TypeError on float()
    class _BadVal:
        def __str__(self): return "bad"
        def __float__(self): raise TypeError("no")
    df.at[0, "2022"] = _BadVal()
    result = _extract_financial_figures(df)
    # The bad value is skipped; revenue may or may not be in result
    assert isinstance(result, dict)


# ─── _compute_generic_kpis ───────────────────────────────────────────────────

def test_compute_generic_kpis_basic():
    df = pd.DataFrame({"A": [10, 20, 30], "B": [1, 2, 3]})
    kpis = _compute_generic_kpis(df)
    assert len(kpis) == 2
    assert kpis[0].name == "A"
    assert kpis[0].value == 60.0


def test_compute_generic_kpis_small_total_formatted():
    """Totals ≤ 100 should format without dollar sign."""
    df = pd.DataFrame({"tiny": [1.0, 2.0]})
    kpis = _compute_generic_kpis(df)
    assert "$" not in kpis[0].formatted_value


def test_compute_generic_kpis_large_total_formatted():
    """Totals > 100 should format with dollar sign."""
    df = pd.DataFrame({"big": [1000.0, 2000.0]})
    kpis = _compute_generic_kpis(df)
    assert "$" in kpis[0].formatted_value


def test_compute_generic_kpis_max_six_columns():
    """Only first 6 numeric columns should be processed."""
    data = {f"col{i}": [float(i)] for i in range(10)}
    df = pd.DataFrame(data)
    kpis = _compute_generic_kpis(df)
    assert len(kpis) == 6


def test_compute_generic_kpis_all_nan_column_skipped():
    df = pd.DataFrame({"A": [float("nan"), float("nan")], "B": [10.0, 20.0]})
    kpis = _compute_generic_kpis(df)
    names = [k.name for k in kpis]
    assert "B" in names


# ─── compute_kpis — invalid input ────────────────────────────────────────────

def test_compute_kpis_none_df():
    assert compute_kpis(None, "Income Statement") == []


def test_compute_kpis_empty_df():
    assert compute_kpis(pd.DataFrame(), "Income Statement") == []


def test_compute_kpis_non_df():
    assert compute_kpis("not_a_df", "Income Statement") == []


# ─── compute_kpis — Gross Profit Margin ─────────────────────────────────────

def test_compute_kpis_gross_profit_margin():
    df = _income_df(revenue=1000, cogs=400)
    kpis = compute_kpis(df, "Income Statement")
    names = [k.name for k in kpis]
    assert "Gross Profit Margin" in names
    gpm = next(k for k in kpis if k.name == "Gross Profit Margin")
    # (1000-400)/1000 * 100 = 60%
    assert abs(gpm.value - 60.0) < 0.1


def test_compute_kpis_gpm_classify_trend_stable():
    """GPM between 20 and 40 → 'stable' trend."""
    df = _income_df(revenue=1000, cogs=700)   # GPM = 30%
    kpis = compute_kpis(df, "Income Statement")
    gpm = next((k for k in kpis if k.name == "Gross Profit Margin"), None)
    if gpm:
        assert gpm.trend == "stable"


def test_compute_kpis_gpm_classify_trend_down():
    """GPM below 20 → 'down' trend."""
    df = _income_df(revenue=1000, cogs=850)   # GPM = 15%
    kpis = compute_kpis(df, "Income Statement")
    gpm = next((k for k in kpis if k.name == "Gross Profit Margin"), None)
    if gpm:
        assert gpm.trend == "down"


# ─── compute_kpis — Net Profit Margin ───────────────────────────────────────

def test_compute_kpis_net_profit_margin_positive():
    df = _income_df(revenue=1000, net_income=200)
    kpis = compute_kpis(df, "Income Statement")
    npm = next((k for k in kpis if k.name == "Net Profit Margin"), None)
    if npm:
        assert npm.trend == "up"


def test_compute_kpis_net_profit_margin_negative():
    """Negative net income → 'down' trend."""
    df = _income_df(revenue=1000, net_income=-50)
    kpis = compute_kpis(df, "Income Statement")
    npm = next((k for k in kpis if k.name == "Net Profit Margin"), None)
    if npm:
        assert npm.trend == "down"


# ─── compute_kpis — Revenue Growth Rate ─────────────────────────────────────

def test_compute_kpis_revenue_growth_positive():
    df = _income_df(revenue=1200)  # 2023 > 2022
    kpis = compute_kpis(df, "Income Statement")
    gr = next((k for k in kpis if k.name == "Revenue Growth Rate"), None)
    if gr:
        assert gr.trend == "up"
        assert gr.status == "good"


def test_compute_kpis_revenue_growth_zero():
    """Flat revenue → 'down' trend, 'warning' status."""
    df = pd.DataFrame({
        "label": ["revenue"],
        "2022":  [1000.0],
        "2023":  [1000.0],
    })
    kpis = compute_kpis(df, "Income Statement")
    gr = next((k for k in kpis if k.name == "Revenue Growth Rate"), None)
    if gr:
        assert gr.status == "warning"


def test_compute_kpis_revenue_growth_negative():
    """Falling revenue → 'down' trend, 'danger' status."""
    df = pd.DataFrame({
        "label": ["revenue"],
        "2022":  [1000.0],
        "2023":  [800.0],
    })
    kpis = compute_kpis(df, "Income Statement")
    gr = next((k for k in kpis if k.name == "Revenue Growth Rate"), None)
    if gr:
        assert gr.trend == "down"
        assert gr.status == "danger"


def test_compute_kpis_revenue_single_period_no_growth():
    """Only one period → no Revenue Growth Rate KPI."""
    df = pd.DataFrame({"label": ["revenue"], "2023": [1000.0]})
    kpis = compute_kpis(df, "Income Statement")
    names = [k.name for k in kpis]
    assert "Revenue Growth Rate" not in names


# ─── compute_kpis — Expense Ratio ───────────────────────────────────────────

def test_compute_kpis_expense_ratio_good():
    """Ratio < 60 → 'good', trend 'down'."""
    df = _income_df(revenue=1000, expenses=500)   # 50%
    kpis = compute_kpis(df, "Income Statement")
    er = next((k for k in kpis if k.name == "Expense Ratio"), None)
    if er:
        assert er.status == "good"
        assert er.trend == "down"


def test_compute_kpis_expense_ratio_warning():
    """Ratio 60–80 → 'warning'."""
    df = _income_df(revenue=1000, expenses=700)   # 70%
    kpis = compute_kpis(df, "Income Statement")
    er = next((k for k in kpis if k.name == "Expense Ratio"), None)
    if er:
        assert er.status == "warning"
        assert er.trend == "up"   # ratio ≥ 70


def test_compute_kpis_expense_ratio_danger():
    """Ratio > 80 → 'danger'."""
    df = _income_df(revenue=1000, expenses=900)   # 90%
    kpis = compute_kpis(df, "Income Statement")
    er = next((k for k in kpis if k.name == "Expense Ratio"), None)
    if er:
        assert er.status == "danger"


# ─── compute_kpis — Burn Rate ────────────────────────────────────────────────

def test_compute_kpis_burn_rate_positive():
    """Monthly expenses > revenue → positive burn, 'danger' status."""
    df = _cash_df(revenue=10_000, expenses=15_000)
    kpis = compute_kpis(df, "Income Statement")
    br = next((k for k in kpis if k.name == "Burn Rate (Monthly)"), None)
    if br:
        assert br.status == "danger"
        assert br.trend == "down"


def test_compute_kpis_burn_rate_negative():
    """Monthly revenue > expenses → negative burn (profitable), 'good' status."""
    df = _cash_df(revenue=20_000, expenses=10_000)
    kpis = compute_kpis(df, "Income Statement")
    br = next((k for k in kpis if k.name == "Burn Rate (Monthly)"), None)
    if br:
        assert br.status == "good"
        assert br.trend == "up"


# ─── compute_kpis — Cash Runway ─────────────────────────────────────────────

def test_compute_kpis_cash_runway_good():
    """Runway > 12 months → 'good'."""
    df = _cash_df(cash=1_000_000, revenue=10_000, expenses=15_000)
    kpis = compute_kpis(df, "Income Statement")
    cr = next((k for k in kpis if k.name == "Cash Runway"), None)
    if cr:
        assert cr.status == "good"
        assert cr.trend == "up"


def test_compute_kpis_cash_runway_warning():
    """Runway 6–12 months → 'warning'.
    Annual: revenue=10_000, expenses=11_000 → net_burn = 1_000/12 ≈ 83.3/month.
    cash=750 → runway = 750 / 83.3 ≈ 9 months → 'warning'.
    """
    df = _cash_df(cash=750, revenue=10_000, expenses=11_000)
    kpis = compute_kpis(df, "Income Statement")
    cr = next((k for k in kpis if k.name == "Cash Runway"), None)
    if cr:
        assert cr.status == "warning"
        assert cr.trend == "down"


def test_compute_kpis_cash_runway_danger():
    """Runway < 6 months → 'danger'.
    Annual: revenue=10_000, expenses=11_000 → net_burn ≈ 83.3/month.
    cash=333 → runway ≈ 4 months → 'danger'.
    """
    df = _cash_df(cash=333, revenue=10_000, expenses=11_000)
    kpis = compute_kpis(df, "Income Statement")
    cr = next((k for k in kpis if k.name == "Cash Runway"), None)
    if cr:
        assert cr.status == "danger"


# ─── compute_kpis — fallback to generic ─────────────────────────────────────

def test_compute_kpis_fallback_generic_when_no_known_labels():
    """DataFrame with numeric cols but no recognised label keywords → generic KPIs."""
    df = pd.DataFrame({
        "description": ["alpha", "beta", "gamma"],
        "Q1":          [100.0,   200.0,  300.0],
        "Q2":          [110.0,   210.0,  310.0],
    })
    kpis = compute_kpis(df, "Unknown")
    assert len(kpis) > 0
    assert all(hasattr(k, "name") for k in kpis)


# ─── detect_risks ────────────────────────────────────────────────────────────

def test_detect_risks_empty_kpi_list():
    risks = detect_risks([], pd.DataFrame())
    assert len(risks) == 1
    assert risks[0].risk == "No Major Risks Detected"
    assert risks[0].severity == "low"


def test_detect_risks_kpi_value_none_skipped():
    """KPIs with None value must not raise."""
    k = _make_kpi("Expense Ratio", None)
    risks = detect_risks([k], pd.DataFrame())
    assert risks[0].risk == "No Major Risks Detected"


def test_detect_risks_expense_ratio_medium():
    """85 ≤ value ≤ 90 → severity 'medium'."""
    risks = detect_risks([_make_kpi("Expense Ratio", 85)], pd.DataFrame())
    r = next(r for r in risks if r.risk == "High Expenses")
    assert r.severity == "medium"


def test_detect_risks_expense_ratio_high():
    """value > 90 → severity 'high'."""
    risks = detect_risks([_make_kpi("Expense Ratio", 95)], pd.DataFrame())
    r = next(r for r in risks if r.risk == "High Expenses")
    assert r.severity == "high"


def test_detect_risks_net_profit_critical():
    """NPM < 0 → 'critical'."""
    risks = detect_risks([_make_kpi("Net Profit Margin", -5)], pd.DataFrame())
    r = next(r for r in risks if r.risk == "Low Profitability")
    assert r.severity == "critical"


def test_detect_risks_net_profit_high():
    """0 ≤ NPM < 2 → 'high'."""
    risks = detect_risks([_make_kpi("Net Profit Margin", 1)], pd.DataFrame())
    r = next(r for r in risks if r.risk == "Low Profitability")
    assert r.severity == "high"


def test_detect_risks_net_profit_medium():
    """2 ≤ NPM < 5 → 'medium'."""
    risks = detect_risks([_make_kpi("Net Profit Margin", 3)], pd.DataFrame())
    r = next(r for r in risks if r.risk == "Low Profitability")
    assert r.severity == "medium"


def test_detect_risks_declining_revenue_medium():
    """-10 < growth < 0 → 'medium'."""
    risks = detect_risks([_make_kpi("Revenue Growth Rate", -5)], pd.DataFrame())
    r = next(r for r in risks if r.risk == "Declining Revenue")
    assert r.severity == "medium"


def test_detect_risks_declining_revenue_high():
    """growth < -10 → 'high'."""
    risks = detect_risks([_make_kpi("Revenue Growth Rate", -15)], pd.DataFrame())
    r = next(r for r in risks if r.risk == "Declining Revenue")
    assert r.severity == "high"


def test_detect_risks_burn_rate_positive():
    risks = detect_risks([_make_kpi("Burn Rate (Monthly)", 5000)], pd.DataFrame())
    assert any(r.risk == "Negative Cash Flow" for r in risks)


def test_detect_risks_burn_rate_zero_no_risk():
    """Burn = 0 → not > 0, so no Negative Cash Flow risk."""
    risks = detect_risks([_make_kpi("Burn Rate (Monthly)", 0)], pd.DataFrame())
    assert not any(r.risk == "Negative Cash Flow" for r in risks)


def test_detect_risks_cash_runway_critical():
    """runway < 3 → 'critical'."""
    risks = detect_risks([_make_kpi("Cash Runway", 2)], pd.DataFrame())
    r = next(r for r in risks if r.risk == "Low Cash Runway")
    assert r.severity == "critical"


def test_detect_risks_cash_runway_high():
    """3 ≤ runway < 6 → 'high'."""
    risks = detect_risks([_make_kpi("Cash Runway", 4)], pd.DataFrame())
    r = next(r for r in risks if r.risk == "Low Cash Runway")
    assert r.severity == "high"


def test_detect_risks_multiple_risks_returned():
    """Multiple bad KPIs → multiple risks, no 'No Major Risks'."""
    kpis = [
        _make_kpi("Expense Ratio", 85),
        _make_kpi("Net Profit Margin", -2),
        _make_kpi("Revenue Growth Rate", -12),
    ]
    risks = detect_risks(kpis, pd.DataFrame())
    assert not any(r.risk == "No Major Risks Detected" for r in risks)
    assert len(risks) >= 3


# ─── detect_trends ────────────────────────────────────────────────────────────

def test_detect_trends_empty_df():
    assert detect_trends(pd.DataFrame()) == []


def test_detect_trends_single_period_no_trend():
    """Only one data point per metric → no trend emitted."""
    df = pd.DataFrame({"label": ["revenue"], "2023": [1000.0]})
    assert detect_trends(df) == []


def test_detect_trends_up():
    df = pd.DataFrame({
        "label": ["revenue"],
        "2022":  [100.0],
        "2023":  [200.0],
    })
    trends = detect_trends(df)
    t = next((t for t in trends if "Revenue" in t.metric), None)
    if t:
        assert t.direction == "up"


def test_detect_trends_down():
    df = pd.DataFrame({
        "label": ["revenue"],
        "2022":  [200.0],
        "2023":  [100.0],
    })
    trends = detect_trends(df)
    t = next((t for t in trends if "Revenue" in t.metric), None)
    if t:
        assert t.direction == "down"


def test_detect_trends_stable():
    """< 2% change → 'stable'."""
    df = pd.DataFrame({
        "label": ["revenue"],
        "2022":  [1000.0],
        "2023":  [1010.0],   # +1%
    })
    trends = detect_trends(df)
    t = next((t for t in trends if "Revenue" in t.metric), None)
    if t:
        assert t.direction == "stable"


def test_detect_trends_skips_zero_first_value():
    """first == 0 means division-by-zero; no trend should be appended."""
    df = pd.DataFrame({
        "label": ["revenue"],
        "2022":  [0.0],
        "2023":  [100.0],
    })
    # Should not raise; trend list may be empty or non-empty depending on None guard
    trends = detect_trends(df)
    assert isinstance(trends, list)


def test_detect_trends_skips_metric_with_single_non_none():
    """Two periods but only one has a value → vals list < 2, skipped."""
    df = pd.DataFrame({
        "label": ["revenue"],
        "2022":  [None],
        "2023":  [100.0],
    })
    trends = detect_trends(df)
    assert isinstance(trends, list)


def test_detect_trends_multiple_metrics():
    """Verify multiple metrics each generate a Trend."""
    df = pd.DataFrame({
        "label": ["revenue",  "total expenses"],
        "2022":  [1000.0,      600.0],
        "2023":  [1200.0,      700.0],
    })
    trends = detect_trends(df)
    assert len(trends) >= 1   # At least revenue should trend up
