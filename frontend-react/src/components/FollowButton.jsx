import { useState } from "react";
import api from "../services/api";

export default function FollowButton({ userId, initialFollowing, onUpdate }) {
    const [following, setFollowing] = useState(Boolean(initialFollowing));
    const [loading, setLoading] = useState(false);

    async function toggle() {
        if (loading) return;
        setLoading(true);
        const next = !following;
        setFollowing(next);

        try {
            const response = next
                ? await api.post(`api/follow/${userId}/`)
                : await api.delete(`api/follow/${userId}/`);

            // Atualiza contadores de seguidores e seguindo no pai (ProfileSearch)
            if (response.data && onUpdate) {
                onUpdate(userId, response.data);
            }
        } catch {
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
            {following ? "Seguindo" : "Seguir"}
        </button>
    );
}
