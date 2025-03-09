# 导入基础代理类
from app.agent.chat import Chat
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from fastapi import Query
from app.models.message import User, Conversation, Message
from app.api.user_api import get_current_user, oauth2_scheme
import uuid
from typing import List
from datetime import datetime


class QuestionRequest(BaseModel):
    question: str
    conversation_id: str | None = None


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime


chat_api = APIRouter(prefix="/chat")


@chat_api.post("/ask")
async def ask_post(request: QuestionRequest, current_user: User = Depends(get_current_user)):
    # 创建或获取会话
    conversation = None
    if request.conversation_id:
        conversation = await Conversation.filter(id=request.conversation_id, user=current_user).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="会话不存在")
    else:
        # 创建新会话
        conversation = await Conversation.create(
            id=uuid.uuid4(),
            title=request.question[:20] + "...",  # 使用问题的前20个字符作为标题
            user=current_user
        )
    
    # 保存用户消息
    await Message.create(
        id=uuid.uuid4(),
        conversation=conversation,
        role="user",
        content=request.question
    )
    
    # 创建聊天实例
    chat = Chat(model_name="qwen2:7b")
    
    # 创建生成器包装函数，用于保存AI回复
    async def response_generator():
        full_response = ""
        async for chunk in chat.ask(request.question):
            full_response += chunk
            yield chunk
        
        # 保存AI回复
        await Message.create(
            id=uuid.uuid4(),
            conversation=conversation,
            role="assistant",
            content=full_response.replace("event: message\ndata: ", "").strip()
        )
    
    return StreamingResponse(
        response_generator(),
        media_type="text/event-stream"
    )


@chat_api.get("/ask")
async def ask_get(question: str = Query(...), conversation_id: str = Query(None), token: str = Depends(oauth2_scheme)):
    # 获取当前用户
    current_user = await get_current_user(token)
    
    # 创建或获取会话
    conversation = None
    if conversation_id:
        conversation = await Conversation.filter(id=conversation_id, user=current_user).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="会话不存在")
    else:
        # 创建新会话
        conversation = await Conversation.create(
            id=uuid.uuid4(),
            title=question[:20] + "...",  # 使用问题的前20个字符作为标题
            user=current_user
        )
    
    # 保存用户消息
    await Message.create(
        id=uuid.uuid4(),
        conversation=conversation,
        role="user",
        content=question
    )
    
    # 创建聊天实例
    chat = Chat(model_name="qwen2:7b")
    
    # 创建生成器包装函数，用于保存AI回复
    async def response_generator():
        full_response = ""
        async for chunk in chat.ask(question):
            full_response += chunk
            yield chunk
        
        # 保存AI回复
        await Message.create(
            id=uuid.uuid4(),
            conversation=conversation,
            role="assistant",
            content=full_response.replace("event: message\ndata: ", "").strip()
        )
    
    return StreamingResponse(
        response_generator(),
        media_type="text/event-stream"
    )


@chat_api.get("/conversations")
async def get_conversations(current_user: User = Depends(get_current_user)):
    """获取当前用户的所有会话列表"""
    conversations = await Conversation.filter(user=current_user).order_by("-updated_at")
    
    result = []
    for conv in conversations:
        result.append({
            "id": str(conv.id),
            "title": conv.title,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at
        })
    
    return result

@chat_api.get("/messages/{conversation_id}")
async def get_conversation_messages(conversation_id: str, current_user: User = Depends(get_current_user)):
    """获取指定会话的所有消息"""
    # 验证会话是否存在且属于当前用户
    conversation = await Conversation.filter(id=conversation_id, user=current_user).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    # 获取会话的所有消息并按创建时间排序
    messages = await Message.filter(conversation=conversation).order_by("created_at")
    
    result = []
    for msg in messages:
        result.append({
            "id": str(msg.id),
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at
        })
    
    return result