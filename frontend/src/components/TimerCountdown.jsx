import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

const TimerCountdown = ({ end }) => {
    const [timeLeft, setTimeLeft] = useState(end.diff(dayjs(), "second"));

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(end.diff(dayjs(), "second"));
        }, 1000);

        return () => clearInterval(interval);
    }, [end, timeLeft]);

    if (timeLeft <= 0) {
        return <span style={{ color: "red", fontWeight: 600 }}>Hết giờ điểm danh</span>;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <span style={{ color: "green", fontWeight: 600 }}>
            Còn lại: {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
    );
};

export default TimerCountdown;