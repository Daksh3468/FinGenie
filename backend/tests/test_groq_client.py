import os
import pytest
from unittest.mock import patch, MagicMock

from services.groq_client import get_groq_client, GROQ_MODEL


def test_groq_model_constant():
    """
    Ensure default model is correctly defined.
    """
    assert GROQ_MODEL == "llama-3.3-70b-versatile"


@patch.dict(os.environ, {"GROQ_API_KEY": "test-key"})
@patch("services.groq_client.Groq")
def test_get_groq_client_success(mock_groq):
    """
    Should return Groq client when API key exists.
    """
    mock_instance = MagicMock()
    mock_groq.return_value = mock_instance

    client = get_groq_client()

    mock_groq.assert_called_once_with(api_key="test-key")
    assert client == mock_instance


@patch.dict(os.environ, {}, clear=True)
def test_get_groq_client_missing_key():
    """
    Should raise ValueError when GROQ_API_KEY is missing.
    """
    with pytest.raises(ValueError) as exc_info:
        get_groq_client()

    assert "GROQ_API_KEY not found" in str(exc_info.value)