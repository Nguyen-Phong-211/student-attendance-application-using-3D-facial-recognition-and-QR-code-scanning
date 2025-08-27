import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';

const AvatarUpload = ({ value, onChange }) => {
    const [fileList, setFileList] = useState(value ? [{
        uid: '-1',
        name: value.name || 'avatar.png',
        status: 'done',
        url: value.url || URL.createObjectURL(value),
    }] : []);

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ được phép upload file hình ảnh!');
            return Upload.LIST_IGNORE;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Ảnh phải nhỏ hơn 2MB!');
            return Upload.LIST_IGNORE;
        }

        const newFile = {
            uid: file.uid || Date.now(),
            name: file.name,
            status: 'done',
            originFileObj: file,
            url: URL.createObjectURL(file),
        };

        setFileList([newFile]);
        onChange?.(file);
        return false;
    };

    return (
        <div style={{ marginBottom: 16 }}>
            <label>Ảnh đại diện (Tuỳ chọn):</label>
            <ImgCrop rotationSlider modalClassName='crop-modal'>
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onRemove={() => {
                        setFileList([]);
                        onChange?.(null);
                    }}
                    onPreview={async (file) => {
                        let src = file.url;
                        if (!src) {
                            src = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.readAsDataURL(file.originFileObj);
                                reader.onload = () => resolve(reader.result);
                            });
                        }
                        const image = new Image();
                        image.src = src;
                        const imgWindow = window.open(src);
                        imgWindow?.document.write(image.outerHTML);
                    }}
                    accept="image/*"
                    style={{ width: '100%', marginTop: 8 }}
                >
                    {fileList.length < 1 && (
                        <>
                            <CloudUploadOutlined style={{ fontSize: 24 }} />
                            <div>&nbsp; Tải ảnh đại diện </div>
                        </>
                    )}
                </Upload>
            </ImgCrop>
        </div>
    );
};

export default AvatarUpload;