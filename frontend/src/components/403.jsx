import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { getRoleAccountId } from '../utils/auth';

export default function Error403() {
    const navigate = useNavigate();
    const userRole = getRoleAccountId();

    if (userRole === "admin") {
        return (
            <div className="flex items-center justify-center h-screen">
                <Result
                    status="403"
                    title="403"
                    subTitle="Bạn không có quyền truy cập trang này"
                    extra={<Button type="primary" size="large" onClick={() => navigate("/admin/dashboard")}>Về trang chủ</Button>}
                />
            </div>
        );
    } else if (userRole === "lecturer") {
        return (
            <div className="flex items-center justify-center h-screen">
                <Result
                    status="403"
                    title="403"
                    subTitle="Bạn không có quyền truy cập trang này"
                    extra={<Button type="primary" size="large" onClick={() => navigate("/lecturers/dashboard")}>Về trang chủ</Button>}
                />
            </div>
        );
    } else if (userRole === "student") {
        return (
            <div className="flex items-center justify-center h-screen">
                <Result
                    status="403"
                    title="403"
                    subTitle="Bạn không có quyền truy cập trang này"
                    extra={<Button type="primary" size="large" onClick={() => navigate("/")}>Về trang chủ</Button>}
                />
            </div>
        );
    } else {
        return (
            <div className="flex items-center justify-center h-screen">
                <Result
                    status="404"
                    title="404"
                    subTitle="Trang không tồn tại. Vui lòng quay lại trang chủ"
                    extra={
                        <Button type="primary" onClick={() => navigate('/')} size="large">
                            Về trang chủ
                        </Button>
                    }
                />
            </div>
        );
    }
}