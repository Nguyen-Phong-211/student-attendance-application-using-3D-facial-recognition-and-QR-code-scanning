import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

const raw = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

const shouldSkip = (url = '') => {
    return (
        url.includes('accounts/login/') ||
        url.includes('accounts/logout/') ||
        url.includes('accounts/refresh-token/')
    );
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const resp = error.response;

        if (!resp) return Promise.reject(error);
        if (originalRequest._retry) return Promise.reject(error);
        if (shouldSkip(originalRequest.url)) return Promise.reject(error);

        // const onAuthPage = window.location.pathname.startsWith('/account/');

        if (resp.status === 401) {
            originalRequest._retry = true;

            try {
                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshPromise = raw.post('accounts/refresh-token/', {});
                }
                await refreshPromise;
                isRefreshing = false;
                refreshPromise = null;

                return api(originalRequest);
            } catch (e) {
                isRefreshing = false;
                refreshPromise = null;

                try {
                    await raw.post("accounts/logout/");
                } catch (_) {}

                window.dispatchEvent(new CustomEvent("session-expired"));

                // if (onAuthPage) {
                //     return Promise.reject(e);
                // }

                // try { await raw.post('accounts/logout/', {}); } catch (_) { }
                // window.location.replace(`/account/login/${randomId}?session=expired`);
                return Promise.reject(e);
            }
        }

        return Promise.reject(error);
    }
);

export const logout = async () => {
    try {
        await raw.post('accounts/logout/', {});
    } catch (err) {
        console.error('Logout error:', err);
    } finally {
        localStorage.clear();
        sessionStorage.clear();
    }
};

export default api;