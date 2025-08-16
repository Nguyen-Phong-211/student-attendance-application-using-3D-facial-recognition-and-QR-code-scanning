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
  LogoutOutlined
} from '@ant-design/icons';
import LogoFaceId from '../../assets/general/face-recognition.png';

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed, t }) => {
  const [selectedKey, setSelectedKey] = useState('1');

  useEffect(() => {
    const path = window.location.pathname;

    if (path.startsWith('/admin/dashboard')) setSelectedKey('1');
    else if (path.startsWith('/admin/notifications')) setSelectedKey('2');
    else if (path.startsWith('/admin/schedule')) setSelectedKey('3');

    else if (path.startsWith('/admin/management/student')) setSelectedKey('4-1');
    else if (path.startsWith('/admin/management/lecturer')) setSelectedKey('4-2');
    
    else if (path.startsWith('/admin/management/account')) setSelectedKey('5-1');
    else if (path.startsWith('/admin/management/role')) setSelectedKey('5-2');
    else if (path.startsWith('/admin/management/permission')) setSelectedKey('5-3');

    else if (path.startsWith('/admin/students/list')) setSelectedKey('6-1');
    else if (path.startsWith('/admin/students/assign-class')) setSelectedKey('6-2');
    else if (path.startsWith('/admin/students/assign-subject')) setSelectedKey('6-3');
    else if (path.startsWith('/admin/students/device')) setSelectedKey('6-4');

    else if (path.startsWith('/admin/lecturers/list')) setSelectedKey('7-1');
    else if (path.startsWith('/admin/lecturers/assign-class')) setSelectedKey('7-2');

    else if (path.startsWith('/admin/academics/classes')) setSelectedKey('8-1');
    else if (path.startsWith('/admin/academics/majors')) setSelectedKey('8-2');
    else if (path.startsWith('/admin/academics/departments')) setSelectedKey('8-3');
    else if (path.startsWith('/admin/academics/academic-years')) setSelectedKey('8-4');
    else if (path.startsWith('/admin/academics/subjects')) setSelectedKey('8-5');
    else if (path.startsWith('/admin/academics/rooms')) setSelectedKey('8-6');

    else if (path.startsWith('/admin/management/attendance/schedule')) setSelectedKey('9-1');
    else if (path.startsWith('/admin/management/attendance/attendance')) setSelectedKey('9-2');
    else if (path.startsWith('/admin/management/attendance/leave-requests')) setSelectedKey('9-3');
    else if (path.startsWith('/admin/management/log')) setSelectedKey('10');
    else if (path.startsWith('/admin/logout')) setSelectedKey('11');
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
        <a href='/admin/dashboard'>
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
            label: <a href="/admin/dashboard">Dashboard</a>,
          },
          {
            key: 'title-notification',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Thông báo</span>,
          },
          {
            key: '2',
            icon: <BellOutlined />,
            label: <a href='/admin/notifications'>Thông báo</a>,
          },
          {
            key: 'title-schedule',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Lịch học</span>,
          },
          {
            key: '3',
            icon: <CalendarOutlined />,
            label: <a href='/admin/schedule'>Lịch học</a>,
          },
          {
            key: 'account-management',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Quản lý tài khoản</span>,
          },
          {
            key: '4',
            icon: <ReconciliationOutlined />,
            label: 'Hồ sơ cá nhân',
            children: [
              { key: '4-1', label: (<a href='/admin/management/students'><i className="fa-solid fa-graduation-cap me-2"></i> Sinh viên</a>) },
              { key: '4-2', label: (<a href='/admin/management/lecturers'><i className="fa-solid fa-person-chalkboard me-2"></i> Giảng viên</a>) },
            ],
          },
          {
            key: '5',
            icon: <TeamOutlined />,
            label: 'Quản lý tài khoản',
            children: [
              { key: '5-1', label: (<a href='/admin/management/account'><i className="fa-regular fa-address-book me-2"></i> Người dùng</a>) },
              { key: '5-2', label: (<a href='/admin/management/role'><i className="fa-brands fa-square-font-awesome-stroke me-2"></i> Vai trò</a>) },
              { key: '5-3', label: (<a href='/admin/management/permission'><i className="fa-solid fa-drum me-2"></i> Phân quyền</a>) },
            ],
          },
          {
            key: 'title-management-student',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Quản lý sinh viên</span>,
          },
          {
            key: '6',
            icon: <SafetyOutlined />,
            label: 'Quản lý sinh viên',
            children: [
              { key: '6-1', label: (<a href='/admin/students/list'><i className="fa-solid fa-list me-2"></i> Danh sách sinh viên</a>) },
              { key: '6-2', label: (<a href='/admin/students/assign-class'><i className="fa-brands fa-atlassian me-2"></i> Gán lớp học</a>) },
              { key: '6-3', label: (<a href='/admin/students/assign-subject'><i className="fa-regular fa-font-awesome me-2"></i> Gán môn học</a>) },
              { key: '6-4', label: (<a href='/admin/students/device'><i className="fa-regular fa-hard-drive me-2"></i> Thiết bị điểm danh</a>) },
            ],
          },
          {
            key: 'title-management-lecturer',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Quản lý giảng viên</span>,
          },
          {
            key: '7',
            icon: <FileTextOutlined />,
            label: 'Quản lý giảng viên',
            children: [
              { key: '7-1', label: (<a href='/admin/lecturers/list'><i className="fa-solid fa-book me-2"></i> Danh sách giảng viên</a>) },
              { key: '7-2', label: (<a href='/admin/lecturers/assign-class'><i className="fa-brands fa-google-scholar me-2"></i> Gán lớp học</a>) },
            ],
          },
          {
            key: 'title-academic-management',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Quản lý học vụ</span>,
          },
          {
            key: '8',
            icon: <SolutionOutlined />,
            label: 'Quản lý học vụ',
            children: [
              { key: '8-1', label: (<a href='/admin/academics/classes'><i className="fa-solid fa-whiskey-glass me-2"></i> Lớp học</a>) },
              { key: '8-2', label: (<a href='/admin/academics/majors'><i className="fa-regular fa-clipboard me-2"></i> Ngành học</a>) },
              { key: '8-3', label: (<a href='/admin/academics/departments'><i className="fa-brands fa-deploydog me-2"></i> Khoa/Viện</a>) },
              { key: '8-4', label: (<a href='/admin/academics/academic-years'><i className="fa-brands fa-nfc-symbol me-2"></i> Năm học</a>) },
              { key: '8-5', label: (<a href='/admin/academics/subjects'><i className="fa-brands fa-superpowers me-2"></i> Môn học</a>) },
              { key: '8-6', label: (<a href='/admin/academics/rooms'><i className="fa-brands fa-intercom me-2"></i>Phòng học</a>) },
            ],
          },
          {
            key: 'title-management-attendance',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Quản lý điểm danh</span>,
          },
          {
            key: '9',
            icon: <TagsOutlined />,
            label: 'Quản lý điểm danh',
            children: [
              { key: '9-1', label: (<a href='/admin/management/attendance/schedule'><i className="fa-brands fa-bandcamp me-2"></i> Lịch học</a>) },
              { key: '9-2', label: (<a href='/admin/management/attendance/attendance'><i className="fa-brands fa-creative-commons-by me-2"></i> Buổi điểm danh</a>) },
              { key: '9-3', label: (<a href='/admin/management/attendance/leave-requests'><i className="fa-brands fa-pagelines me-2"></i> Yêu cầu nghỉ phép</a>) },
            ],
          },
          {
            key: 'title-management-log',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Nhật ký hệ thống</span>,
          },
          {
            key: '10',
            icon: <SlidersOutlined />,
            label: (
              <a href='/admin/management/log'>Nhật ký hệ thống</a>
            )
          },
          {
            key: 'title-different-action',
            type: 'group',
            label: <span className="text-xs text-gray-500 uppercase tracking-wide">Khác</span>,
          },
          {
            key: '11',
            icon: <LogoutOutlined />,
            label: (
              <a href='/admin/logout'>Đăng xuất</a>
            )
          },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
