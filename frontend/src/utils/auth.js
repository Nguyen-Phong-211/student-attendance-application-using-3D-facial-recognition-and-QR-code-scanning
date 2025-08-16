export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const setTokens = ({ access, refresh }) => {
    localStorage.setItem('access_token', access);
    if (refresh) {
        localStorage.setItem('refresh_token', refresh);
    }
};

export const clearTokensAndRedirect = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/account/login';
};