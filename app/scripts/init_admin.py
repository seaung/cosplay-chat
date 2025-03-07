import asyncio
import uuid
from tortoise import Tortoise
from passlib.context import CryptContext
from app.models.message import User

# 创建密码上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_admin():
    # 初始化数据库连接
    await Tortoise.init(
        db_url="postgres://postgres:123456qazwsx@localhost:5432/cosplay_chat",
        modules={"models": ["app.models.message"]}
    )

    # 检查是否已存在admin用户
    admin = await User.filter(username="admin").first()
    if not admin:
        # 创建默认管理员用户
        await User.create(
            id=uuid.uuid4(),
            username="admin",
            password=pwd_context.hash("admin123"),  # 使用CryptContext处理密码加密
            email="admin@example.com",
            is_active=True
        )
        print("默认管理员用户创建成功")
    else:
        print("管理员用户已存在")

    # 关闭数据库连接
    await Tortoise.close_connections()


if __name__ == "__main__":
    asyncio.run(init_admin())