# FastAPI 文件上传服务

一个基于FastAPI的简单文件上传API服务，支持文件上传、下载、列表查看和删除功能。

## 功能特性

- 文件上传
- 文件下载
- 文件列表查看
- 文件删除
- 文件大小限制
- CORS支持

## 安装与运行

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 复制环境配置文件：
```bash
cp .env.example .env
```

3. 根据需要修改`.env`文件中的配置。

4. 运行服务：
```bash
python main.py
```

或者使用uvicorn：
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API接口

### 1. 上传文件

**请求：**
```
POST /api/upload
Content-Type: multipart/form-data
```

**响应：**
```json
{
  "success": true,
  "message": "文件上传成功",
  "file_info": {
    "id": "文件ID",
    "filename": "原始文件名",
    "content_type": "文件类型",
    "size": 文件大小,
    "upload_time": "上传时间",
    "file_path": "文件路径"
  }
}
```

### 2. 获取文件列表

**请求：**
```
GET /api/files?skip=0&limit=100
```

**响应：**
```json
{
  "files": [
    {
      "id": "文件ID",
      "filename": "文件名",
      "content_type": "文件类型",
      "size": 文件大小,
      "upload_time": "上传时间",
      "file_path": "文件路径"
    }
  ],
  "total": 文件总数
}
```

### 3. 获取文件信息

**请求：**
```
GET /api/files/{file_id}
```

**响应：**
```json
{
  "id": "文件ID",
  "filename": "文件名",
  "content_type": "文件类型",
  "size": 文件大小,
  "upload_time": "上传时间",
  "file_path": "文件路径"
}
```

### 4. 下载文件

**请求：**
```
GET /api/download/{file_id}
```

**响应：**
返回文件内容

### 5. 删除文件

**请求：**
```
DELETE /api/files/{file_id}
```

**响应：**
```json
{
  "success": true,
  "message": "文件删除成功"
}
```

## 配置说明

在`.env`文件中可以配置以下参数：

- `DEBUG`: 是否开启调试模式
- `UPLOAD_DIR`: 文件上传目录，默认为`./uploads`
- `MAX_FILE_SIZE`: 最大文件大小（字节），默认为10MB

## 注意事项

1. 文件存储在服务器的本地文件系统中，重启服务后文件信息会丢失。
2. 在生产环境中，建议使用数据库存储文件信息，并考虑使用对象存储服务。
3. 当前实现没有实现用户认证，所有接口都是公开的。
4. 在生产环境中，应该限制CORS允许的源，而不是使用通配符`*`。