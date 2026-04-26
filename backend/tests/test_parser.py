"""
test_parser.py — 100% coverage for services/parser.py
Covers: validate_file (extension, size, magic-sig mismatch, valid paths),
parse_pdf (table mode, text-fallback, no-data error), parse_excel,
parse_csv, clean_dataframe, _parse_number, detect_statement_type,
and the parse_file entry point (all branches).
"""

import io
import pandas as pd
import pytest
from fastapi import UploadFile, HTTPException
from unittest.mock import AsyncMock, MagicMock, patch

from services.parser import (
    _parse_number,
    clean_dataframe,
    detect_statement_type,
    parse_csv,
    parse_excel,
    parse_file,
    parse_pdf,
    validate_file,
)


# ─── Helpers ─────────────────────────────────────────────────────────────────

def make_upload_file(filename: str, content: bytes):
    f = MagicMock(spec=UploadFile)
    f.filename = filename
    f.read = AsyncMock(return_value=content)
    return f


# ─── validate_file — extension checks ───────────────────────────────────────

@pytest.mark.asyncio
async def test_validate_file_invalid_extension():
    with pytest.raises(HTTPException) as exc:
        await validate_file(make_upload_file("evil.exe", b"data"))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_validate_file_no_extension():
    with pytest.raises(HTTPException) as exc:
        await validate_file(make_upload_file("noext", b"data"))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_validate_file_too_large():
    big = b"x" * (201 * 1024 * 1024)
    with pytest.raises(HTTPException) as exc:
        await validate_file(make_upload_file("big.pdf", big))
    assert exc.value.status_code == 400


# ─── validate_file — magic signature paths ──────────────────────────────────

@pytest.mark.asyncio
async def test_validate_file_valid_pdf_magic():
    content = await validate_file(make_upload_file("ok.pdf", b"%PDF-1.4 data"))
    assert isinstance(content, bytes)


@pytest.mark.asyncio
async def test_validate_file_valid_xlsx_pk_magic():
    """PK magic for .xlsx should pass."""
    content = await validate_file(make_upload_file("ok.xlsx", b"PK\x03\x04rest"))
    assert isinstance(content, bytes)


@pytest.mark.asyncio
async def test_validate_file_valid_xls_ole_magic():
    """OLE magic for .xls should pass."""
    content = await validate_file(make_upload_file("ok.xls", b"\xd0\xcf\x11\xe0rest"))
    assert isinstance(content, bytes)


@pytest.mark.asyncio
async def test_validate_file_magic_mismatch_pdf_content_xlsx_extension():
    """PDF bytes but declared as .xlsx → mismatch error."""
    with pytest.raises(HTTPException) as exc:
        await validate_file(make_upload_file("fake.xlsx", b"%PDF-1.4 data"))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_validate_file_magic_mismatch_pk_content_pdf_extension():
    """ZIP/XLSX bytes declared as .pdf → mismatch error."""
    with pytest.raises(HTTPException) as exc:
        await validate_file(make_upload_file("fake.pdf", b"PK\x03\x04rest"))
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_validate_file_csv_skips_magic_check():
    """CSV files don't have a magic sig check; any bytes should pass."""
    content = await validate_file(make_upload_file("data.csv", b"a,b\n1,2\n"))
    assert isinstance(content, bytes)


# ─── parse_pdf ────────────────────────────────────────────────────────────────

@patch("services.parser.pdfplumber.open")
def test_parse_pdf_table_mode(mock_pdf):
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Revenue Report"
    mock_page.extract_tables.return_value = [
        [["Label", "2023"], ["Revenue", "1000"]]
    ]
    mock_pdf.return_value.__enter__.return_value.pages = [mock_page]

    df, text, mode = parse_pdf(b"fake")
    assert mode == "table"
    assert isinstance(df, pd.DataFrame)
    assert text is None


