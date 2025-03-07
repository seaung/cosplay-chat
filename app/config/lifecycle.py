from fastapi import FastAPI
from tortoise import Tortoise
from contextlib import asynccontextmanager


def init_lifecycle(app: FastAPI):
    """初始化应用程序生命周期管理

    Args:
        app: FastAPI应用实例
    """
    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        # 启动时初始化数据库连接
        await Tortoise.init(
            db_url="postgres://postgres:123456qazwsx@localhost:5432/cosplay_chat",
            modules={"models": [
                "app.models.message",
                "app.models.token_blacklist"
                ]
            }
        )
        await Tortoise.generate_schemas()
        print("数据库初始化完成")
        yield
        # 关闭时清理数据库连接
        await Tortoise.close_connections()
        print("数据库连接已关闭")

    app.router.lifespan_context = lifespan