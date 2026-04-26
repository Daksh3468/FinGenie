"""
test_llm_analyzer.py — 100% coverage for services/llm_analyzer.py
Covers: success path, empty DF, backtick-wrapped JSON,
JSON parse error (502), timeout (504), generic exception (502).
Also covers the two previously-missed lines: the df.empty branch that
builds data_preview as "[No data rows provided]", and the except block
that logs and raises on JSONDecodeError (content variable in scope).
"""

import asyncio
import json
import pytest
import pandas as pd
from fastapi import HTTPException

from services.llm_analyzer import generate_summary


# ─── Mock Infrastructure ──────────────────────────────────────────────────────

def _make_client(content: str):
    """Build a minimal synchronous mock Groq client that returns `content`."""

    class _Msg:
        def __init__(self, c):
            self.content = c

    class _Choice:
        def __init__(self, c):
            self.message = _Msg(c)

    class _Resp:
        def __init__(self, c):
            self.choices = [_Choice(c)]

    class _Completions:
        def __init__(self, c):
            self._c = c

        def create(self, **_):
            return _Resp(self._c)

    class _Chat:
        def __init__(self, c):
            self.completions = _Completions(c)

    class _Client:
        def __init__(self, c):
            self.chat = _Chat(c)

    return _Client(content)


_GOOD_PAYLOAD = json.dumps({
    "summary": "Test summary",
    "recommendations": ["Do something specific"],
    "risk_mitigations": {"Risk1": "Fix it step by step"},
})


# ─── Helpers ─────────────────────────────────────────────────────────────────

class _KPI:
    name = "Revenue"
    formatted_value = "$1,000"
    status = "good"
    description = "Revenue description"


class _Risk:
    severity = "high"
    risk = "Risk1"
    description = "Big loss"


class _Trend:
    metric = "Revenue"
    direction = "up"
    magnitude = 10
    period = "2022 → 2023"


# ─── Success ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_generate_summary_success(monkeypatch):
    from services import llm_analyzer
    monkeypatch.setattr(llm_analyzer, "get_groq_client", lambda: _make_client(_GOOD_PAYLOAD))

    result = await generate_summary(
        pd.DataFrame([{"a": 1}]),
        "Income Statement",
        [_KPI()], [_Risk()], [_Trend()],
    )

    assert result["summary"] == "Test summary"
    assert len(result["recommendations"]) > 0
    assert "Risk1" in result["risk_mitigations"]


# ─── Empty DataFrame → "[No data rows provided]" branch ─────────────────────

@pytest.mark.asyncio
async def test_generate_summary_empty_df(monkeypatch):
    """df.empty path sets data_preview to '[No data rows provided]'."""
    from services import llm_analyzer
    monkeypatch.setattr(llm_analyzer, "get_groq_client", lambda: _make_client(_GOOD_PAYLOAD))

    result = await generate_summary(pd.DataFrame(), "Balance Sheet", [], [], [])
    assert "summary" in result


@pytest.mark.asyncio
async def test_generate_summary_none_df(monkeypatch):
    """None df also hits the else branch."""
    from services import llm_analyzer
    monkeypatch.setattr(llm_analyzer, "get_groq_client", lambda: _make_client(_GOOD_PAYLOAD))

    result = await generate_summary(None, "Balance Sheet", [], [], [])
    assert "summary" in result


# ─── No trends list ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_generate_summary_no_trends(monkeypatch):
    """Empty trends list → 'No clear trends detected' fallback text in prompt."""
    from services import llm_analyzer
    monkeypatch.setattr(llm_analyzer, "get_groq_client", lambda: _make_client(_GOOD_PAYLOAD))

    result = await generate_summary(
        pd.DataFrame([{"a": 1}]),
        "Income Statement",
        [], [], [],
    )
    assert "summary" in result


