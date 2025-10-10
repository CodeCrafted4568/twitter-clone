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
            if (next) {
                const { data } = await api.post(`follow/${userId}/`);
                if (onUpdate) onUpdate(userId, data);
            } else {
                const { data } = await api.delete(`follow/${userId}/`);
                if (onUpdate) onUpdate(userId, data);
            }
        } catch (err) {
            console.error("Erro ao seguir:", err);
            setFollowing(!next); // rollback se der erro
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
            {following ? "Seguindo" : "Seguir"}
        </button>
    );
}
