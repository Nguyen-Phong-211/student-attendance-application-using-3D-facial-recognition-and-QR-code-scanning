import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getRoleAccountId } from '../utils/auth';

export default function ErrorPage() {
  const navigate = useNavigate();
  const userRole = getRoleAccountId();

  const rolePaths = {
    admin: '/admin/dashboard',
    lecturer: '/lecturers/dashboard',
    student: '/',
    guest: '/', 
  };

  const handleGoHome = () => {
    const path = rolePaths[userRole] || '/';
    navigate(path);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Result
        status="404"
        title="404"
        subTitle="Trang không tồn tại. Vui lòng quay lại trang chủ"
        extra={
          <Button type="primary" onClick={handleGoHome} size="large">
            Trở về
          </Button>
        }
      />
    </div>
  );
}
