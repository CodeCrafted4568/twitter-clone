import { useState } from "react";
import api from "../services/api";

export default function FollowButton({ userId, initialFollowing }) {
    const [following, setFollowing] = useState(Boolean(initialFollowing));
    const [loading, setLoading] = useState(false);

    async function toggle() {
        if (loading) return;
        setLoading(true);

        try {
            let response;

            if (!following) {
                // Seguir
                response = await api.post(`follow/${userId}/`);
            } else {
                // Deixar de seguir
                response = await api.delete(`follow/${userId}/`);
            }

            // Se o backend retornar { is_following: true/false }, usamos esse valor
            if (response?.data?.is_following !== undefined) {
                setFollowing(Boolean(response.data.is_following));
            } else {
                // Caso ainda retorne 204 sem corpo, fazemos o toggle otimista
                setFollowing((prev) => !prev);
            }
        } catch (err) {
            console.error("Erro ao seguir/deixar de seguir:", err);
            // rollback otimista
            setFollowing((prev) => !prev);
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
            {loading
                ? "Carregando..."
                : following
                    ? "Seguindo"
                    : "Seguir"}
        </button>
    );
}
