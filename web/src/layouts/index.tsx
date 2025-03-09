import { XStream } from '@ant-design/x';
import React, { useEffect } from 'react';
import { useStyle } from '../types/chatCss';
import SideMenu from './components/SideMenu';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { get } from '../utils/request';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setConversations,
  setActiveConversation,
  setMessages,
  addUserMessage,
  addAiMessage,
  updateAiMessage,
  setRequestingStatus,
  clearMessages
} from '../store/modules/chat';

const defaultConversationsItems = [
  {
    key: '0',
    label: '你好',
  },
];

const ChatLayout: React.FC = () => {
  // ==================== Style ====================
  const { styles } = useStyle();
  
  // ==================== Redux ====================
  const dispatch = useDispatch();
  const { conversations, activeConversationKey, messages, isRequesting } = useSelector((state: RootState) => state.chat);
  
  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = React.useState(false);
  const [content, setContent] = React.useState('');

  // 获取会话列表
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await get<Array<{
          id: string;
          title: string;
          created_at: string;
          updated_at: string;
        }>>('/api/chat/conversations');
        
        if (response && response.length > 0) {
          // 将后端返回的会话数据转换为SideMenu组件所需的格式
          const conversationItems = response.map(item => ({
            key: item.id,
            label: item.title,
          }));
          
          dispatch(setConversations(conversationItems));
          // 如果有会话，默认选中第一个
          dispatch(setActiveConversation(conversationItems[0].key));
        }
      } catch (error) {
        console.error('获取会话列表失败:', error);
      }
    };
    
    fetchConversations();
  }, [dispatch]);

  useEffect(() => {
    if (activeConversationKey !== undefined) {
      dispatch(clearMessages());
    }
  }, [activeConversationKey, dispatch]);

  // ==================== Event ====================
  const onSubmit = async (nextContent: string) => {
    if (!nextContent || isRequesting) return;

    // 添加用户消息
    const userMessageId = `user-${Date.now()}`;
    dispatch(addUserMessage({ id: userMessageId, message: nextContent }));

    // 添加AI消息占位
    const aiMessageId = `ai-${Date.now()}`;
    dispatch(addAiMessage({ id: aiMessageId }));

    setContent('');
    dispatch(setRequestingStatus(true));

    try {
      // 使用封装的axios请求替代fetch，但保留流式响应处理
      const response = await fetch(`/api/chat/ask?question=${encodeURIComponent(nextContent)}${activeConversationKey !== '0' ? `&conversation_id=${activeConversationKey}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!response.ok) throw new Error('请求失败');

      let aiMessage = '';
      for await (const chunk of XStream({
        readableStream: response.body,
      })) {
        try {
          const jsonData = JSON.parse(chunk.data);
          // 确保content字段是字符串
          let content = jsonData.content;
          if (typeof content !== 'string') {
            // 如果content不是字符串，尝试将其转换为字符串
            if (content && typeof content.content === 'string') {
              content = content.content;
            } else {
              content = JSON.stringify(content);
            }
          }
          aiMessage += content;
          dispatch(updateAiMessage({ id: aiMessageId, message: aiMessage, status: 'ai' }));
        } catch (e) {
          console.error('解析数据失败:', e);
          throw new Error('数据解析失败');
        }
      }
    } catch (error) {
      dispatch(updateAiMessage({ 
        id: aiMessageId, 
        message: error instanceof Error ? error.message : '请求失败', 
        status: 'ai' 
      }));
    } finally {
      dispatch(setRequestingStatus(false));
    }
  };

  const onPromptsItemClick = (info: { data: { description: string } }) => {
    onSubmit(info.data.description as string);
  };

  const onAddConversation = () => {
    // 创建新会话时，不需要立即调用API，只需要在用户发送第一条消息时创建
    // 设置一个临时的key为'0'，表示这是一个新会话
    dispatch(setActiveConversation('0'));
    dispatch(clearMessages());
  };

  const onConversationClick = (key: string) => {
    dispatch(setActiveConversation(key));
    
    // 如果不是新会话，则获取历史消息
    if (key !== '0') {
      fetchConversationMessages(key);
    } else {
      // 如果是新会话，清空消息列表
      dispatch(clearMessages());
    }
  };
  
  // 获取特定会话的历史消息
  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const response = await get<Array<{
        id: string;
        role: string;
        content: string;
        created_at: string;
      }>>(`/api/chat/messages/${conversationId}`);
      
      if (response && response.length > 0) {
        // 将后端返回的消息数据转换为前端所需的格式
        const messageItems = response.map(item => {
          // 处理content字段，确保它是字符串格式
          let messageContent = item.content;
          try {
            // 检查content是否是JSON字符串
            if (typeof messageContent === 'string' && (messageContent.startsWith('{') || messageContent.startsWith('['))) {
              const parsedContent = JSON.parse(messageContent);
              // 如果解析成功且包含content字段，则使用该字段
              if (parsedContent && typeof parsedContent.content === 'string') {
                messageContent = parsedContent.content;
              } else if (typeof parsedContent === 'string') {
                // 如果解析结果本身就是字符串
                messageContent = parsedContent;
              }
            }
          } catch (e) {
            // 解析失败，保持原始内容
            console.log('消息内容解析失败，使用原始内容', e);
          }
          
          return {
            id: item.id,
            message: messageContent,
            // 历史消息直接设置为最终状态，不使用loading状态
            status: item.role === 'user' ? 'local' as const : 'ai' as const
          };
        });
        
        // 直接设置完整的消息列表，不进行流式处理
        dispatch(setMessages(messageItems));
      } else {
        dispatch(clearMessages());
      }
    } catch (error) {
      console.error('获取会话消息失败:', error);
      dispatch(clearMessages());
    }
  };

  // ==================== Render =================
  return (
    <div className={styles.layout}>
      <SideMenu 
        conversationsItems={conversations}
        activeKey={activeConversationKey}
        onAddConversation={onAddConversation}
        onConversationClick={onConversationClick}
      />
      <div className={styles.chat}>
        {/* 🌟 消息列表 */}
        <MessageList 
          messages={messages}
          onPromptsItemClick={onPromptsItemClick}
        />

        <ChatInput 
          content={content}
          headerOpen={headerOpen}
          isRequesting={isRequesting}
          onSubmit={onSubmit}
          onChange={setContent}
          onOpenChange={setHeaderOpen}
        />
      </div>
    </div>
  );
};

export default ChatLayout;