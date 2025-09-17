import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/";
const api = axios.create({ baseURL });

// Injeta Authorization e configura Content-Type corretamente
api.interceptors.request.use((cfg) => {
    const access = localStorage.getItem("token");
    if (access) cfg.headers.Authorization = `Bearer ${access}`;

    if (cfg.data instanceof FormData) {
        // deixa o browser definir o boundary
        delete cfg.headers["Content-Type"];
    } else {
        cfg.headers["Content-Type"] = "application/json";
    }
    return cfg;
});

// Refresh automático quando der 401 e retry da requisição
let refreshing = null; // Promise em andamento
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const status = err.response?.status;
        const original = err.config;

        // Se não for 401 ou já tentamos refresh, só repassa o erro
        if (status !== 401 || original?._retry) return Promise.reject(err);

        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
            logoutAndRedirect();
            return Promise.reject(err);
        }

        try {
            // evita múltiplos refresh concorrentes
            if (!refreshing) {
                refreshing = api.post("auth/token/refresh/", { refresh })
                    .then(({ data }) => {
                        localStorage.setItem("token", data.access);
                        return data.access;
                    })
                    .finally(() => { refreshing = null; });
            }

            const newAccess = await refreshing;
            // marca que estamos re-tentando
            original._retry = true;
            // injeta novo token e re-executa a chamada original
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newAccess}`;
            return api(original);
        } catch (_) {
            logoutAndRedirect();
            return Promise.reject(err);
        }
    }
);

function logoutAndRedirect() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    // opcional: limpar Authorization default
    try { delete api.defaults.headers.common.Authorization; } catch { }
    window.location.assign(import.meta.env.VITE_LOGOUT_REDIRECT || "/");
}

export default api;
