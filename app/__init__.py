from fastapi import FastAPI


def create_app() -> FastAPI:
    app = FastAPI()
    from app.api import chat_api
    app.include_router(router=chat_api.chat_api, prefix="/api")
    return app
