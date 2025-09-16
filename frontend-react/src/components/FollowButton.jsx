import { useState } from "react";
import api from "../services/api";

export default function FollowButton({ userId, initialFollowing }) {
    const [following, setFollowing] = useState(Boolean(initialFollowing));
    const [loading, setLoading] = useState(false);

    async function toggle() {
        if (loading) return;
        setLoading(true);
        const next = !following;
        setFollowing(next); // otimista

        try {
            if (next) {
                await api.post(`/api/follow/${userId}/`);
            } else {
                await api.delete(`/api/follow/${userId}/`);
            }
        } catch {
            setFollowing(!next); // rollback
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
