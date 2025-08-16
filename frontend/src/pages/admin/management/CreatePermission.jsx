import React, { useState, useEffect } from 'react';
import {
  Layout, Typography, Select, Collapse, Checkbox, Table, Button, message
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';

const { Header } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

export default function PermissionAssignment() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});

  const roles = ['Teacher', 'Student'];
  useEffect(() => {
    document.title = "ATTEND 3D - Create Permission";
  }, []);

  const modules = [
    {
      key: 'users',
      label: 'Người dùng',
      actions: ['view', 'create', 'edit', 'delete'],
      columns: ['name', 'email', 'phone', 'address'],
    },
    {
      key: 'classes',
      label: 'Lớp học',
      actions: ['view', 'edit', 'delete'],
      columns: ['class_name', 'start_date', 'teacher'],
    },
  ];

  const handleCheckboxChange = (moduleKey, type, key, checked) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [type]: {
          ...prev[moduleKey]?.[type],
          [key]: checked,
        },
      },
    }));
  };

  const handleActionChange = (moduleKey, action, checked) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [action]: checked,
      },
    }));
  };

  const savePermissions = () => {
    if (!selectedRole) {
      message.warning('Vui lòng chọn vai trò.');
      return;
    }

    console.log('Saving permissions for role:', selectedRole);
    console.log('Permissions:', permissions);

    message.success('Lưu phân quyền thành công!');
    // Gửi API: axios.post('/api/assign-permissions', { role: selectedRole, permissions });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header className="bg-white px-4 flex flex-col sm:flex-row justify-between items-center gap-4 py-3 border-b">
          <Navbar />
        </Header>

        <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
          <Title level={3}>Phân quyền chi tiết</Title>

          <div className="my-4">
            <span className="mr-2">Chọn vai trò:</span>
            <Select
              placeholder="Chọn vai trò"
              style={{ width: 200 }}
              onChange={(value) => setSelectedRole(value)}
              size='large'
            >
              {roles.map((role) => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </div>

          <Collapse accordion>
            {modules.map((mod) => (
              <Panel header={mod.label} key={mod.key}>
                <Title level={5}>Hành động</Title>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                  {mod.actions.map((action) => (
                    <Checkbox
                      key={action}
                      checked={permissions[mod.key]?.[action] || false}
                      onChange={(e) =>
                        handleActionChange(mod.key, action, e.target.checked)
                      }
                    >
                      {action.toUpperCase()}
                    </Checkbox>
                  ))}
                </div>

                <Title level={5}>Phân quyền theo cột</Title>
                <Table
                  pagination={false}
                  columns={[
                    {
                      title: 'Tên cột',
                      dataIndex: 'column',
                      key: 'column',
                    },
                    {
                      title: 'Cho phép xem',
                      dataIndex: 'permission',
                      key: 'permission',
                      render: (_, record) => (
                        <Checkbox
                          checked={
                            permissions[mod.key]?.columns?.[record.column] || false
                          }
                          onChange={(e) =>
                            handleCheckboxChange(mod.key, 'columns', record.column, e.target.checked)
                          }
                        />
                      ),
                    },
                  ]}
                  dataSource={mod.columns.map((col) => ({ key: col, column: col }))}
                  size="small"
                />
              </Panel>
            ))}
          </Collapse>

          <div className="mt-6">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={savePermissions}
              disabled={!selectedRole}
              size='large'
            >
              Lưu phân quyền
            </Button>
          </div>
        </main>
      </Layout>
    </Layout>
  );
}
