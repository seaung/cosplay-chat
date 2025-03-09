import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 定义消息类型
interface Message {
  id: string;
  message: string;
  status: 'loading' | 'local' | 'ai';
}

// 定义会话类型
interface Conversation {
  key: string;
  label: string;
}

// 定义聊天状态类型
interface ChatState {
  conversations: Conversation[];
  activeConversationKey: string;
  messages: Message[];
  isRequesting: boolean;
}

// 初始状态
const initialState: ChatState = {
  conversations: [{ key: '0', label: '新会话' }],
  activeConversationKey: '0',
  messages: [],
  isRequesting: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // 设置会话列表
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    
    // 设置当前活跃会话
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversationKey = action.payload;
    },
    
    // 添加新会话
    addConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.push(action.payload);
    },
    
    // 设置消息列表
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    
    // 添加用户消息
    addUserMessage: (state, action: PayloadAction<{ id: string; message: string }>) => {
      state.messages.push({
        id: action.payload.id,
        message: action.payload.message,
        status: 'local'
      });
    },
    
    // 添加AI消息（初始为loading状态）
    addAiMessage: (state, action: PayloadAction<{ id: string }>) => {
      state.messages.push({
        id: action.payload.id,
        message: '',
        status: 'loading'
      });
    },
    
    // 更新AI消息内容
    updateAiMessage: (state, action: PayloadAction<{ id: string; message: string; status: 'loading' | 'ai' }>) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          message: action.payload.message,
          status: action.payload.status
        };
      }
    },
    
    // 设置请求状态
    setRequestingStatus: (state, action: PayloadAction<boolean>) => {
      state.isRequesting = action.payload;
    },
    
    // 清空消息
    clearMessages: (state) => {
      state.messages = [];
    },
    
    // 重置聊天状态
    resetChat: (state) => {
      return initialState;
    }
  }
});

export const {
  setConversations,
  setActiveConversation,
  addConversation,
  setMessages,
  addUserMessage,
  addAiMessage,
  updateAiMessage,
  setRequestingStatus,
  clearMessages,
  resetChat
} = chatSlice.actions;

export default chatSlice.reducer;