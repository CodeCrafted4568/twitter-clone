import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../services/api";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [me, setMe] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    const refreshUser = useCallback(async () => {
        // Verifica se existe token antes de tentar buscar /users/me/
        const token = localStorage.getItem("token");
        if (!token) {
            setMe(null);
            setFollowers([]);
            setFollowing([]);
            return;
        }

        try {
            const meRes = await api.get("users/me/");
            const fresh = {
                ...meRes.data,
                avatar_url: meRes.data.avatar_url
                    ? `${meRes.data.avatar_url}?t=${Date.now()}`
                    : "",
            };
            setMe(fresh);

            const [a, b] = await Promise.all([
                api.get("users/following/"),
                api.get("users/followers/"),
            ]);

            setFollowing(a.data.results ?? a.data ?? []);
            setFollowers(b.data.results ?? b.data ?? []);
        } catch {
            setMe(null);
            setFollowers([]);
            setFollowing([]);
        }
    }, []);

    useEffect(() => { refreshUser(); }, [refreshUser]);

    return (
        <UserContext.Provider value={{ me, followers, following, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