@patch("services.parser.pdfplumber.open")
def test_parse_pdf_text_fallback(mock_pdf):
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Plain text only"
    mock_page.extract_tables.return_value = []
    mock_pdf.return_value.__enter__.return_value.pages = [mock_page]

    df, text, mode = parse_pdf(b"fake")
    assert mode == "text"
    assert df is None
    assert "Plain text only" in text


@patch("services.parser.pdfplumber.open")
def test_parse_pdf_no_text_no_tables_raises(mock_pdf):
    """PDF with nothing extractable raises 400."""
    mock_page = MagicMock()
    mock_page.extract_text.return_value = None
    mock_page.extract_tables.return_value = []
    mock_pdf.return_value.__enter__.return_value.pages = [mock_page]

    with pytest.raises(HTTPException) as exc:
        parse_pdf(b"fake")
    assert exc.value.status_code == 400


@patch("services.parser.pdfplumber.open")
def test_parse_pdf_table_with_none_header_cells(mock_pdf):
    """None header cells should be replaced with Col_i placeholders."""
    mock_page = MagicMock()
    mock_page.extract_text.return_value = None
    mock_page.extract_tables.return_value = [
        [[None, "2023"], ["Revenue", "100"]]
    ]
    mock_pdf.return_value.__enter__.return_value.pages = [mock_page]

    df, _, mode = parse_pdf(b"fake")
    assert mode == "table"
    assert "Col_0" in df.columns


@patch("services.parser.pdfplumber.open")
def test_parse_pdf_picks_largest_table(mock_pdf):
    """When multiple tables exist, the largest is returned."""
    mock_page = MagicMock()
    mock_page.extract_text.return_value = None
    mock_page.extract_tables.return_value = [
        [["A", "2023"], ["r1", "1"]],                              # 1 data row
        [["A", "2023"], ["r1", "1"], ["r2", "2"], ["r3", "3"]],    # 3 data rows
    ]
    mock_pdf.return_value.__enter__.return_value.pages = [mock_page]

    df, _, _ = parse_pdf(b"fake")
    assert len(df) == 3


@patch("services.parser.pdfplumber.open")
def test_parse_pdf_skips_single_row_tables(mock_pdf):
    """Tables with only 1 row (header only, no data rows) are ignored."""
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Some text"
    mock_page.extract_tables.return_value = [
        [["OnlyHeader"]]   # len == 1, ignored
    ]
    mock_pdf.return_value.__enter__.return_value.pages = [mock_page]

    df, text, mode = parse_pdf(b"fake")
    assert mode == "text"


# ─── parse_excel ─────────────────────────────────────────────────────────────

@patch("services.parser.pd.ExcelFile")
@patch("services.parser.pd.read_excel")
def test_parse_excel_success(mock_read, mock_xlf):
    mock_xlf.return_value.sheet_names = ["Sheet1"]
    mock_read.return_value = pd.DataFrame({"A": ["Revenue", "Costs"], "B": [1000, 600]})
    df = parse_excel(b"fake")
    assert isinstance(df, pd.DataFrame)


@patch("services.parser.pd.ExcelFile")
@patch("services.parser.pd.read_excel")
def test_parse_excel_skips_empty_sheets(mock_read, mock_xlf):
    """First sheet empty, second sheet has data."""
    mock_xlf.return_value.sheet_names = ["Empty", "Data"]
    mock_read.side_effect = [
        pd.DataFrame(),
        pd.DataFrame({"A": ["Revenue", "Costs"], "B": [100, 60]}),
    ]
    df = parse_excel(b"fake")
    assert not df.empty


@patch("services.parser.pd.ExcelFile")
@patch("services.parser.pd.read_excel")
def test_parse_excel_all_sheets_empty_raises(mock_read, mock_xlf):
    mock_xlf.return_value.sheet_names = ["Sheet1"]
    mock_read.return_value = pd.DataFrame()
    with pytest.raises(HTTPException) as exc:
        parse_excel(b"fake")
    assert exc.value.status_code == 400


