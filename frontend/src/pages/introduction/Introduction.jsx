import React, { useEffect } from "react";
import { Breadcrumb, Card, Table } from "antd";
import { HomeOutlined, TeamOutlined, ProjectOutlined } from "@ant-design/icons";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";

export default function AboutProjectPage() {
    useEffect(() => {
        document.title = "Giới thiệu dự án và thành viên - ATTEND 3D";
    }, []);

    const members = [
        {
            key: "1",
            name: "Nguyễn Nguyễn Phong",
            studentCode: "21070601",
            class: "DHHTTT17B",
            email: "phongnguyen.050503@gmail.com",
        },
        {
            key: "2",
            name: "Trần Thị Huyền Trang",
            studentCode: "21061001",
            class: "DHHTTT17B",
            email: "huyentrangqb2003@gmail.com",
        },
    ];

    const columns = [
        {
            title: "Họ và tên",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Mã số sinh viên",
            dataIndex: "studentCode",
            key: "studentCode",
        },
        {
            title: "Lớp",
            dataIndex: "class",
            key: "class",
        },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-800 flex flex-col">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
                <Header />
                <main className="mt-8 flex flex-col items-center w-full">
                    {/* Breadcrumb */}
                    <div className="w-full mb-4">
                        <Breadcrumb
                            items={[
                                {
                                    href: "/",
                                    title: (
                                        <>
                                            <HomeOutlined /> <span>Trang chủ</span>
                                        </>
                                    ),
                                },
                                {
                                    href: "/about",
                                    title: (
                                        <>
                                            <ProjectOutlined /> <span>Giới thiệu dự án</span>
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </div>
                    <div className="w-full mt-4">
                        <Card
                            className="rounded mb-6"
                            title={
                                <div className="flex items-center gap-2 text-lg">
                                    <ProjectOutlined /> Giới thiệu dự án
                                </div>
                            }
                        >
                            <p>
                                Dự án <strong>“Ứng dụng điểm danh sinh viên nhận diện khuôn mặt 3D 
                                và quét mã QR Code”</strong> được triển khai nhằm nâng cao hiệu quả 
                                và chính xác trong công tác điểm danh tại các trường đại học. 
                                Thông qua việc kết hợp công nghệ nhận diện khuôn mặt 3D với việc 
                                quét mã QR, ứng dụng giúp:
                            </p>
                            <ul className="list-disc ml-6">
                                <li>Đảm bảo kiểm soát chính xác sự hiện diện của sinh viên trong lớp học.</li>
                                <li>Tiết kiệm thời gian cho giảng viên và nhân viên quản lý.</li>
                                <li>Tích hợp báo cáo tự động về số lượng và tình trạng điểm danh.</li>
                                <li>Cung cấp dữ liệu đầy đủ cho việc quản lý lớp học, kiểm tra chuyên cần, 
                                    và phục vụ các mục đích thống kê giáo dục.</li>
                            </ul>
                            <p>
                                Hệ thống áp dụng thuật toán nhận diện khuôn mặt 3D tiên tiến để tăng 
                                độ chính xác, đồng thời đảm bảo an toàn dữ liệu cá nhân. Sinh viên 
                                cũng có thể điểm danh nhanh chóng bằng cách quét mã QR được cấp từ 
                                ứng dụng, giúp giảm thiểu sai sót và gian lận.
                            </p>
                            <p>
                                Dự án này hướng tới việc tối ưu hóa công tác quản lý lớp học trong 
                                môi trường đại học hiện đại, đồng thời kết hợp các công nghệ tiên tiến 
                                nhằm nâng cao trải nghiệm cho cả giảng viên và sinh viên.
                            </p>
                        </Card>
                    </div>
                    <div className="w-full mt-4">
                        <Card
                            className="rounded"
                            title={
                                <div className="flex items-center gap-2 text-lg">
                                    <TeamOutlined /> Thành viên dự án
                                </div>
                            }
                        >
                            <p>
                                Nhóm thực hiện dự án gồm các thành viên sau, đều là sinh viên ngành 
                                Công nghệ thông tin, có kinh nghiệm và hứng thú với các ứng dụng 
                                nhận diện khuôn mặt, xử lý hình ảnh, và phát triển phần mềm quản lý:
                            </p>
                            <Table
                                columns={columns}
                                dataSource={members}
                                pagination={false}
                                bordered
                                className="mt-4"
                            />
                            <p className="mt-4">
                                Các thành viên chịu trách nhiệm phân chia công việc rõ ràng, bao gồm:
                            </p>
                            <ul className="list-disc ml-6">
                                <li>Đang hoàn thiện</li>
                            </ul>
                            <p className="mt-4">
                                Mỗi thành viên đều góp phần quan trọng vào việc hoàn thiện dự án, đảm bảo 
                                sản phẩm cuối cùng đạt chất lượng cao, dễ sử dụng và phù hợp với nhu cầu thực tế.
                            </p>
                        </Card>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}