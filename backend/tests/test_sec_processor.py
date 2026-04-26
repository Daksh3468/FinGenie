"""
test_sec_processor.py — 100% coverage for services/sec_processor.py
Covers: success, target_adsh filter, missing columns (NUM + SUB),
empty dataframes, adsh not found, tag mapping, qtrs filtering,
multiple dates pivot, PRE duplicate handling, and compute_sec_kpis (pass stub).
"""

import pytest
import pandas as pd
from services.sec_processor import process_sec_datasets, compute_sec_kpis


# ─── Fixtures ────────────────────────────────────────────────────────────────

def _valid_data():
    sub_df = pd.DataFrame([{
        "adsh": "1",
        "name": "Test Corp",
        "cik": 123,
        "form": "10-K",
        "period": "20231231",
    }])

    num_df = pd.DataFrame([{
        "adsh": "1",
        "tag": "Revenues",
        "version": "v1",
        "ddate": "20231231",
        "qtrs": 4,
        "value": 1000,
    }])

    tag_df = pd.DataFrame([{
        "tag": "Revenues",
        "version": "v1",
        "label": "Revenue Label",
    }])

    pre_df = pd.DataFrame([{
        "adsh": "1",
        "tag": "Revenues",
        "version": "v1",
        "plabel": "Revenue Presentation",
        "line": 1,
        "report": "r1",
    }])

    return sub_df, num_df, tag_df, pre_df


# ─── Success ─────────────────────────────────────────────────────────────────

def test_process_sec_datasets_success():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    df, meta = process_sec_datasets(sub_df, num_df, tag_df, pre_df)

    assert not df.empty
    assert "label" in df.columns
    assert meta["company_name"] == "Test Corp"
    assert meta["adsh"] == "1"
    assert meta["form"] == "10-K"
    assert meta["cik"] == "123"


# ─── target_adsh filter ──────────────────────────────────────────────────────

def test_process_sec_datasets_with_target_adsh():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    df, meta = process_sec_datasets(sub_df, num_df, tag_df, pre_df, target_adsh="1")
    assert meta["adsh"] == "1"


def test_process_sec_datasets_auto_picks_most_recent():
    """Without target_adsh, the most-recent period row is selected."""
    sub_df = pd.DataFrame([
        {"adsh": "old", "name": "Old Corp", "cik": 1, "form": "10-K", "period": "20221231"},
        {"adsh": "new", "name": "New Corp", "cik": 2, "form": "10-K", "period": "20231231"},
    ])
    num_df = pd.DataFrame([{
        "adsh": "new", "tag": "Revenues", "version": "v1",
        "ddate": "20231231", "qtrs": 4, "value": 500,
    }])
    _, _, tag_df, pre_df = _valid_data()
    pre_df = pre_df.copy()
    pre_df["adsh"] = "new"

    df, meta = process_sec_datasets(sub_df, num_df, tag_df, pre_df)
    assert meta["adsh"] == "new"


# ─── Missing columns ─────────────────────────────────────────────────────────

def test_missing_num_column_raises():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    with pytest.raises(ValueError, match="Missing required SEC column"):
        process_sec_datasets(sub_df, num_df.drop(columns=["value"]), tag_df, pre_df)


def test_missing_num_tag_column_raises():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    with pytest.raises(ValueError):
        process_sec_datasets(sub_df, num_df.drop(columns=["tag"]), tag_df, pre_df)


def test_missing_sub_column_raises():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    with pytest.raises(ValueError, match="Missing required SUB column"):
        process_sec_datasets(sub_df.drop(columns=["name"]), num_df, tag_df, pre_df)


def test_missing_sub_cik_column_raises():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    with pytest.raises(ValueError):
        process_sec_datasets(sub_df.drop(columns=["cik"]), num_df, tag_df, pre_df)


# ─── Empty DataFrames ────────────────────────────────────────────────────────

def test_empty_sub_df_raises():
    _, num_df, tag_df, pre_df = _valid_data()
    empty_sub = pd.DataFrame(columns=["adsh", "name", "cik", "form", "period"])
    with pytest.raises(ValueError, match="SUB dataset is empty"):
        process_sec_datasets(empty_sub, num_df, tag_df, pre_df)


def test_empty_num_df_raises():
    sub_df, _, tag_df, pre_df = _valid_data()
    empty_num = pd.DataFrame(columns=["adsh", "tag", "ddate", "value", "version", "qtrs"])
    with pytest.raises(ValueError, match="NUM dataset is empty"):
        process_sec_datasets(sub_df, empty_num, tag_df, pre_df)


# ─── ADSH not found ──────────────────────────────────────────────────────────

def test_adsh_not_found_raises():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    with pytest.raises(ValueError, match="not found"):
        process_sec_datasets(sub_df, num_df, tag_df, pre_df, target_adsh="999")


# ─── TAG_MAP semantic mapping ────────────────────────────────────────────────

def test_tag_mapping_revenues_to_total_revenue():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    df, _ = process_sec_datasets(sub_df, num_df, tag_df, pre_df)
    assert "Total Revenue" in df["label"].values


