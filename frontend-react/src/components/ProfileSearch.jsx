import { useEffect, useState } from "react";
import api from "../services/api";
import FollowButton from "./FollowButton";
import perfilIcon from "../assets/perfil.png";

// debounce simples
function useDebounced(value, delay = 350) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

export default function ProfileSearch() {
    const [q, setQ] = useState("");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [me, setMe] = useState(null);

    const qDeb = useDebounced(q);

    // pega o usuário atual (pra não listar ele mesmo)
    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("users/me/");
                setMe(data);
            } catch {
                setMe(null);
            }
        })();
    }, []);

    // busca por usuários
    useEffect(() => {
        (async () => {
            const term = qDeb.trim();
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
        })();
    }, [qDeb, me]);

    // Atualiza dados do usuário após seguir/deixar de seguir
    function handleUpdate(userId, data) {
        setItems((prev) =>
            prev.map((u) =>
                u.id === userId
                    ? {
                        ...u,
                        followers_count: data.followers_count,
                        following_count: data.following_count,
                        is_following: data.is_following,
                    }
                    : u
            )
        );
    }

    return (
        <section className="widget">
            <h3>Buscar perfis</h3>

            <input
                className="field"
                placeholder="Procurar por @usuário"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ width: "100%" }}
            />

            {loading && q.trim() && (
                <p className="muted" style={{ marginTop: 8 }}>
                    Buscando…
                </p>
            )}

            {!loading && q.trim() && items.length === 0 && (
                <p className="muted" style={{ marginTop: 8 }}>
                    Nenhum resultado
                </p>
            )}

            {items.length > 0 && (
                <ul className="people" style={{ marginTop: 10 }}>
                    {items.map((u) => (
                        <li key={u.id}>
                            <img
                                className="avatar sm"
                                src={u.avatar_url || perfilIcon}
                                alt={u.username}
                                loading="lazy"
                            />
                            <div className="who">
                                <strong>@{u.username}</strong>
                                <span className="muted">
                                    {u.followers_count ?? 0} seg · {u.following_count ?? 0} seguindo
                                </span>
                            </div>
                            <FollowButton
                                userId={u.id}
                                initialFollowing={u.is_following}
                                onUpdate={handleUpdate}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
