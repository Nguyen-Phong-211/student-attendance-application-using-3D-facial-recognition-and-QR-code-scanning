import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen">
      <Result
        status="404"
        title="404"
        subTitle="Trang không tồn tại. Vui lòng quay lại trang chủ"
        extra={
          <Button type="primary" onClick={() => navigate('/')} size="large">
            Trở về
          </Button>
        }
      />
    </div>
  );
};

export default ErrorPage;