import { useState, useEffect } from "react";
import api from "../services/api";
import { useUser } from "../components/UserContext";

export default function FollowButton({ userId, initialFollowing, onUpdate }) {
    const [following, setFollowing] = useState(Boolean(initialFollowing));
    const [loading, setLoading] = useState(false);
    const { refreshUser } = useUser();

    useEffect(() => {
        setFollowing(Boolean(initialFollowing));
    }, [initialFollowing, userId]);

    async function toggle() {
        if (loading) return;
        setLoading(true);

        const next = !following;
        setFollowing(next);

        try {
            const endpoint = `users/${userId}/follow/`;
            const method = next ? "post" : "delete";
            const { data } = await api[method](endpoint);

            if (onUpdate) onUpdate(userId, data);
            await refreshUser(); // ✅ atualiza "Seguindo" e "Seguidores"

            setFollowing(Boolean(data?.is_following ?? next));
        } catch (err) {
            console.error("❌ Erro ao seguir:", err);
            setFollowing(!next);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            className={`mini ${following ? "outline" : ""}`}
            onClick={toggle}
            disabled={loading}
        >
            {loading ? "..." : following ? "Seguindo" : "Seguir"}
        </button>
    );
}
