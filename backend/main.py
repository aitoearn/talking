from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import files

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    version="1.0.0",
    description="一个简单的文件上传API服务"
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由
app.include_router(files.router, prefix="/api", tags=["文件"])


@app.get("/")
async def root():
    return {"message": "欢迎使用FastAPI文件上传服务", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "健康"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.debug)