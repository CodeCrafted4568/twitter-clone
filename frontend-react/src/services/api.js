import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/";
const api = axios.create({ baseURL });

api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem("token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    if (cfg.data instanceof FormData) {
        delete cfg.headers["Content-Type"];
    } else {
        cfg.headers["Content-Type"] = "application/json";
    }
    return cfg;
});

export default api;
