"""
tests/test_kpi_engine.py
------------------------
Unit tests for KPI computation and thresholds.
"""

import pytest
import pandas as pd
from services.kpi_engine import (
    compute_kpis, validate_dataframe, get_threshold, 
    KPI_THRESHOLDS
)
from models.schemas import KPI


def test_validate_dataframe_valid():
    """Test that valid DataFrames pass validation."""
    df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
    assert validate_dataframe(df, "test") is True


def test_validate_dataframe_none():
    """Test that None DataFrame fails validation."""
    assert validate_dataframe(None, "test") is False


def test_validate_dataframe_empty():
    """Test that empty DataFrame fails validation."""
    df = pd.DataFrame()
    assert validate_dataframe(df, "test") is False


def test_validate_dataframe_wrong_type():
    """Test that non-DataFrame input fails validation."""
    assert validate_dataframe([1, 2, 3], "test") is False


def test_get_threshold_existing_metric():
    """Test retrieving threshold for existing metric."""
    threshold = get_threshold('gross_profit_margin', 'good')
    assert threshold == 40  # From KPI_THRESHOLDS


def test_get_threshold_missing_metric():
    """Test that missing metric returns default threshold."""
    threshold = get_threshold('nonexistent_metric', 'good')
    assert threshold == 0


def test_get_threshold_missing_level():
    """Test that missing level returns default threshold."""
    threshold = get_threshold('gross_profit_margin', 'nonexistent_level')
    assert threshold == 0


def test_compute_kpis_empty_dataframe():
    """Test that compute_kpis returns empty list for empty DataFrame."""
    df = pd.DataFrame()
    kpis = compute_kpis(df, "Balance Sheet")
    assert kpis == []


def test_compute_kpis_none_dataframe():
    """Test that compute_kpis returns empty list for None DataFrame."""
    kpis = compute_kpis(None, "Balance Sheet")
    assert kpis == []


def test_kpi_thresholds_structure():
    """Test that KPI_THRESHOLDS dictionary has correct structure."""
    assert 'gross_profit_margin' in KPI_THRESHOLDS
    assert 'good' in KPI_THRESHOLDS['gross_profit_margin']
    assert 'warn' in KPI_THRESHOLDS['gross_profit_margin']


if __name__ == "__main__":
    pytest.main([__file__])
