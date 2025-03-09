import { Bubble, Prompts } from '@ant-design/x';
import { Space } from 'antd';
import React from 'react';
import { type GetProp } from 'antd';
import { roles } from '../../types';
import { useStyle } from '../../types/chatCss';

interface MessageListProps {
  messages: Array<{
    id: string;
    message: string;
    status: 'loading' | 'local' | 'ai';
  }>;
  onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onPromptsItemClick }) => {
  const { styles } = useStyle();

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

  return (
    <Bubble.List
      items={items.length > 0 ? items : [{ content: placeholderNode, variant: 'borderless' }]}
      roles={roles}
      className={styles.messages}
    />
  );
};

export default MessageList;