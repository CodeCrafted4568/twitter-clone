// src/services/api.js
import axios from "axios";

/** Garante que a base termine com "/api/" */
function normalizeApiBase(raw) {
    const fallback = "http://127.0.0.1:8000/api/";
    if (!raw || typeof raw !== "string") return fallback;
    const cleaned = raw.trim().replace(/\/+$/, "");
    if (!cleaned) return fallback;
    // se user colocou já com /api, garante a barra final
    if (cleaned.endsWith("/api")) return cleaned + "/";
    return cleaned + "/api/";
}

const rawBase = import.meta.env.VITE_API_BASE || "/api";
const baseURL = normalizeApiBase(rawBase);
export const API_BASE = baseURL;

const api = axios.create({
    baseURL, // ✅ usa a URL garantida (com /api/ no fim)
    headers: { Accept: "application/json" },
});


// 🔧 Variável global pra controlar múltiplos refresh simultâneos
let refreshing = null;

/** Interceptor de request — adiciona token e content-type */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("access");
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
        if (status !== 401 || original._retry) return Promise.reject(err);

        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
            logoutAndRedirect();
            return Promise.reject(err);
        }

        try {
            if (!refreshing) {
                refreshing = api
                    .post("/token/refresh/", { refresh })
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
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        if (api?.defaults?.headers?.common) {
            delete api.defaults.headers.common.Authorization;
        }
    } catch { }
    const to = (import.meta.env.VITE_LOGOUT_REDIRECT || "/").toString();
    if (typeof window !== "undefined") window.location.assign(to);
}

export function setAuthTokens({ access, refresh }) {
    if (access) localStorage.setItem("token", access);
    if (refresh) localStorage.setItem("refresh", refresh);
}

export default api;
