import api from '../api/axiosInstance';

export const logout = () => {
    api.post('accounts/logout/').finally(() => {
        localStorage.clear();
        sessionStorage.clear();

        window.location.href = '/account/login';
    });
};