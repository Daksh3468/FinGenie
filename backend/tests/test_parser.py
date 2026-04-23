"""
tests/test_parser.py
--------------------
Unit tests for file parsing and validation.
"""

import pytest
from fastapi import HTTPException
from services.parser import validate_file, ALLOWED_EXTENSIONS, MAX_FILE_SIZE
from unittest.mock import MagicMock, AsyncMock


@pytest.mark.asyncio
async def test_validate_file_allowed_extension():
    """Test that allowed extensions pass validation."""
    file_mock = MagicMock()
    file_mock.filename = "test.pdf"
    file_mock.read = AsyncMock(return_value=b"%PDF")  # PDF magic signature
    
    content = await validate_file(file_mock)
    assert content == b"%PDF"


@pytest.mark.asyncio
async def test_validate_file_disallowed_extension():
    """Test that disallowed extensions raise error."""
    file_mock = MagicMock()
    file_mock.filename = "test.exe"
    file_mock.read = AsyncMock(return_value=b"MZ")
    
    with pytest.raises(HTTPException) as exc_info:
        await validate_file(file_mock)
    
    assert exc_info.value.status_code == 400
    assert "invalid file format upload only PDF, Excel and CSV" in exc_info.value.detail


@pytest.mark.asyncio
async def test_validate_file_too_large():
    """Test that oversized files are rejected."""
    file_mock = MagicMock()
    file_mock.filename = "large.pdf"
    file_mock.read = AsyncMock(return_value=b"x" * (MAX_FILE_SIZE + 1))
    
    with pytest.raises(HTTPException) as exc_info:
        await validate_file(file_mock)
    
    assert exc_info.value.status_code == 400
    assert "too large" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_validate_file_magic_signature_mismatch():
    """Test that magic signature mismatch is detected."""
    file_mock = MagicMock()
    file_mock.filename = "fake.pdf"
    file_mock.read = AsyncMock(return_value=b"PK\x03\x04")  # ZIP signature, not PDF
    
    with pytest.raises(HTTPException) as exc_info:
        await validate_file(file_mock)
    
    assert exc_info.value.status_code == 400
    assert "File content mismatch" in exc_info.value.detail or "mismatch" in exc_info.value.detail.lower()


if __name__ == "__main__":
    pytest.main([__file__])
