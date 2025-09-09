import axios from "axios";

// ====================
// axios configuration
// ====================
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

const raw = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

// ====================
// Helpers
// ====================

// URLs that bypass interceptors
const shouldSkip = (url = "") => {
    return (
        url.includes("accounts/login/") ||
        url.includes("accounts/logout/") ||
        url.includes("accounts/refresh-token/")
    );
};

// Force delete cookies (even if the server can't)
const clearAuthCookies = () => {
    document.cookie =
        "access_token=; Path=/;";
    document.cookie =
        "refresh_token=; Path=/;";
};

// Logout
export const logout = async (force = false) => {
    try {
        if (!force) {
            await raw.post("accounts/logout/");
        }
    } catch (err) {
        console.error("Logout error:", err);
    } finally {
        clearAuthCookies();
        localStorage.clear();
        sessionStorage.clear();

        const currentPath = window.location.pathname + window.location.search;
        const loginUrl = `/account/login?next=${encodeURIComponent(currentPath)}`;

        window.location.replace(loginUrl);
    }
};

// ====================
// Interceptor handles 401
// ====================
let isRefreshing = false;
let refreshPromise = null;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const resp = error.response;

        if (!resp) return Promise.reject(error);
        if (originalRequest._retry) return Promise.reject(error);
        if (shouldSkip(originalRequest.url)) return Promise.reject(error);

        if (resp.status === 401) {
            originalRequest._retry = true;

            try {
                // Refresh only once for multiple requests
                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshPromise = raw.post("accounts/refresh-token/", {});
                }

                await refreshPromise;
                isRefreshing = false;
                refreshPromise = null;

                return api(originalRequest);
            } catch (e) {
                isRefreshing = false;
                refreshPromise = null;

                // refresh fail → logout always
                await logout();

                // notify other components
                window.dispatchEvent(new CustomEvent("session-expired"));

                return Promise.reject(e);
            }
        }

        return Promise.reject(error);
    }
);

export default api;