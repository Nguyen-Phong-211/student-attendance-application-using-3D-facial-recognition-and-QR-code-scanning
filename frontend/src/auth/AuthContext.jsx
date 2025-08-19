import React, { createContext, useContext, useEffect, useState } from "react";
import api, { logout as forceLogout } from "../api/axiosInstance";

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    const fetchMe = async () => {
        try {
            const res = await api.get("accounts/me/");
            setUser(res.data);
        } catch (err) {
            setUser(null);
        } finally {
            setInitializing(false);
        }
    };

    useEffect(() => {
        const path = window.location.pathname;

        const isAuthPage =
            path.startsWith("/account/login") ||
            path.startsWith("/account/signup") ||
            path.startsWith("/account/forgot");

        if (isAuthPage) {
            setInitializing(false);
            return;
        }

        fetchMe();
    }, []);

    const login = async (payload) => {
        try {
            const res = await api.post("accounts/login/", payload, { withCredentials: true });
            await fetchMe();
            const { user } = res.data;
            localStorage.setItem("user", JSON.stringify(user));
            return user;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await forceLogout();
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthCtx.Provider value={{ user, initializing, login, logout }}>
            {children}
        </AuthCtx.Provider>
    );
};

export const useAuth = () => useContext(AuthCtx);