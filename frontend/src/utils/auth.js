import api from '../api/axiosInstance';

export const logout = () => {
    api.post('accounts/logout/').finally(() => {
        localStorage.clear();
        sessionStorage.clear();

        window.location.href = '/account/login';
        const currentPath = window.location.pathname + window.location.search;
        const loginUrl = `/account/login?redirect=${encodeURIComponent(currentPath)}`;

        window.location.replace(loginUrl);
    });
};