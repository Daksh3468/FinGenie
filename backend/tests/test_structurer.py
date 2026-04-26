import pytest
import pandas as pd
import json
from services.structurer import extract_data_from_text


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
                return MockResponse(json.dumps({
                    "statement_type": "Income Statement",
                    "data": {
                        "Total Revenue": {"2023": 1000, "2022": 800},
                        "Net Profit": {"2023": 200, "2022": 150}
                    }
                }))
        completions = Completions()

    chat = Chat()


#  SUCCESS CASE

@pytest.mark.asyncio
async def test_extract_data_success(monkeypatch):
    from services import structurer

    monkeypatch.setattr(structurer, "get_groq_client", lambda: MockClient())

    df, statement_type = await extract_data_from_text("sample financial text")

    assert statement_type == "Income Statement"
    assert not df.empty
    assert "Metric" in df.columns
    assert "Total Revenue" in df["Metric"].values


#  EMPTY DATA RETURNED


class MockEmptyDataClient:
    class Chat:
        class Completions:
            @staticmethod
            def create(**kwargs):
                return MockResponse(json.dumps({
                    "statement_type": "Unknown",
                    "data": {}
                }))
        completions = Completions()

    chat = Chat()


@pytest.mark.asyncio
async def test_extract_data_empty(monkeypatch):
    from services import structurer

    monkeypatch.setattr(structurer, "get_groq_client", lambda: MockEmptyDataClient())

    df, statement_type = await extract_data_from_text("no data")

    assert df.empty
    assert statement_type == "Unknown"


#  INVALID JSON RESPONSE

class MockBadJSONClient:
    class Chat:
        class Completions:
            @staticmethod
            def create(**kwargs):
                return MockResponse("INVALID JSON")
        completions = Completions()

    chat = Chat()


@pytest.mark.asyncio
async def test_extract_data_invalid_json(monkeypatch):
    from services import structurer

    monkeypatch.setattr(structurer, "get_groq_client", lambda: MockBadJSONClient())

    df, statement_type = await extract_data_from_text("bad json")

    # Should fallback to exception block
    assert df.empty
    assert statement_type == "Financial Statement"


# MISSING KEYS IN RESPONSE


class MockMissingKeysClient:
    class Chat:
        class Completions:
            @staticmethod
            def create(**kwargs):
                return MockResponse(json.dumps({}))  # no keys
        completions = Completions()

    chat = Chat()


@pytest.mark.asyncio
async def test_extract_data_missing_keys(monkeypatch):
    from services import structurer

    monkeypatch.setattr(structurer, "get_groq_client", lambda: MockMissingKeysClient())

    df, statement_type = await extract_data_from_text("missing keys")

    assert df.empty
    assert statement_type == "Financial Statement"


# DATAFRAME STRUCTURE VALIDATION

@pytest.mark.asyncio
async def test_dataframe_structure(monkeypatch):
    from services import structurer

    monkeypatch.setattr(structurer, "get_groq_client", lambda: MockClient())

    df, _ = await extract_data_from_text("structured test")

    # Ensure columns include years
    assert any(col in df.columns for col in ["2023", "2022"])
    assert df.columns[0] == "Metric"


#  GENERIC EXCEPTION HANDLING


class MockErrorClient:
    class Chat:
        class Completions:
            @staticmethod
            def create(**kwargs):
                raise Exception("API failure")
        completions = Completions()

    chat = Chat()


@pytest.mark.asyncio
async def test_extract_data_exception(monkeypatch):
    from services import structurer

    monkeypatch.setattr(structurer, "get_groq_client", lambda: MockErrorClient())

    df, statement_type = await extract_data_from_text("error")

    assert df.empty
    assert statement_type == "Financial Statement"