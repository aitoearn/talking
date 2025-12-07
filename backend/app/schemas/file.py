from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FileInfo(BaseModel):
    """文件信息模型"""
    id: str
    filename: str
    content_type: str
    size: int
    upload_time: datetime
    file_path: str


class UploadResponse(BaseModel):
    """上传响应模型"""
    success: bool
    message: str
    file_info: Optional[FileInfo] = None


class FileListResponse(BaseModel):
    """文件列表响应模型"""
    files: List[FileInfo]
    total: int