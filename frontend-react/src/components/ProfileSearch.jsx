import { useEffect, useState } from "react";
import api from "../services/api";
import FollowButton from "./FollowButton";
import perfilIcon from "../assets/perfil.png";
import { useUser } from "./UserContext.jsx";

export default function ProfileSearch() {
    const [q, setQ] = useState("");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { me, refreshUser } = useUser();

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            const term = q.trim();
            if (!term) {
                setItems([]);
                return;
            }
            try {
                setLoading(true);
                const { data } = await api.get("users/", { params: { search: term } });
                const results = data.results ?? data ?? [];
                const normalized = results
                    .filter((u) => !me || u.id !== me.id)
                    .map((u) => ({
                        ...u,
                        avatar_url: u.avatar_url ? `${u.avatar_url}?t=${Date.now()}` : "",
                    }));
                setItems(normalized);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [q, me]);

    return (
        <section className="widget">
            <h3>Buscar perfis</h3>
            <input
                className="field"
                placeholder="Procurar por @usuário"
                value={q}
                onChange={(e) => setQ(e.target.value)}
            />
            {loading && <p className="muted">Buscando...</p>}
            {!loading && q.trim() && items.length === 0 && <p className="muted">Nenhum resultado</p>}
            {items.length > 0 && (
                <ul className="people" style={{ marginTop: 10 }}>
                    {items.map((u) => (
                        <li key={u.id}>
                            <img className="avatar sm" src={u.avatar_url || perfilIcon} alt={u.username} />
                            <div className="who">
                                <strong>@{u.username}</strong>
                                <span className="muted">
                                    {u.followers_count ?? 0} seg · {u.following_count ?? 0} seguindo
                                </span>
                            </div>
                            <FollowButton
                                userId={u.id}
                                initialFollowing={u.is_following}
                                onUpdate={refreshUser}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
