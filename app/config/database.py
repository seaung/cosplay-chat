from tortoise.contrib.fastapi import register_tortoise


def init_db(app):
    """初始化数据库配置

    Args:
        app: FastAPI应用实例
    """
    register_tortoise(
        app,
        db_url="postgres://postgres:123456qazwsx@localhost:5432/cosplay_chat",
        modules={"models": [
            "app.models.message", 
            "app.models.token_blacklist"
            ]
        },
        generate_schemas=True,
        add_exception_handlers=True,
    )