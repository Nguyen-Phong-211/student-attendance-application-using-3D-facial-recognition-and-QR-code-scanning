import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokensAndRedirect } from '../utils/auth';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(config => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    res => res,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) throw new Error("No refresh token");

                const response = await axios.post(`${process.env.REACT_APP_API_URL}/token/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                setTokens({ access });

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                clearTokensAndRedirect();
            }
        }

        return Promise.reject(error);
    }
);

export default api;