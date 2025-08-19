const STORAGE_KEYS = {
    ACCESS_TOKEN: "access_token",
};

export const authService = {
    saveToken: (token, rememberMe = false) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);

        if (rememberMe) {
            sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        } else {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        }
    },

    getToken: () => {
        return (
            localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
            sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        );
    },

    clearToken: () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    },
};