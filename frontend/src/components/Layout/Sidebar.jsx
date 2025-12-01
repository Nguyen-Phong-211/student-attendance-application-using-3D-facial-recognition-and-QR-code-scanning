import React, { useEffect, useState } from 'react';
import { Layout, Menu, Modal, message } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
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
  WarningOutlined,
  ContactsOutlined,
  // FileExcelOutlined
} from '@ant-design/icons';
import LogoFaceId from '../../assets/general/face-recognition.png';
import api from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { getRoleAccountId } from '../../utils/auth';


const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed, t }) => {
  const [selectedKey, setSelectedKey] = useState('1');
  const navigate = useNavigate();
  useEffect(() => {
    const path = window.location.pathname;

    if (path.startsWith('/admin/dashboard')) setSelectedKey('1');
    else if (path.startsWith('/admin/notifications')) setSelectedKey('2');
    else if (path.startsWith('/admin/schedule')) setSelectedKey('3');

    else if (path.startsWith('/admin/management/students')) setSelectedKey('4-1');
    else if (path.startsWith('/admin/management/students/create')) setSelectedKey('4-1-1');

    else if (path.startsWith('/admin/management/lecturers')) setSelectedKey('4-2');
    else if (path.startsWith('/admin/management/lecturers')) setSelectedKey('4-2-1');

    else if (path.startsWith('/admin/management/account')) setSelectedKey('5-1');
    else if (path.startsWith('/admin/management/role')) setSelectedKey('5-2');
    else if (path.startsWith('/admin/management/permission')) setSelectedKey('5-3');

    else if (path.startsWith('/admin/students/list')) setSelectedKey('6-1');
    else if (path.startsWith('/admin/students/list/create')) setSelectedKey('6-1-1');
    else if (path.startsWith('/admin/students/assign-class')) setSelectedKey('6-2');
    else if (path.startsWith('/admin/students/assign-subject')) setSelectedKey('6-3');
    else if (path.startsWith('/admin/students/device')) setSelectedKey('6-4');
    else if (path.startsWith('/admin/students/approve/list')) setSelectedKey('6-5');

    else if (path.startsWith('/admin/lecturers/list')) setSelectedKey('7-1');
    else if (path.startsWith('/admin/lecturers/assign-class')) setSelectedKey('7-2');

    else if (path.startsWith('/admin/academics/classes')) setSelectedKey('8-1');
    else if (path.startsWith('/admin/academics/majors')) setSelectedKey('8-2');
    else if (path.startsWith('/admin/academics/departments')) setSelectedKey('8-3');
    else if (path.startsWith('/admin/academics/academic-years')) setSelectedKey('8-4');
    else if (path.startsWith('/admin/academics/subjects')) setSelectedKey('8-5');
    else if (path.startsWith('/admin/academics/rooms')) setSelectedKey('8-6');

    else if (path.startsWith('/admin/contact/reply')) setSelectedKey('9');
    else if (path.startsWith('/admin/management/log')) setSelectedKey('10');
    else if (path.startsWith('/admin/logout')) setSelectedKey('11');

    else if (path.startsWith('/lecturers/dashboard')) setSelectedKey('L1');
    else if (path.startsWith('/lecturers/notifications')) setSelectedKey('L3');
    else if (path.startsWith('/lecturers/schedule')) setSelectedKey('L5');
    else if (path.startsWith('/lecturers/management/attendance')) setSelectedKey('L7');
    else if (path.startsWith('/lecturers/leave/approval')) setSelectedKey('L8');
    else if (path.startsWith('/lecturers/contact/reply')) setSelectedKey('L9-1');
    else if (path.startsWith('/lecturers/reportproblem')) setSelectedKey('L9-2');
    else if (path.startsWith('/lecturers/logout')) setSelectedKey('L10');
    //  else if (path.startsWith('/lecturers/attendance/export')) setSelectedKey('L11');

    else setSelectedKey('');
  }, []);

  const handleLogout = () => {
    Modal.confirm({
      title: "Xác nhận đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất không?",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.post("/accounts/logout/", {}, { withCredentials: true });
          message.success("Đăng xuất thành công");
          navigate("/account/login");
        } catch (err) {
          message.error("Có lỗi khi đăng xuất");
        }
      },
    });
  };

  const adminMenu = [
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
      label: <a href='/admin/schedule'>Quản lý lịch học</a>,
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
        { key: '5-2', label: (<a href='https://api-attend3d.onrender.com/admin' target='_blank' rel="noopener noreferrer"><i className="fa-brands fa-square-font-awesome-stroke me-2"></i> Vai trò và phân quyền</a>) },
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
      key: 'title-management-contact',
      type: 'group',
      label: <span className="text-xs text-gray-500 uppercase tracking-wide">Liên hệ</span>,
    },
    {
      key: '9',
      icon: <ContactsOutlined />,
      label: (
        <a href='/admin/contact/reply'>Phản hồi liên hệ</a>
      )
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
      icon: <LogoutOutlined className='text-red-500' />,
      label: (
        <span
          onClick={handleLogout}
          className='text-red-500 cursor-pointer font-bold'
        >
          Đăng xuất
        </span>
      )
    },
  ];

  const lecturerMenu = [
    {
      key: 'L1',
      icon: <DashboardOutlined />,
      label: <a href="/lecturers/dashboard">Dashboard</a>,
    },
    {
      key: 'L2',
      type: 'group',
      label: <span className="text-xs text-gray-500 uppercase tracking-wide">Thông báo</span>,
    },
    {
      key: 'L3',
      icon: <BellOutlined />,
      label: <a href='/lecturers/notifications'>Thông báo</a>,
    },
    {
      key: 'L4',
      type: 'group',
      label: <span className="text-xs text-gray-500 uppercase tracking-wide">Lịch dạy</span>,
    },
    {
      key: 'L5',
      icon: <CalendarOutlined />,
      label: <a href='/lecturers/schedule'>Lịch dạy</a>,
    },
    {
      key: 'L6',
      type: 'group',
      label: <span className="text-xs text-gray-500 uppercase tracking-wide">Quản lý chung</span>,
    },
    {
      key: 'L7',
      icon: <ReconciliationOutlined />,
      label: <a href='/lecturers/management/attendance'>Điểm danh sinh viên</a>,
    },
    // {
    //   key: 'L11',
    //   icon: <FileExcelOutlined />,
    //   label: <a href='/lecturers/attendance/export'>Xuất file điểm danh</a>,
    // },
    {
      key: 'L8',
      icon: <FileDoneOutlined />,
      label: <a href='/lecturers/leave/approval'>Duyệt đơn nghỉ phép</a>,
    },
    {
      key: 'L9',
      type: 'group',
      label: <span className="text-xs text-gray-500 uppercase tracking-wide">Góp ý & Hỗ trợ</span>,
    },
    {
      key: 'L9-1',
      icon: <CustomerServiceOutlined />,
      label: <a href='/lecturers/contact/reply'>Phản hồi liên hệ</a>,
    },
    {
      key: 'L9-2',
      icon: <WarningOutlined />,
      label: <a href='https://forms.gle/gGpU86suRuBfNd459' target="_blank" rel="noopener noreferrer">Báo cáo sự cố</a>,
    },
    {
      key: 'L10',
      icon: <LogoutOutlined className='text-red-500' />,
      label: (
        <span
          onClick={handleLogout}
          className='text-red-500 cursor-pointer font-bold'
        >
          Đăng xuất
        </span>
      )
    },
  ];

  const role = getRoleAccountId(); // 'lecturer' | 'admin'

  const menuItems = role === 'lecturer' ? lecturerMenu : adminMenu;

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
        items={menuItems}
      />

    </Sider>
  );
};

export default Sidebar;