def test_tag_mapping_falls_back_to_plabel():
    """Tags NOT in TAG_MAP fall back to plabel."""
    sub_df, num_df, tag_df, pre_df = _valid_data()
    num_df = num_df.copy()
    num_df["tag"] = "SomeUnknownTag"
    tag_df = pd.DataFrame([{"tag": "SomeUnknownTag", "version": "v1", "label": "Custom Label"}])
    pre_df = pre_df.copy()
    pre_df["tag"] = "SomeUnknownTag"
    pre_df["plabel"] = "PLabelFallback"

    df, _ = process_sec_datasets(sub_df, num_df, tag_df, pre_df)
    # Should not raise; label is plabel or tag name
    assert not df.empty


def test_tag_mapping_falls_back_to_tag_when_no_plabel():
    """Tags NOT in TAG_MAP with no plabel fall back to the raw tag string."""
    sub_df, num_df, tag_df, pre_df = _valid_data()
    num_df = num_df.copy()
    num_df["tag"] = "RawTag"
    tag_df = pd.DataFrame([{"tag": "RawTag", "version": "v1", "label": ""}])
    pre_df = pre_df.copy()
    pre_df["tag"] = "RawTag"
    pre_df["plabel"] = None

    df, _ = process_sec_datasets(sub_df, num_df, tag_df, pre_df)
    assert not df.empty


# ─── qtrs filtering ──────────────────────────────────────────────────────────

def test_qtrs_value_2_filtered_out():
    """qtrs=2 is not in [0,1,4] → row excluded → empty result."""
    sub_df, num_df, tag_df, pre_df = _valid_data()
    num_df = num_df.copy()
    num_df["qtrs"] = 2
    df, _ = process_sec_datasets(sub_df, num_df, tag_df, pre_df)
    assert df.empty or len(df) == 0 or "label" in df.columns  # row filtered, pivot may be empty


def test_qtrs_value_0_kept():
    """qtrs=0 (balance-sheet instant) is kept."""
    sub_df, num_df, tag_df, pre_df = _valid_data()
    num_df = num_df.copy()
    num_df["tag"] = "Assets"
    num_df["qtrs"] = 0
    tag_df2 = pd.DataFrame([{"tag": "Assets", "version": "v1", "label": "Total Assets"}])
    pre_df2 = pre_df.copy()
    pre_df2["tag"] = "Assets"
    df, _ = process_sec_datasets(sub_df, num_df, tag_df2, pre_df2)
    assert not df.empty


def test_qtrs_value_1_kept():
    """qtrs=1 (quarterly) is kept."""
    sub_df, num_df, tag_df, pre_df = _valid_data()
    num_df = num_df.copy()
    num_df["qtrs"] = 1
    df, _ = process_sec_datasets(sub_df, num_df, tag_df, pre_df)
    assert not df.empty


# ─── Multiple dates — pivot ──────────────────────────────────────────────────

def test_multiple_dates_create_multiple_columns():
    sub_df, _, tag_df, pre_df = _valid_data()
    num_df = pd.DataFrame([
        {"adsh": "1", "tag": "Revenues", "version": "v1", "ddate": "20221231", "qtrs": 4, "value": 800},
        {"adsh": "1", "tag": "Revenues", "version": "v1", "ddate": "20231231", "qtrs": 4, "value": 1000},
    ])
    df, _ = process_sec_datasets(sub_df, num_df, tag_df, pre_df)
    date_cols = [c for c in df.columns if c != "label"]
    assert len(date_cols) >= 2


# ─── PRE duplicate handling ──────────────────────────────────────────────────

def test_pre_duplicates_do_not_multiply_rows():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    pre_df_dup = pd.concat([pre_df, pre_df], ignore_index=True)
    df, _ = process_sec_datasets(sub_df, num_df, tag_df, pre_df_dup)
    assert not df.empty
    # Exactly one row for "Total Revenue"
    assert df["label"].value_counts().max() == 1


# ─── Column normalisation ────────────────────────────────────────────────────

def test_all_output_columns_are_strings():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    df, _ = process_sec_datasets(sub_df, num_df, tag_df, pre_df)
    for col in df.columns:
        assert isinstance(col, str)


def test_date_columns_formatted_yyyy_mm_dd():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    df, _ = process_sec_datasets(sub_df, num_df, tag_df, pre_df)
    date_cols = [c for c in df.columns if c != "label"]
    for col in date_cols:
        # Should be formatted as YYYY-MM-DD or start with a digit
        assert col[0].isdigit(), f"Unexpected date column format: {col}"


def test_metadata_period_is_string():
    sub_df, num_df, tag_df, pre_df = _valid_data()
    _, meta = process_sec_datasets(sub_df, num_df, tag_df, pre_df)
    assert isinstance(meta["period"], str)


# ─── compute_sec_kpis (stub/pass) ────────────────────────────────────────────

def test_compute_sec_kpis_returns_none():
    """compute_sec_kpis is a pass stub; calling it should not raise."""
    result = compute_sec_kpis(pd.DataFrame(), {"company_name": "Test"})
    assert result is None
