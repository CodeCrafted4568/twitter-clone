import axios from "axios";

function normalizeApiBase(raw) {
    const fallback = "http://127.0.0.1:8000/api/";
    if (!raw || typeof raw !== "string") return fallback;

    const cleaned = raw.trim().replace(/\/+$/, ""); // remove barras finais
    if (!cleaned) return fallback;

    if (cleaned.endsWith("/api")) return cleaned + "/"; // já tem /api
    return cleaned + "/api/"; // acrescenta /api/
}

// Lê do env e garante "/api/" (com barra no fim)
const baseURL = normalizeApiBase(import.meta.env.VITE_API_BASE);

// Exporta caso queira debugar no app
export const API_BASE = baseURL;

const api = axios.create({
    baseURL,
    headers: { Accept: "application/json" },
    // withCredentials: true, // só se sua API usa cookies/sessão
    // timeout: 20000,
});

// Injeta Authorization e Content-Type corretamente
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

// Refresh automático em 401 e retry da requisição
let refreshing = null; // Promise<string> | null

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const status = err?.response?.status;
        const original = err?.config || {};

        // Se não for 401 ou já tentamos refresh, repassa o erro
        if (status !== 401 || original._retry) return Promise.reject(err);

        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
            logoutAndRedirect();
            return Promise.reject(err);
        }

        try {
            // Evita múltiplos refresh concorrentes
            if (!refreshing) {
                refreshing = api
                    .post("auth/token/refresh/", { refresh })
                    .then(({ data }) => {
                        const newAccess = data?.access;
                        if (!newAccess) throw new Error("Refresh sem access token");
                        localStorage.setItem("token", newAccess);
                        return newAccess;
                    })
                    .finally(() => {
                        refreshing = null;
                    });
            }

            const newAccess = await refreshing;

            // Reexecuta a chamada original com novo token
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

// (opcional) helper para salvar tokens após login
export function setAuthTokens({ access, refresh }) {
    if (access) localStorage.setItem("token", access);
    if (refresh) localStorage.setItem("refresh", refresh);
}

export default api;
