// src/services/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/";

const api = axios.create({
    baseURL,
    headers: { Accept: "application/json" },
});

// 🔧 Variável global pra controlar múltiplos refresh simultâneos
let refreshing = null;

/** Interceptor de request — adiciona token e content-type */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    config.headers = config.headers ?? {};

    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    } else {
        config.headers["Content-Type"] = "application/json";
    }

    return config;
});

/** Interceptor de resposta — renova token automaticamente */
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const status = err?.response?.status;
        const original = err?.config || {};

        if (status !== 401 || original._retry) {
            return Promise.reject(err);
        }

        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
            logoutAndRedirect();
            return Promise.reject(err);
        }

        try {
            if (!refreshing) {
                refreshing = axios
                    .post(`${baseURL}token/refresh/`, { refresh })
                    .then(({ data }) => {
                        const newAccess = data?.access;
                        if (!newAccess) throw new Error("Refresh sem access token");
                        localStorage.setItem("token", newAccess);
                        return newAccess;
                    })
                    .finally(() => (refreshing = null));
            }

            const newAccess = await refreshing;

            original._retry = true;
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newAccess}`;

            return api(original);
        } catch {
            logoutAndRedirect();
            return Promise.reject(err);
        }
    }
);

export function logoutAndRedirect() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");

    if (api?.defaults?.headers?.common) {
        delete api.defaults.headers.common.Authorization;
    }

    const to = import.meta.env.VITE_LOGOUT_REDIRECT || "/";
    window.location.assign(to);
}

export default api;
