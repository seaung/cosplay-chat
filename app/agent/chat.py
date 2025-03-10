from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama
from typing import AsyncGenerator, List, Dict, Any
import json


class Chat:
    def __init__(self, model_name: str = "llama3:8b"):
        self.template = """
        You are a helpful assistant who can answer questions.
        """
        self.model = ChatOllama(model=model_name)
        self.history: List[Dict[str, Any]] = []
    
    async def ask(self, question: str, conversation_history: List[Dict[str, str]] = []) -> AsyncGenerator[str, None]:
        """向AI助手提问并获取流式响应

        Args:
            question (str): 用户的问题
            conversation_history (List[Dict[str, str]], optional): 对话历史记录。默认为None。

        Yields:
            AsyncGenerator[str, None]: 生成器，用于流式返回AI的回答
        """
        # 构建包含历史记录的prompt
        messages = [
            ("system", self.template),
        ]
        
        # 添加历史消息到prompt
        if conversation_history:
            for msg in conversation_history:
                messages.append((msg["role"], msg["content"]))
        
        # 添加当前问题
        messages.append(("human", question))
        
        # 创建prompt模板
        prompt = ChatPromptTemplate.from_messages(messages)
        
        # 创建chain
        chain = prompt | self.model | StrOutputParser()
        
        chunk_id = 0
        async for chunk in chain.astream(input={}):
            if chunk:
                # 构建JSON格式的响应数据
                response_data = {
                    "id": str(chunk_id),
                    "content": chunk
                }
                chunk_id += 1
                # 返回SSE格式的数据
                yield f"event: message\ndata: {json.dumps(response_data)}\n\n"