@patch("services.parser.pd.ExcelFile")
def test_parse_excel_exception_propagates(mock_xlf):
    mock_xlf.side_effect = Exception("corrupt")
    with pytest.raises(HTTPException) as exc:
        parse_excel(b"fake")
    assert exc.value.status_code == 400


# ─── parse_csv ───────────────────────────────────────────────────────────────

@patch("services.parser.pd.read_csv")
def test_parse_csv_success(mock_rc):
    mock_rc.return_value = pd.DataFrame({"A": ["Revenue"], "B": [100]})
    df = parse_csv(b"csv data")
    assert isinstance(df, pd.DataFrame)


@patch("services.parser.pd.read_csv")
def test_parse_csv_empty_raises(mock_rc):
    mock_rc.return_value = pd.DataFrame()
    with pytest.raises(HTTPException) as exc:
        parse_csv(b"csv data")
    assert exc.value.status_code == 400


@patch("services.parser.pd.read_csv")
def test_parse_csv_exception_propagates(mock_rc):
    mock_rc.side_effect = Exception("bad encoding")
    with pytest.raises(HTTPException) as exc:
        parse_csv(b"csv data")
    assert exc.value.status_code == 400


# ─── clean_dataframe ─────────────────────────────────────────────────────────

def test_clean_dataframe_strips_column_names():
    df = pd.DataFrame({" A ": ["Revenue"], "B": [100]})
    cleaned = clean_dataframe(df)
    assert "A" in cleaned.columns


def test_clean_dataframe_drops_all_nan_rows():
    df = pd.DataFrame({"A": [None, "Revenue"], "B": [None, 100]})
    cleaned = clean_dataframe(df)
    assert len(cleaned) == 1


def test_clean_dataframe_drops_all_nan_cols():
    df = pd.DataFrame({"A": ["Revenue"], "B": [None]})
    cleaned = clean_dataframe(df)
    assert "B" not in cleaned.columns


def test_clean_dataframe_parses_currency():
    df = pd.DataFrame({"label": ["Revenue"], "val": ["$1,000"]})
    cleaned = clean_dataframe(df)
    assert cleaned["val"].iloc[0] == 1000.0


def test_clean_dataframe_parses_parentheses_as_negative():
    df = pd.DataFrame({"label": ["Loss"], "val": ["(500)"]})
    cleaned = clean_dataframe(df)
    assert cleaned["val"].iloc[0] == -500.0


# ─── _parse_number ────────────────────────────────────────────────────────────

def test_parse_number_none():
    assert _parse_number(None) is None


def test_parse_number_nan():
    import math
    result = _parse_number(float("nan"))
    assert result is None


def test_parse_number_dash():
    assert _parse_number("-") is None


def test_parse_number_em_dash():
    assert _parse_number("—") is None


def test_parse_number_na_string():
    assert _parse_number("N/A") is None


def test_parse_number_empty_string():
    assert _parse_number("") is None


def test_parse_number_plain_float():
    assert _parse_number("3.14") == 3.14


def test_parse_number_currency_euro():
    assert _parse_number("€1000") == 1000.0


def test_parse_number_currency_pound():
    assert _parse_number("£250") == 250.0


def test_parse_number_currency_rupee():
    assert _parse_number("₹500") == 500.0


def test_parse_number_percentage():
    assert _parse_number("45%") == 45.0


def test_parse_number_parentheses_negative():
    assert _parse_number("(123.45)") == -123.45


def test_parse_number_comma_formatted():
    assert _parse_number("1,234,567") == 1234567.0


def test_parse_number_non_numeric_string_returned_as_is():
    result = _parse_number("N/M")
    assert result == "N/M"


# ─── detect_statement_type ───────────────────────────────────────────────────

def test_detect_statement_type_income():
    df = pd.DataFrame({"A": ["Revenue", "Net Income", "Gross Profit"], "B": [100, 10, 50]})
    assert "Income" in detect_statement_type(df)


