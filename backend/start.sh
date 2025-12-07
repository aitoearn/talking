#!/bin/bash

# FastAPI 文件上传服务启动脚本

echo "正在启动 FastAPI 文件上传服务..."

# 检查Python环境
if ! command -v python &> /dev/null; then
    echo "错误: 未找到 Python，请先安装 Python"
    exit 1
fi

# 检查依赖是否已安装
echo "检查依赖..."
pip install -q -r requirements.txt

# 启动服务
echo "启动服务..."
python main.py