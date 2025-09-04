import { useEffect, useState } from "react";
import api from "../services/api";
import FollowButton from "./FollowButton";
import perfilIcon from "../assets/perfil.png";

export default function ProfileSearch() {
    const [q, setQ] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const t = setTimeout(async () => {
            if (!q.trim()) { setList([]); return; }
            setLoading(true);
            try {
                const { data } = await api.get("/api/users/search/", { params: { q } });
                setList(data);
            } finally { setLoading(false); }
        }, 300); // debounce
        return () => clearTimeout(t);
    }, [q]);

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

            {loading && <p style={{ opacity: .7, marginTop: 8 }}>carregando…</p>}
            {!loading && list.length === 0 && q && (
                <p style={{ opacity: .7, marginTop: 8 }}>Nenhum resultado</p>
            )}

            <ul className="people" style={{ marginTop: 10 }}>
                {list.map(u => (
                    <li key={u.id}>
                        <img className="avatar sm" src={u.avatar_url || perfilIcon} alt="" />
                        <div className="who">
                            <strong>@{u.username}</strong>
                            <span className="muted">
                                {u.followers_count} seg · {u.following_count} seguindo
                            </span>
                        </div>
                        <FollowButton userId={u.id} initialFollowing={u.is_following} />
                    </li>
                ))}
            </ul>
        </section>
    );
}
