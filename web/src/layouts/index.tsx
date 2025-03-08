import {
  Bubble,
  Conversations,
  Prompts,
  Sender,
  XStream,
} from '@ant-design/x';
import React, { useEffect } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Button, type GetProp, Space } from 'antd';
import ChatLogo from './components/logo';
import { roles } from '../types';
import { useStyle } from '../types/chatCss';

const defaultConversationsItems = [
  {
    key: '0',
    label: '你好',
  },
];




const ChatLayout: React.FC = () => {
  // ==================== Style ====================
  const { styles } = useStyle();

  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [conversationsItems, setConversationsItems] = React.useState(defaultConversationsItems);
  const [activeKey, setActiveKey] = React.useState(defaultConversationsItems[0].key);
  const [messages, setMessages] = React.useState<Array<{
    id: string;
    message: string;
    status: 'loading' | 'local' | 'ai';
  }>>([]);
  const [isRequesting, setIsRequesting] = React.useState(false);

  useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
    }
  }, [activeKey]);

  // ==================== Event ====================
  const onSubmit = async (nextContent: string) => {
    if (!nextContent || isRequesting) return;

    // 添加用户消息
    const userMessageId = `user-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: userMessageId,
      message: nextContent,
      status: 'local'
    }]);

    // 添加AI消息占位
    const aiMessageId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: aiMessageId,
      message: '',
      status: 'loading'
    }]);

    setContent('');
    setIsRequesting(true);

    try {
      const response = await fetch(`/api/chat/ask?question=${encodeURIComponent(nextContent)}`);
      if (!response.ok) throw new Error('请求失败');

      let aiMessage = '';
      for await (const chunk of XStream({
        readableStream: response.body,
      })) {
        try {
          const jsonData = JSON.parse(chunk.data);
          aiMessage += jsonData.content;
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, message: aiMessage, status: 'ai' } : msg
          ));
        } catch (e) {
          console.error('解析数据失败:', e);
          throw new Error('数据解析失败');
        }
      }
    } catch (error) {
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId ? { ...msg, message: error instanceof Error ? error.message : '请求失败', status: 'ai' } : msg
      ));
    } finally {
      setIsRequesting(false);
    }
  };

  const onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'> = (info) => {
    onSubmit(info.data.description as string);
  };

  const onAddConversation = () => {
    setConversationsItems([
      ...conversationsItems,
      {
        key: `${conversationsItems.length}`,
        label: `New Conversation ${conversationsItems.length}`,
      },
    ]);
    setActiveKey(`${conversationsItems.length}`);
  };

  const onConversationClick: GetProp<typeof Conversations, 'onActiveChange'> = (key) => {
    setActiveKey(key);
  };

  // ==================== Nodes ====================
  const placeholderNode = (
    <Space direction="vertical" size={16} className={styles.placeholder}>
      <Prompts
        title="有什么是可以帮到你的呢?"
        styles={{
          list: {
            width: '100%',
          },
          item: {
            flex: 1,
          },
        }}
        onItemClick={onPromptsItemClick}
      />
    </Space>
  );

  const items: GetProp<typeof Bubble.List, 'items'> = messages.map(({ id, message, status }) => ({
    key: id,
    loading: status === 'loading',
    role: status === 'local' ? 'local' : 'ai',
    content: message,
  }));

  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={headerOpen}
      onOpenChange={setHeaderOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
    </Sender.Header>
  );


  // ==================== Render =================
  return (
    <div className={styles.layout}>
      <div className={styles.menu}>
        {/* 🌟 Logo */}
        <ChatLogo />
        {/* 🌟 添加会话 */}
        <Button
          onClick={onAddConversation}
          type="link"
          className={styles.addBtn}
          icon={<PlusOutlined />}
        >
          新建聊天
        </Button>
        {/* 🌟 会话管理 */}
        <Conversations
          items={conversationsItems}
          className={styles.conversations}
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </div>
      <div className={styles.chat}>
        {/* 🌟 消息列表 */}
        <Bubble.List
          items={items.length > 0 ? items : [{ content: placeholderNode, variant: 'borderless' }]}
          roles={roles}
          className={styles.messages}
        />

        <Sender
          value={content}
          header={senderHeader}
          onSubmit={onSubmit}
          onChange={setContent}
          loading={isRequesting}
          className={styles.sender}
        />
      </div>
    </div>
  );
};

export default ChatLayout;