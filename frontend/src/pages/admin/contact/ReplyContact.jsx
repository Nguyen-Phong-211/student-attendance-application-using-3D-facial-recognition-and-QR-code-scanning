import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, Space, message, Form } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Sidebar from '../../../components/Layout/Sidebar';
import Navbar from '../../../components/Layout/Navbar';
import api from '../../../api/axiosInstance';
import FullScreenLoader from '../../../components/Spin/Spin';
import ModalContactDetail from '../../../components/Modal/ModalContactDetail';
import ModalReplyContact from '../../../components/Modal/ModalReplyContact';
import TableListContact from '../../../components/Table/ListContact';

const { Header } = Layout;

export default function ReplyContact() {
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [loadingReply, setLoadingReply] = useState(false);

    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [replyModalVisible, setReplyModalVisible] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [form] = Form.useForm();

    // Fetch contacts from API
    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await api.get('contacts/list/');
            setContacts(res.data);
        } catch (error) {
            message.error('Lấy danh sách liên hệ thất bại');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'ATTEND 3D - Phản hồi liên hệ';
        fetchContacts();
    }, []);

    // Search functionality
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Xóa
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const handleReplySubmit = async () => {
        setLoadingReply(true);
        try {
            const values = await form.validateFields();
            await api.post(`contacts/${selectedContact.contact_id}/reply/`, values);
            message.success('Phản hồi thành công');
            setReplyModalVisible(false);
            fetchContacts();
            setLoadingReply(false);
        } catch (error) {
            message.error('Phản hồi thất bại');
        } finally {
            setLoadingReply(false);
        }
    };

    console.log(selectedContact);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout>
                <Header className="bg-white px-4 flex justify-between items-center border-b">
                    <Navbar />
                </Header>
                <main className="mx-4 my-4 p-4 sm:p-6 bg-white rounded shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Phản hồi liên hệ</h1>
                        <Space>
                            <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={fetchContacts}
                            >
                                Làm mới
                            </Button>
                        </Space>
                    </div>

                    <TableListContact
                        contacts={contacts}
                        loading={loading}
                        setSelectedContact={setSelectedContact}
                        setDetailModalVisible={setDetailModalVisible}
                        setReplyModalVisible={setReplyModalVisible}
                        getColumnSearchProps={getColumnSearchProps}
                        form={form}
                    />

                    <ModalContactDetail
                        detailModalVisible={detailModalVisible}
                        setDetailModalVisible={setDetailModalVisible}
                        selectedContact={selectedContact}
                    />

                    <ModalReplyContact
                        replyModalVisible={replyModalVisible}
                        setReplyModalVisible={setReplyModalVisible}
                        handleReplySubmit={handleReplySubmit}
                        loadingReply={loadingReply}
                        form={form}
                    />
                </main>
            </Layout>
            <FullScreenLoader loading={loadingReply} />
        </Layout>
    );
}