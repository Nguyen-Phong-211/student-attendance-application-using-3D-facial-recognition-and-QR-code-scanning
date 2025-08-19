import React, { useState, useRef } from "react";
import { Input, Space } from "antd";

const OtpInput = ({ length = 6, onComplete }) => {
    const [otp, setOtp] = useState(Array(length).fill(""));
    const inputsRef = useRef([]);

    const handleChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }

        if (newOtp.every((digit) => digit !== "")) {
            onComplete?.(newOtp.join(""));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    return (
        <Space size={8} wrap>
            {otp.map((digit, index) => (
                <Input
                    key={index}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputsRef.current[index] = el)}
                    style={{
                        width: 44,
                        height: 48,
                        textAlign: "center",
                        fontSize: 22,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        boxShadow: "none",
                    }}
                />
            ))}
        </Space>
    );
};

export default OtpInput;