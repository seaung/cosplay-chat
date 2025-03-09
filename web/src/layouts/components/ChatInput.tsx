import { Sender } from '@ant-design/x';
import React from 'react';
import { useStyle } from '../../types/chatCss';

interface ChatInputProps {
  content: string;
  headerOpen: boolean;
  isRequesting: boolean;
  onSubmit: (content: string) => void;
  onChange: (content: string) => void;
  onOpenChange: (open: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  content,
  headerOpen,
  isRequesting,
  onSubmit,
  onChange,
  onOpenChange,
}) => {
  const { styles } = useStyle();

  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={headerOpen}
      onOpenChange={onOpenChange}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
    </Sender.Header>
  );

  return (
    <Sender
      value={content}
      header={senderHeader}
      onSubmit={onSubmit}
      onChange={onChange}
      loading={isRequesting}
      className={styles.sender}
    />
  );
};

export default ChatInput;