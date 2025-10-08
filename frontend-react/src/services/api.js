import axios from "axios";

/** Garante que a base termine com "/api/" */
function normalizeApiBase(raw) {
    const fallback = "http://127.0.0.1:8000/api/";
    if (!raw || typeof raw !== "string") return fallback;
    const cleaned = raw.trim().replace(/\/+$/, "");
    if (!cleaned) return fallback;
    // se já terminou com /api inclui a barra final
    if (cleaned.endsWith("/api")) return cleaned + "/";
    // caso contrário adiciona /api/
    return cleaned + "/api/";
}

const baseURL = normalizeApiBase(import.meta.env.VITE_API_BASE);
export const API_BASE = baseURL;

const api = axios.create({
    baseURL,
    headers: { Accept: "application/json" },
    // withCredentials: true, // use se você usar cookies/sessão
});

// adiciona Authorization automaticamente e Content-Type correto
api.interceptors.request.use((cfg) => {
    const access = localStorage.getItem("token");
    cfg.headers = cfg.headers ?? {};
    if (access) cfg.headers.Authorization = `Bearer ${access}`;

    if (cfg.data instanceof FormData) {
        // deixa o browser definir o boundary
        delete cfg.headers["Content-Type"];
    } else {
        cfg.headers["Content-Type"] = "application/json";
    }
    return cfg;
});

// refresh automático de token quando 401
let refreshing = null;

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const status = err?.response?.status;
        const original = err?.config || {};

        // não é 401 ou já tentamos retry -> rejeita
        if (status !== 401 || original._retry) return Promise.reject(err);

        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
            logoutAndRedirect();
            return Promise.reject(err);
        }

        try {
            if (!refreshing) {
                // NOTE: rota de refresh é /api/auth/token/refresh/ (coerente com backend)
                refreshing = api
                    .post("auth/token/refresh/", { refresh })
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
            // re-tenta a requisição original
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
