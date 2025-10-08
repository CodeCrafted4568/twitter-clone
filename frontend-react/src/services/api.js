// src/services/api.js
import axios from "axios";

/** Garante que a base termine com "/api/" */
function normalizeApiBase(raw) {
    const fallback = "http://127.0.0.1:8000/api/";
    if (!raw || typeof raw !== "string") return fallback;
    const cleaned = raw.trim().replace(/\/+$/, "");
    if (!cleaned) return fallback;
    if (cleaned.endsWith("/api")) return cleaned + "/";
    return cleaned + "/api/";
}

const baseURL = normalizeApiBase(import.meta.env.VITE_API_BASE);
export const API_BASE = baseURL;

const api = axios.create({
    baseURL,
    headers: { Accept: "application/json" },
    // withCredentials: true, // só se sua API usar cookies/sessão
});

api.interceptors.request.use((cfg) => {
    const access = localStorage.getItem("token");
    cfg.headers = cfg.headers ?? {};
    if (access) cfg.headers.Authorization = `Bearer ${access}`;
    if (cfg.data instanceof FormData) {
        delete cfg.headers["Content-Type"]; // boundary automático
    } else {
        cfg.headers["Content-Type"] = "application/json";
    }
    return cfg;
});

let refreshing = null;

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
                    .post("token/refresh/", { refresh }) // /api/token/refresh/
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
