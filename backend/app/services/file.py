import os
import uuid
import shutil
from pathlib import Path
from typing import List, Optional, Dict
from datetime import datetime
from fastapi import UploadFile, HTTPException
from app.core.config import settings
from app.schemas.file import FileInfo


class FileService:
    """文件服务类"""
    
    def __init__(self):
        # 确保上传目录存在
        self.upload_dir = settings.upload_dir
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
        # 使用字典模拟文件数据库
        self.files_db: Dict[str, FileInfo] = {}
    
    async def save_file(self, file: UploadFile) -> FileInfo:
        """保存上传的文件"""
        # 检查文件大小
        file.file.seek(0, 2)  # 移动到文件末尾
        file_size = file.file.tell()
        file.file.seek(0)  # 重置文件指针
        
        if file_size > settings.max_file_size:
            raise HTTPException(
                status_code=413,
                detail=f"文件大小超过限制 ({settings.max_file_size} 字节)"
            )
        
        # 生成唯一文件ID和文件名
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        unique_filename = f"{file_id}{file_extension}"
        file_path = self.upload_dir / unique_filename
        
        # 保存文件
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")
        
        # 创建文件信息
        file_info = FileInfo(
            id=file_id,
            filename=file.filename,
            content_type=file.content_type or "application/octet-stream",
            size=file_size,
            upload_time=datetime.now(),
            file_path=str(file_path)
        )
        
        # 保存到内存数据库
        self.files_db[file_id] = file_info
        
        return file_info
    
    def get_file_info(self, file_id: str) -> Optional[FileInfo]:
        """获取文件信息"""
        return self.files_db.get(file_id)
    
    def get_files_list(self, skip: int = 0, limit: int = 100) -> List[FileInfo]:
        """获取文件列表"""
        files = list(self.files_db.values())
        # 按上传时间倒序排序
        files.sort(key=lambda x: x.upload_time, reverse=True)
        return files[skip:skip+limit]
    
    def delete_file(self, file_id: str) -> bool:
        """删除文件"""
        file_info = self.get_file_info(file_id)
        if not file_info:
            return False
        
        # 删除物理文件
        try:
            os.remove(file_info.file_path)
        except Exception:
            pass  # 即使物理文件删除失败，也继续删除数据库记录
        
        # 从数据库中删除
        if file_id in self.files_db:
            del self.files_db[file_id]
            return True
        
        return False


# 创建全局文件服务实例
file_service = FileService()