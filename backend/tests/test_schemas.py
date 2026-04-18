"""
tests/test_schemas.py
---------------------
Unit tests for Pydantic schema validation and bounds.
"""

import pytest
from pydantic import ValidationError
from routers.chat import ChatRequest
from routers.report import ReportRequest


def test_chat_request_valid():
    """Test that valid ChatRequest passes validation."""
    request = ChatRequest(
        session_id="test-session",
        user_message="What is the gross profit margin?",
        raw_data=[],
        column_headers=[],
        statement_type="Balance Sheet",
        summary="",
        kpis=[],
        risks=[],
        conversation_history=[]
    )
    assert request.session_id == "test-session"
    assert request.user_message == "What is the gross profit margin?"


def test_chat_request_invalid_session_id_special_chars():
    """Test that ChatRequest rejects session_id with special characters."""
    with pytest.raises(ValidationError) as exc_info:
        ChatRequest(
            session_id="test@session!",  # @ and ! not allowed
            user_message="Test message",
        )
    assert "session_id" in str(exc_info.value)


def test_chat_request_empty_message():
    """Test that ChatRequest rejects empty user_message."""
    with pytest.raises(ValidationError) as exc_info:
        ChatRequest(
            session_id="test-session",
            user_message="",  # Empty message
        )
    assert "user_message" in str(exc_info.value)


def test_chat_request_message_too_long():
    """Test that ChatRequest rejects message exceeding max_length."""
    with pytest.raises(ValidationError) as exc_info:
        ChatRequest(
            session_id="test-session",
            user_message="x" * 501,  # Exceeds max_length=500
        )
    assert "user_message" in str(exc_info.value)


def test_chat_request_conversation_history_limit():
    """Test that ChatRequest enforces max_items=20 on conversation_history."""
    # Create 21 messages (exceeds limit of 20)
    history = [{"role": "user", "content": f"msg{i}"} for i in range(21)]
    
    with pytest.raises(ValidationError) as exc_info:
        ChatRequest(
            session_id="test-session",
            user_message="Test",
            conversation_history=history
        )
    assert "conversation_history" in str(exc_info.value)


def test_report_request_valid():
    """Test that valid ReportRequest passes validation."""
    request = ReportRequest(
        format_id="executive",
        raw_data=[],
        column_headers=[],
        statement_type="Income Statement",
        summary="",
        kpis=[],
        risks=[],
        recommendations=[]
    )
    assert request.format_id == "executive"


def test_report_request_raw_data_limit():
    """Test that ReportRequest enforces max_items=1000 on raw_data."""
    # Create 1001 rows (exceeds limit of 1000)
    raw_data = [{"col": f"val{i}"} for i in range(1001)]
    
    with pytest.raises(ValidationError) as exc_info:
        ReportRequest(
            format_id="executive",
            raw_data=raw_data
        )
    assert "raw_data" in str(exc_info.value)


if __name__ == "__main__":
    pytest.main([__file__])
