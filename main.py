import os
import signal
import sys
import logging
from app import create_app

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建应用
app = create_app()

# 信号处理函数
def handle_exit_signal(signum, frame):
    signame = signal.Signals(signum).name
    logger.info(f"收到信号 {signame}，正在优雅退出...")
    # 系统退出前的清理工作会由FastAPI的lifespan上下文管理器处理
    sys.exit(0)

# 注册信号处理器
signal.signal(signal.SIGINT, handle_exit_signal)  # Ctrl+C
signal.signal(signal.SIGTERM, handle_exit_signal)  # kill

if __name__ == "__main__":
    import uvicorn
    # 使用reload=True启用自动重载功能
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=9527,
        reload=True,  # 启用自动重载
        reload_dirs=["app"],  # 监视app目录的变化
        log_level="info"
    )