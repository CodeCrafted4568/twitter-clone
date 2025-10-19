import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);

    // Carrega o usuário logado
    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("users/me/");
                setMe(data);
            } catch {
                setMe(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Atualiza contadores ao seguir/desseguir
    const refreshUser = async () => {
        try {
            const { data } = await api.get("users/me/");
            setMe(data);
        } catch {
            /* nada */
        }
    };

    return (
        <UserContext.Provider value={{ me, setMe, refreshUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
