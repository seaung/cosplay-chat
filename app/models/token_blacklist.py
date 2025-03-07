from tortoise import fields, models


class TokenBlacklist(models.Model):
    """Token黑名单模型"""
    id = fields.UUIDField(pk=True)
    token = fields.CharField(max_length=500, unique=True, description="JWT token值")
    expires_at = fields.DatetimeField(description="token过期时间")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    user_id = fields.UUIDField(null=True, description="关联的用户ID")
    
    class Meta:
        table = "token_blacklist"
        description = "Token黑名单表"