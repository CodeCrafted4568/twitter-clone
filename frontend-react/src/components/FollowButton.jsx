import { useState } from "react";
import api from "../services/api";

export default function FollowButton({ userId, initialFollowing, onUpdate }) {
    const [following, setFollowing] = useState(Boolean(initialFollowing));
    const [loading, setLoading] = useState(false);

    async function toggle() {
        if (loading) return;
        setLoading(true);

        const next = !following;
        setFollowing(next); // atualização otimista

        try {
            const endpoint = `users/${userId}/follow/`; // ajuste: rota REST correta
            const method = next ? "post" : "delete";
            const { data } = await api[method](endpoint);

            // callback para atualizar listas (seguindo, seguidores etc.)
            if (onUpdate) onUpdate(userId, data);
        } catch (err) {
            console.error("❌ Erro ao seguir:", err);
            setFollowing(!next); // rollback se falhar
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
