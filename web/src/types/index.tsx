import { type GetProp } from "antd";
import { Bubble } from "@ant-design/x";

import { UserOutlined } from '@ant-design/icons';

const fooAvatar: React.CSSProperties = {
  color: '#f56a00',
  backgroundColor: '#fde3cf',
};

const barAvatar: React.CSSProperties = {
  color: '#fff',
  backgroundColor: '#87d068',
};

export const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    avatar: {icon: <UserOutlined/>, style: fooAvatar},
    typing: { step: 15, interval: 50 },
    styles: {
      content: {
        borderRadius: 16,
      },
    },
  },
  local: {
    placement: 'end',
    avatar: {icon: <UserOutlined/>, style: barAvatar},
    styles: {
      content: {
        borderRadius: 16,
      },
    },
    variant: 'shadow',
  },
};