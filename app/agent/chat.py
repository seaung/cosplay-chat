from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama
from typing import AsyncGenerator
import json


class Chat:
    def __init__(self, model_name: str = "llama3:8b"):
        self.template = """
        You are a helpful assistant who can answer questions.
        """
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.template),
            ("human", "{question}"),
        ])
        self.model = ChatOllama(model=model_name)
        self.chain = self.prompt | self.model | StrOutputParser()
    
    async def ask(self, question: str) -> AsyncGenerator[str, None]:
        """向AI助手提问并获取流式响应

        Args:
            question (str): 用户的问题

        Yields:
            AsyncGenerator[str, None]: 生成器，用于流式返回AI的回答
        """
        chunk_id = 0
        async for chunk in self.chain.astream(input={"question": question}):
            if chunk:
                # 构建JSON格式的响应数据
                response_data = {
                    "id": str(chunk_id),
                    "content": chunk
                }
                chunk_id += 1
                # 返回SSE格式的数据
                yield f"event: message\ndata: {json.dumps(response_data)}\n\n"