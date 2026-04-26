import pytest
from services.doc_chat import build_doc_context, chat_with_document


# TESTS: build_doc_context

def test_build_doc_context_full_data():
    raw_data = [{"a": 1, "b": 2}]
    headers = ["a", "b"]

    kpis = [{"name": "Revenue", "formatted_value": "1000", "status": "good"}]
    risks = [{"severity": "high", "risk": "Loss", "description": "Big loss"}]

    result = build_doc_context(
        raw_data,
        headers,
        "Income Statement",
        "This is summary",
        kpis,
        risks,
    )

    assert "DOCUMENT TYPE: Income Statement" in result
    assert "Revenue" in result
    assert "HIGH" in result
    assert "This is summary" in result


def test_build_doc_context_empty_data():
    result = build_doc_context(
        raw_data=[],
        column_headers=[],
        statement_type="Balance Sheet",
        summary="",
        kpis=[],
        risks=[],
    )

    assert "No tabular data." in result
    assert "None computed." in result
    assert "None detected." in result
    assert "Not available." in result


def test_build_doc_context_partial_data():
    raw_data = [{"x": 10}]
    
    result = build_doc_context(
        raw_data=raw_data,
        column_headers=None,
        statement_type="Test",
        summary=None,
        kpis=[],
        risks=[],
    )

    assert "x" in result  # column present
    assert "None computed." in result


# TESTS: chat_with_document

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
                return MockResponse("Mocked response")

        completions = Completions()

    chat = Chat()


@pytest.mark.asyncio
async def test_chat_with_document(monkeypatch):
    #  Mock groq client
    from services import doc_chat

    monkeypatch.setattr(doc_chat, "get_groq_client", lambda: MockClient())

    result = await chat_with_document(
        user_message="What is revenue?",
        conversation_history=[{"role": "user", "content": "Hi"}],
        doc_context="Sample context",
    )

    assert result == "Mocked response"


@pytest.mark.asyncio
async def test_chat_with_document_history_limit(monkeypatch):
    from services import doc_chat

    monkeypatch.setattr(doc_chat, "get_groq_client", lambda: MockClient())

    # Create >20 messages to test slicing
    history = [{"role": "user", "content": f"msg{i}"} for i in range(30)]

    result = await chat_with_document(
        user_message="Test",
        conversation_history=history,
        doc_context="Context",
    )

    assert result == "Mocked response"


@pytest.mark.asyncio
async def test_chat_with_document_empty_history(monkeypatch):
    from services import doc_chat

    monkeypatch.setattr(doc_chat, "get_groq_client", lambda: MockClient())

    result = await chat_with_document(
        user_message="Hello",
        conversation_history=[],
        doc_context="Context",
    )

    assert result == "Mocked response"