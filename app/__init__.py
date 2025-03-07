from fastapi import FastAPI
from app.config.database import init_db
from app.config.lifecycle import init_lifecycle


def create_app() -> FastAPI:
    app = FastAPI()
    from app.api import chat_api, user_api
    app.include_router(router=chat_api.chat_api, prefix="/api")
    app.include_router(router=user_api.user_api, prefix="/api")

    # 初始化数据库
    init_db(app)
    
    # 初始化生命周期管理
    init_lifecycle(app)
    
    return app
