from tortoise import fields, models
from datetime import datetime


class User(models.Model):
    """用户模型"""
    id = fields.UUIDField(pk=True)
    username = fields.CharField(max_length=50, unique=True, description="用户名")
    password = fields.CharField(max_length=128, description="密码哈希")
    email = fields.CharField(max_length=255, unique=True, null=True, description="邮箱")
    avatar = fields.CharField(max_length=255, null=True, description="头像URL")
    is_active = fields.BooleanField(default=True, description="是否激活")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")
    
    class Meta:
        table = "users"
        description = "用户表"


class Conversation(models.Model):
    """会话模型"""
    id = fields.UUIDField(pk=True)
    title = fields.CharField(max_length=255, description="会话标题")
    user = fields.ForeignKeyField(
        'models.User',
        related_name='conversations',
        description="关联的用户"
    )
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")

    class Meta:
        table = "conversations"
        description = "聊天会话表"


class Message(models.Model):
    """消息模型"""
    id = fields.UUIDField(pk=True)
    conversation = fields.ForeignKeyField(
        'models.Conversation',
        related_name='messages',
        description="关联的会话"
    )
    role = fields.CharField(max_length=10, description="消息角色：user/assistant")
    content = fields.TextField(description="消息内容")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")

    class Meta:
        table = "messages"
        description = "聊天消息表"