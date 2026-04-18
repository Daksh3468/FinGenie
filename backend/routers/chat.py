from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
import re
from services.doc_chat import build_doc_context, chat_with_document

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    session_id: str = Field(
        ...,
        max_length=100,
        description="Session identifier (alphanumeric, -, _)"
    )
    user_message: str = Field(..., min_length=1, max_length=500)
    raw_data: list[dict] = Field(default_factory=list, max_items=1000)
    column_headers: list[str] = Field(default_factory=list, max_items=50)
    statement_type: str = Field(default="", max_length=100)
    summary: str = Field(default="", max_length=5000)
    kpis: list[dict] = Field(default_factory=list, max_items=50)
    risks: list[dict] = Field(default_factory=list, max_items=50)
    conversation_history: list[dict] = Field(
        default_factory=list,
        max_items=20,
        description="Limited to last 20 messages (10 turns) to stay within context"
    )
    
    @validator('session_id')
    def validate_session_id(cls, v):
        if not re.match(r'^[a-zA-Z0-9_\-]{1,100}$', v):
            raise ValueError('session_id must be alphanumeric with dashes and underscores only')
        return v


class ChatResponse(BaseModel):
    reply: str
    conversation_history: list[dict]


@router.post("/message", response_model=ChatResponse)
async def chat_message(body: ChatRequest):
    try:
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
    
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Chat failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=502, detail="Chat service unavailable. Try again.")