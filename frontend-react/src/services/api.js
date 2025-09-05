import axios from "axios";

// Se VITE_API_BASE não for definido, usa as serverless functions /api da Vercel
const baseURL = import.meta.env.VITE_API_BASE || "/api";

const api = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" }
});

// injeta token fake se existir
api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem("token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export default api;
