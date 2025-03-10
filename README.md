# Cosplay Chat

一个基于LLM的聊天应用，支持多轮对话和上下文记忆功能。

## 功能特点

- 多轮对话：AI能够记住之前的对话内容，提供连贯的回答
- 会话管理：支持创建多个独立的会话，方便管理不同主题的对话
- 实时响应：采用流式响应技术，实现打字机效果的即时回复
- 用户认证：完整的用户注册、登录和认证系统

## 技术栈

### 后端
- FastAPI：高性能的Python Web框架
- LangChain：LLM应用开发框架
- Ollama：本地部署的开源大语言模型
- Tortoise ORM：异步ORM数据库框架

### 前端
- React：用户界面库
- Redux：状态管理
- TypeScript：类型安全的JavaScript超集

## 上下文功能实现

系统通过以下方式实现了对话上下文的连贯性：

1. 在Chat类中添加了对话历史记录的支持
2. 每次对话时，从数据库中获取历史消息并传递给LLM
3. 使用LangChain的ChatPromptTemplate构建包含历史记录的prompt
4. 在API层面确保每次请求都能携带完整的上下文信息

---
that's all