import React from "react";

const LoginFooterLinks = ({ randomId }) => (
    <>
        <div className="text-right mb-4">
            <a
                href={`/account/forgot-password/${randomId}`}
                className="text-blue-600 hover:underline text-sm"
            >
                Quên mật khẩu?
            </a>
        </div>
    </>
);

export default LoginFooterLinks;