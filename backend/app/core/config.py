from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    app_name: str = "FastAPI 文件上传服务"
    debug: bool = True
    upload_dir: Path = Path("./uploads")
    max_file_size: int = 10485760  # 10MB
    
    class Config:
        env_file = ".env"


settings = Settings()