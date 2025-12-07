import React, { useState } from 'react';
import { Upload, Button, message, Progress, Card, Typography } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { fileAPI, FileInfo, UploadResponse } from '../services/api';

const { Dragger } = Upload;
const { Title, Text } = Typography;

interface FileUploadProps {
  onFileUploaded: (file: FileInfo) => void;
  fileList: FileInfo[];
  onFileDeleted: (fileId: string) => void;
  loading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUploaded, 
  fileList, 
  onFileDeleted, 
  loading 
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);

  // 处理文件上传
  const handleUpload: UploadProps['beforeUpload'] = (file) => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    fileAPI.uploadFile(formData)
      .then((response: UploadResponse) => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        message.success('文件上传成功！');
        // 使用正确的文件信息结构
        onFileUploaded(response.file_info);
        setUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      })
      .catch((error) => {
        clearInterval(progressInterval);
        message.error(`文件上传失败: ${error.message || '未知错误'}`);
        setUploading(false);
        setUploadProgress(0);
      });

    return false; // 阻止默认上传行为
  };

  // 删除文件
  const handleDelete = (fileId: string): void => {
    fileAPI.deleteFile(fileId)
      .then(() => {
        message.success('文件删除成功！');
        onFileDeleted(fileId);
      })
      .catch((error) => {
        message.error(`文件删除失败: ${error.message || '未知错误'}`);
      });
  };

  // 下载文件
  const handleDownload = (fileId: string, fileName: string): void => {
    fileAPI.downloadFile(fileId)
      .then((response) => {
        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        message.error(`文件下载失败: ${error.message || '未知错误'}`);
      });
  };

  // 预览文件
  const handlePreview = (file: FileInfo): void => {
    if (file.content_type && file.content_type.startsWith('image/')) {
      // 如果是图片，直接预览
      fileAPI.downloadFile(file.id)
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response]));
          window.open(url, '_blank');
        })
        .catch((error) => {
          message.error(`文件预览失败: ${error.message || '未知错误'}`);
        });
    } else {
      // 其他文件类型提示下载
      message.info('此文件类型不支持预览，请下载后查看');
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatDate = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleString();
  };

  return (
    <div className="file-upload-container">
      <Card title="文件上传" className="upload-card">
        <Dragger
          name="file"
          multiple={false}
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个文件上传。严格禁止上传公司数据或其他敏感文件。
          </p>
        </Dragger>

        {uploading && (
          <div className="progress-container">
            <Progress percent={uploadProgress} status="active" />
          </div>
        )}
      </Card>

      <Card title="文件列表" className="file-list-card" loading={loading}>
        {fileList && fileList.length > 0 ? (
          <div className="file-list">
            {fileList.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  <Title level={5}>{file.filename || '未知文件名'}</Title>
                  <Text type="secondary">
                    大小: {formatFileSize(file.size || 0)} | 
                    类型: {file.content_type || '未知类型'} | 
                    上传时间: {formatDate(file.upload_time || new Date().toISOString())}
                  </Text>
                </div>
                <div className="file-actions">
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(file)}
                    title="预览"
                  />
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(file.id, file.filename || 'download')}
                    title="下载"
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(file.id)}
                    title="删除"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Text type="secondary">暂无文件，请上传文件</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FileUpload;