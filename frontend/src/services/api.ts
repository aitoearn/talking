import axios, { AxiosInstance, AxiosResponse } from 'axios';

// 定义文件信息接口
export interface FileInfo {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  upload_time: string | Date;
  file_path: string;
}

// 定义上传响应接口
export interface UploadResponse {
  success: boolean;
  message: string;
  file_info: FileInfo;
}

// 定义文件列表响应接口
export interface FileListResponse {
  files: FileInfo[];
  total: number;
}

// 定义API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: 'https://u832381-a2e0-6601b403.westc.gpuhub.com:8443/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 文件上传API
export const fileAPI = {
  // 上传文件
  uploadFile: (formData: FormData): Promise<UploadResponse> => {
    return api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 获取文件列表
  getFileList: (): Promise<FileListResponse> => {
    return api.get('/api/files');
  },

  // 获取文件信息
  getFileInfo: (fileId: string): Promise<ApiResponse<FileInfo>> => {
    return api.get(`/api/files/${fileId}`);
  },

  // 下载文件
  downloadFile: (fileId: string): Promise<Blob> => {
    return api.get(`/api/download/${fileId}`, {
      responseType: 'blob',
    });
  },

  // 删除文件
  deleteFile: (fileId: string): Promise<ApiResponse> => {
    return api.delete(`/api/files/${fileId}`);
  },
};

// 系统API
export const systemAPI = {
  // 健康检查
  healthCheck: (): Promise<ApiResponse> => {
    return api.get('/health');
  },
};

export default api;