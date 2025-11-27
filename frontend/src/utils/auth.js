import api from '../api/axiosInstance';

/**
 * Logout
 */
export const logout = () => {
    api.post('accounts/logout/').finally(() => {
        localStorage.clear();
        sessionStorage.clear();

        window.location.href = '/account/login';
        const currentPath = window.location.pathname + window.location.search;
        const loginUrl = `/account/login?next=${encodeURIComponent(currentPath)}`;

        delete api.defaults.headers.common['Authorization'];

        window.location.replace(loginUrl);
    });
};

/**
 * Get user from localStorage
 */
export const getUser = () => {
    try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        return null;
    }
};

/**
 * Get account id
 */
export const getAccountId = () => {
    const user = getUser();
    return user ? user.account_id : null;
};

/**
 * Get account id
 */
export const getRoleAccountId = () => {
    const user = getUser();
    return user ? user.role : null;
};