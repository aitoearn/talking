import { useState, useEffect } from 'react';
import { Layout, Typography, message } from 'antd';
import FileUpload from './components/FileUpload';
import { fileAPI, FileInfo } from './services/api';
import 'antd/dist/reset.css';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取文件列表
  const fetchFileList = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fileAPI.getFileList();
      setFileList(response.files);
    } catch (error: any) {
      message.error(`获取文件列表失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取文件列表
  useEffect(() => {
    fetchFileList();
  }, []);

  // 文件上传成功回调
  const handleFileUploaded = (file: FileInfo): void => {
    setFileList(prevList => [file, ...prevList]);
  };

  // 文件删除成功回调
  const handleFileDeleted = (fileId: string): void => {
    setFileList(prevList => prevList.filter(file => file.id !== fileId));
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          FastAPI 文件上传系统
        </Title>
      </Header>
      <Content className="content">
        <div className="container">
          <FileUpload
            onFileUploaded={handleFileUploaded}
            fileList={fileList}
            onFileDeleted={handleFileDeleted}
            loading={loading}
          />
        </div>
      </Content>
    </Layout>
  );
}

export default App;