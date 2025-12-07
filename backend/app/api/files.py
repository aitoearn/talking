from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from typing import List
from app.schemas.file import UploadResponse, FileListResponse, FileInfo
from app.services.file import file_service

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """上传文件"""
    try:
        file_info = await file_service.save_file(file)
        return UploadResponse(
            success=True,
            message="文件上传成功",
            file_info=file_info
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")


@router.get("/files", response_model=FileListResponse)
async def get_files_list(
    skip: int = Query(0, ge=0, description="跳过的文件数量"),
    limit: int = Query(100, ge=1, le=1000, description="返回的文件数量")
):
    """获取文件列表"""
    files = file_service.get_files_list(skip=skip, limit=limit)
    return FileListResponse(files=files, total=len(files))


@router.get("/files/{file_id}", response_model=FileInfo)
async def get_file_info(file_id: str):
    """获取文件信息"""
    file_info = file_service.get_file_info(file_id)
    if not file_info:
        raise HTTPException(status_code=404, detail="文件不存在")
    return file_info


@router.get("/download/{file_id}")
async def download_file(file_id: str):
    """下载文件"""
    file_info = file_service.get_file_info(file_id)
    if not file_info:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return FileResponse(
        path=file_info.file_path,
        filename=file_info.filename,
        media_type=file_info.content_type
    )


@router.delete("/files/{file_id}", response_model=dict)
async def delete_file(file_id: str):
    """删除文件"""
    success = file_service.delete_file(file_id)
    if not success:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return {"success": True, "message": "文件删除成功"}