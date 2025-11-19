import { Breadcrumb } from 'antd';
import { HomeOutlined, PhoneOutlined } from '@ant-design/icons';

const BreadcrumbContact = ({ t }) => {
    return (
        <Breadcrumb
            items={[
                { href: "/", title: <><HomeOutlined /> <span>{t("home")}</span></> },
                {
                    href: "/contact",
                    title: (
                        <>
                            <PhoneOutlined /> <span>{t("contact")}</span>
                        </>
                    ),
                },
            ]}
        />
    );
};

export default BreadcrumbContact; 