# ─── Backtick JSON cleaning ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_generate_summary_backtick_cleaning(monkeypatch):
    from services import llm_analyzer
    wrapped = "```json\n" + _GOOD_PAYLOAD + "\n```"
    monkeypatch.setattr(llm_analyzer, "get_groq_client", lambda: _make_client(wrapped))

    result = await generate_summary(pd.DataFrame([{"a": 1}]), "Test", [], [], [])
    assert result["summary"] == "Test summary"


# ─── Missing keys in LLM response → defaults applied ────────────────────────

@pytest.mark.asyncio
async def test_generate_summary_missing_keys_use_defaults(monkeypatch):
    """LLM returns valid JSON but omits all keys → fallback defaults returned."""
    from services import llm_analyzer
    monkeypatch.setattr(llm_analyzer, "get_groq_client", lambda: _make_client("{}"))

    result = await generate_summary(pd.DataFrame([{"a": 1}]), "Test", [], [], [])
    assert "summary" in result
    assert isinstance(result["recommendations"], list)
    assert isinstance(result["risk_mitigations"], dict)


# ─── JSON parse error → 502 ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_generate_summary_json_error_raises_502(monkeypatch):
    from services import llm_analyzer
    monkeypatch.setattr(llm_analyzer, "get_groq_client", lambda: _make_client("NOT VALID JSON"))

    with pytest.raises(HTTPException) as exc:
        await generate_summary(pd.DataFrame([{"a": 1}]), "Test", [], [], [])
    assert exc.value.status_code == 502


# ─── Timeout → 504 ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_generate_summary_timeout_raises_504(monkeypatch):
    from services import llm_analyzer

    async def _timeout(*_, **__):
        raise asyncio.TimeoutError()

    monkeypatch.setattr(llm_analyzer, "get_groq_client", lambda: _make_client(_GOOD_PAYLOAD))
    monkeypatch.setattr(llm_analyzer.asyncio, "wait_for", _timeout)

    with pytest.raises(HTTPException) as exc:
        await generate_summary(pd.DataFrame([{"a": 1}]), "Test", [], [], [])
    assert exc.value.status_code == 504


# ─── Generic exception → 502 ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_generate_summary_generic_exception_raises_502(monkeypatch):
    from services import llm_analyzer

    class _BrokenClient:
        class chat:
            class completions:
                @staticmethod
                def create(**_):
                    raise RuntimeError("API down")

    monkeypatch.setattr(llm_analyzer, "get_groq_client", lambda: _BrokenClient())

    with pytest.raises(HTTPException) as exc:
        await generate_summary(pd.DataFrame([{"a": 1}]), "Test", [], [], [])
    assert exc.value.status_code == 502


# ─── data_preview truncation (>3000 chars) ───────────────────────────────────

@pytest.mark.asyncio
async def test_generate_summary_large_df_truncates(monkeypatch):
    """Very large DataFrame should not raise; preview is capped at 3000 chars."""
    from services import llm_analyzer
    monkeypatch.setattr(llm_analyzer, "get_groq_client", lambda: _make_client(_GOOD_PAYLOAD))

    big_df = pd.DataFrame({f"col{i}": list(range(20)) for i in range(50)})
    result = await generate_summary(big_df, "Test", [], [], [])
    assert "summary" in result


# ─── data_preview exception branch (line 27-28) ──────────────────────────────

@pytest.mark.asyncio
async def test_generate_summary_df_to_dict_exception(monkeypatch):
    """DataFrame.to_dict() failure → data_preview = '[Data preview unavailable: ...]'."""
    from services import llm_analyzer
    from unittest.mock import MagicMock, patch

    monkeypatch.setattr(llm_analyzer, "get_groq_client", lambda: _make_client(_GOOD_PAYLOAD))

    # Build a DataFrame whose .head().to_dict() raises
    bad_df = MagicMock(spec=pd.DataFrame)
    bad_df.empty = False
    bad_df.__bool__ = lambda s: True
    bad_df.head.return_value.to_dict.side_effect = Exception("serialise error")

    result = await generate_summary(bad_df, "Test", [], [], [])
    assert "summary" in result
