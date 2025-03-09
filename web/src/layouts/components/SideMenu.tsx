import { Conversations } from '@ant-design/x';
import React from 'react';
import { Button, type GetProp } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ChatLogo from './logo';
import { useStyle } from '../../types/chatCss';

interface SideMenuProps {
  conversationsItems: Array<{
    key: string;
    label: string;
  }>;
  activeKey: string;
  onAddConversation: () => void;
  onConversationClick: GetProp<typeof Conversations, 'onActiveChange'>;
}

const SideMenu: React.FC<SideMenuProps> = ({
  conversationsItems,
  activeKey,
  onAddConversation,
  onConversationClick,
}) => {
  const { styles } = useStyle();

  return (
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
  );
};

export default SideMenu;