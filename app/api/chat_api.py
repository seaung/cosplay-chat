# 导入基础代理类
from app.agent.chat import Chat
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from fastapi import Query


class QuestionRequest(BaseModel):
    question: str


chat_api = APIRouter(prefix="/chat")


@chat_api.post("/ask")
async def ask_post(request: QuestionRequest):
    chat = Chat(model_name="qwen2:7b")
    return StreamingResponse(
        chat.ask(request.question),
        media_type="text/event-stream"
    )


@chat_api.get("/ask")
async def ask_get(question: str = Query(...)):
    chat = Chat(model_name="qwen2:7b")
    return StreamingResponse(
        chat.ask(question),
        media_type="text/event-stream"
    )