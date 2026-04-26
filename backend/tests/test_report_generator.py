import pytest
from fastapi import HTTPException
from services.report_generator import (
    _build_report_prompt,
    generate_report,
    REPORT_FORMATS
)


#  MOCK CLASSES

class MockChoice:
    def __init__(self, content):
        self.message = type("msg", (), {"content": content})


class MockResponse:
    def __init__(self, content):
        self.choices = [MockChoice(content)]


class MockClient:
    class Chat:
        class Completions:
            @staticmethod
            def create(**kwargs):
                return MockResponse("Generated Report Content")
        completions = Completions()

    chat = Chat()


#  TEST: _build_report_prompt

def test_build_report_prompt_full_data():
    analysis = {
        "kpis": [{"name": "Revenue", "formatted_value": "1000", "trend": "up", "description": "Growth"}],
        "risks": [{"severity": "high", "risk": "Loss", "description": "Big loss"}],
        "recommendations": ["Reduce cost"],
        "raw_data": [{"col1": 1}],
        "column_headers": ["col1"],
        "statement_type": "Income Statement",
        "summary": "Good performance",
        "parsing_mode": "advanced"
    }

    prompt = _build_report_prompt(analysis, "executive")

    assert "Income Statement" in prompt
    assert "Revenue" in prompt
    assert "Loss" in prompt
    assert "Reduce cost" in prompt
    assert "Good performance" in prompt


def test_build_report_prompt_empty_data():
    analysis = {}

    prompt = _build_report_prompt(analysis, "executive")

    assert "No KPI data available." in prompt
    assert "No risks identified." in prompt
    assert "No recommendations available." in prompt
    assert "No raw data available." in prompt


def test_build_report_prompt_invalid_format_defaults():
    analysis = {}

    prompt = _build_report_prompt(analysis, "invalid_format")

    # should fallback to executive
    assert REPORT_FORMATS["executive"]["label"] in prompt


#  TEST: generate_report SUCCESS


@pytest.mark.asyncio
async def test_generate_report_success(monkeypatch):
    from services import report_generator

    monkeypatch.setattr(report_generator, "get_groq_client", lambda: MockClient())

    analysis = {}

    result = await generate_report(analysis, "executive")

    assert result == "Generated Report Content"


# TEST: INVALID FORMAT

@pytest.mark.asyncio
async def test_generate_report_invalid_format():
    with pytest.raises(ValueError):
        await generate_report({}, "invalid_format")


#  TEST: TIMEOUT


@pytest.mark.asyncio
async def test_generate_report_timeout(monkeypatch):
    from services import report_generator
    import asyncio

    async def mock_timeout(*args, **kwargs):
        raise asyncio.TimeoutError()

    monkeypatch.setattr(report_generator, "get_groq_client", lambda: MockClient())
    monkeypatch.setattr(report_generator.asyncio, "wait_for", mock_timeout)

    with pytest.raises(HTTPException) as exc:
        await generate_report({}, "executive")

    assert exc.value.status_code == 504


# TEST: GENERIC ERROR

class MockErrorClient:
    class Chat:
        class Completions:
            @staticmethod
            def create(**kwargs):
                raise Exception("API failure")
        completions = Completions()

    chat = Chat()


@pytest.mark.asyncio
async def test_generate_report_api_error(monkeypatch):
    from services import report_generator

    monkeypatch.setattr(report_generator, "get_groq_client", lambda: MockErrorClient())

    with pytest.raises(HTTPException) as exc:
        await generate_report({}, "executive")

    assert exc.value.status_code == 502