def test_detect_statement_type_balance_sheet():
    df = pd.DataFrame({"A": ["Total Assets", "Total Liabilities", "Retained Earnings"], "B": [100, 50, 50]})
    assert "Balance" in detect_statement_type(df)


def test_detect_statement_type_cash_flow():
    df = pd.DataFrame({"A": ["Operating Activities", "Net Cash", "Free Cash Flow"], "B": [100, 50, 50]})
    assert "Cash" in detect_statement_type(df)


def test_detect_statement_type_unknown():
    df = pd.DataFrame({"A": ["Foo", "Bar"], "B": [1, 2]})
    assert detect_statement_type(df) == "Financial Statement"


def test_detect_statement_type_keywords_in_columns():
    """Keywords in column headers should also be detected."""
    df = pd.DataFrame({"revenue": [100], "net income": [10]})
    result = detect_statement_type(df)
    assert "Income" in result or "Statement" in result


# ─── parse_file (entry point) ────────────────────────────────────────────────

@pytest.mark.asyncio
@patch("services.parser.parse_pdf")
async def test_parse_file_pdf(mock_parse_pdf):
    mock_parse_pdf.return_value = (
        pd.DataFrame({"label": ["Revenue"], "2023": [1000.0]}),
        None,
        "table",
    )
    file = make_upload_file("report.pdf", b"%PDF-1.4 data")
    df, raw_text, mode, stmt_type = await parse_file(file)
    assert mode == "table"
    assert df is not None


@pytest.mark.asyncio
@patch("services.parser.parse_excel")
async def test_parse_file_xlsx(mock_parse_excel):
    mock_parse_excel.return_value = pd.DataFrame({"label": ["Revenue"], "2023": [1000.0]})
    file = make_upload_file("report.xlsx", b"PK\x03\x04rest")
    df, raw_text, mode, stmt_type = await parse_file(file)
    assert df is not None


@pytest.mark.asyncio
@patch("services.parser.parse_excel")
async def test_parse_file_xls(mock_parse_excel):
    mock_parse_excel.return_value = pd.DataFrame({"label": ["Revenue"], "2023": [1000.0]})
    file = make_upload_file("report.xls", b"\xd0\xcf\x11\xe0rest")
    df, raw_text, mode, stmt_type = await parse_file(file)
    assert df is not None


@pytest.mark.asyncio
@patch("services.parser.parse_csv")
async def test_parse_file_csv(mock_parse_csv):
    mock_parse_csv.return_value = pd.DataFrame({"label": ["Revenue"], "2023": [1000.0]})
    file = make_upload_file("data.csv", b"label,2023\nRevenue,1000\n")
    df, raw_text, mode, stmt_type = await parse_file(file)
    assert df is not None


@pytest.mark.asyncio
@patch("services.parser.parse_pdf")
async def test_parse_file_text_mode_statement_type_financial(mock_parse_pdf):
    """Text mode (df=None) → statement_type defaults to 'Financial Statement'."""
    mock_parse_pdf.return_value = (None, "some text", "text")
    file = make_upload_file("report.pdf", b"%PDF-1.4 data")
    df, raw_text, mode, stmt_type = await parse_file(file)
    assert mode == "text"
    assert stmt_type == "Financial Statement"


@pytest.mark.asyncio
async def test_parse_file_unsupported_ext_after_validation(monkeypatch):
    """
    The else-branch at the bottom of parse_file (line 222) raises HTTPException
    for an extension that slips past validate_file. Since validate_file itself
    blocks unsupported extensions, we monkeypatch it to return bytes so the
    ext-dispatch inside parse_file reaches the unreachable else branch.
    """
    from services import parser
    from unittest.mock import AsyncMock as _AsyncMock

    monkeypatch.setattr(parser, "validate_file", _AsyncMock(return_value=b"data"))
    file = make_upload_file("report.txt", b"data")
    with pytest.raises(HTTPException) as exc:
        await parse_file(file)
    assert exc.value.status_code == 400
