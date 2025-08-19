import React from "react";
import loginImage from "../../assets/general/login.jpg";

const LoginImage = () => (
    <img
        src={loginImage}
        alt="Login illustration"
        className="w-[90%] h-[90%] object-contain"
    />
);

export default LoginImage;