from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.doc_chat import build_doc_context, chat_with_document

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    session_id: str                   # ties to an uploaded doc session
    user_message: str
    # Full analyzed doc payload (sent from frontend state — no server-side storage needed for MVP)
    raw_data: list[dict]
    column_headers: list[str]
    statement_type: str
    summary: str
    kpis: list[dict]
    risks: list[dict]
    conversation_history: list[dict]  # [{role, content}, ...]


class ChatResponse(BaseModel):
    reply: str
    conversation_history: list[dict]


@router.post("/message", response_model=ChatResponse)
async def chat_message(body: ChatRequest):
    if not body.user_message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    doc_context = build_doc_context(
        raw_data=body.raw_data,
        column_headers=body.column_headers,
        statement_type=body.statement_type,
        summary=body.summary,
        kpis=body.kpis,
        risks=body.risks,
    )

    reply = await chat_with_document(
        user_message=body.user_message,
        conversation_history=body.conversation_history,
        doc_context=doc_context,
    )

    updated_history = body.conversation_history + [
        {"role": "user", "content": body.user_message},
        {"role": "assistant", "content": reply},
    ]

    return ChatResponse(reply=reply, conversation_history=updated_history)