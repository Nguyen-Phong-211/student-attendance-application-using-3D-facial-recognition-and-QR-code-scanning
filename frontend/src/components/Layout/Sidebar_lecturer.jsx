import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  TagsOutlined,
  SolutionOutlined,
  BellOutlined,
  CalendarOutlined,
  ReconciliationOutlined,
  SafetyOutlined,
  SlidersOutlined,
  FileTextOutlined,
  LogoutOutlined,
  FileDoneOutlined,
  CustomerServiceOutlined,
  WarningOutlined
} from '@ant-design/icons';
import LogoFaceId from '../../assets/general/face-recognition.png';

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed, t }) => {
  const [selectedKey, setSelectedKey] = useState('1');

  useEffect(() => {
    const path = window.location.pathname;

    if (path.startsWith('/lecturers/dashboard')) setSelectedKey('1');
    else if (path.startsWith('/lecturers/notifications')) setSelectedKey('2');
    else if (path.startsWith('/lecturers/Teachingschedule')) setSelectedKey('3');

    else if (path.startsWith('/lecturers/QRCodeList')) setSelectedKey('4-1');
    else if (path.startsWith('/lecturers/QRCodeCreate')) setSelectedKey('4-1-1');

    else if (path.startsWith('/lecturers/logout')) setSelectedKey('5');
    else setSelectedKey('');
  }, []);
  
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      collapsedWidth={80}
      className="bg-white border-r"
    >
      <div className="flex items-center justify-center p-4">
        <a href='/lecturers/dashboard'>
          <img src={LogoFaceId} alt="Logo" className="w-8 h-8 object-contain" />
        </a>
      </div>

      <Menu
        selectedKeys={[selectedKey]}
        mode="inline"
        items={[
          {
            key: '1',
            icon: <DashboardOutlined />,
            label: <a href="/lecturers/dashboard">Dashboard</a>,
          },
          {
            key: 'title-notification',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Thông báo</span>,
          },
          {
            key: '2',
            icon: <BellOutlined />,
            label: <a href='/lecturers/notifications'>Thông báo</a>,
          },
          {
            key: 'title-schedule',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Lịch học</span>,
          },
          {
            key: '3',
            icon: <CalendarOutlined />,
            label: <a href='/lecturers/lecturerschedule'>Lịch dạy</a>,
          },
          // {
          //   key: 'account-management',
          //   type: 'group',
          //   label: <span className="text-xs text-gray-500 uppercase tracking-wide">Quản lý mã QR</span>,
          // },
          // {
          //   key: '4',
          //   icon: <ReconciliationOutlined />,
          //   label: <a href='/lecturers/QRCodeList'>Danh sách mã QR</a>,
          // },
          {
            key: 'account-management',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Quản lý điểm danh</span>,
          },
          {
            key: '5',
            icon: <ReconciliationOutlined />,
            label: <a href='/lecturers/ClassList'>Danh sách lớp học</a>,
          },
           
          {
            key: '6',
            icon: <FileDoneOutlined />,
            label: <a href='/lecturers/Leaveapproval'>Duyệt đơn nghỉ phép</a>,
          },
          {
            key: 'account-management',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Góp ý & Hỗ trợ</span>,
          },
          {
            key: '7',
            icon: <CustomerServiceOutlined />,
            label: <a href='/lecturers/Contactfeedback'>Phản hồi liên hệ</a>,
          },
          {
            key: '8',
            icon: <WarningOutlined />,
            label: <a href='/lecturers/Reportproblem'>Báo cáo sự cố</a>,
          },
          {
            key: '11',
            icon: <LogoutOutlined />,
            label: (
              <a href='/lecturers/logout'>Đăng xuất</a>
            )
          },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
