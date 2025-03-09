import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../store/modules/users';

const { Title } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
}

const useStyles = createStyles(({ token, css }) => {
  return {
    loginContainer: css`
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: ${token.colorBgContainer};
    `,
    loginCard: css`
      width: 400px;
      border-radius: ${token.borderRadiusLG}px;
      box-shadow: ${token.boxShadow};
    `,
    loginHeader: css`
      text-align: center;
      margin-bottom: 24px;
    `,
    loginForm: css`
      max-width: 350px;
      margin: 0 auto;
    `,
    loginButton: css`
      width: 100%;
      height: 40px;
      margin-top: 16px;
      border-radius: ${token.borderRadius}px;
    `,
    loginFooter: css`
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
    `,
  };
});

const Login: React.FC = () => {
  const { styles } = useStyles();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);
      
      const response = await fetch('/api/user/login', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '登录失败');
      }
      
      const data = await response.json();
      
      // 使用Redux存储用户信息
      dispatch(setUserInfo({
        token: data.access_token,
        uuid: data.user_id || 0,
        email: data.email || '',
        nickname: data.username || ''
      }));
      
      // 登录成功提示
      message.success('登录成功');
      
      // 跳转到主页
      window.location.href = '/';
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('登录失败，请稍后再试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard} bordered={false}>
        <div className={styles.loginHeader}>
          <Title level={2}>Cosplay-Chat</Title>
          <Title level={4} type="secondary">登录您的账户</Title>
        </div>
        
        <Form
          name="login"
          className={styles.loginForm}
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item>
            <div className={styles.loginFooter}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              
              <a href="#">忘记密码?</a>
            </div>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className={styles.loginButton}
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;