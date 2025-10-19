import { useEffect, useState } from "react";
import perfilIcon from "../assets/perfil.png";
import ProfileModal from "../components/ProfileModal.jsx";
import ProfileSearch from "../components/ProfileSearch.jsx";
import { useUser } from "../components/UserContext";

export default function RightRail() {
    const { me, refreshUser, loading } = useUser();
    const [openProfile, setOpenProfile] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);

    // Atualiza listas ao abrir a barra lateral (caso precise)
    useEffect(() => {
        if (!me && !loading) refreshUser();
    }, [me, loading, refreshUser]);

    if (loading) {
        return <div className="right-rail"><p>Carregando...</p></div>;
    }

    if (!me) {
        return (
            <div className="right-rail">
                <p>Usuário não logado.</p>
            </div>
        );
    }

    return (
        <div className="right-rail">
            {/* 🔍 Busca de perfis */}
            <ProfileSearch onChangeFollow={refreshUser} />

            {/* 👤 Meu perfil */}
            <section
                className="widget profile-widget"
                onClick={() => setOpenProfile(true)}
            >
                <div className="profile-header">
                    <img
                        className="avatar lg"
                        src={me.avatar_url || perfilIcon}
                        alt="Perfil"
                        loading="lazy"
                    />
                    <div className="who">
                        <strong>{me.username ?? "Meu perfil"}</strong>
                    </div>
                </div>
            </section>

            {/* 🧍‍♂️ Seguindo */}
            <section className="widget">
                <button
                    className="toggle-head"
                    onClick={() => setShowFollowing(v => !v)}
                    type="button"
                >
                    <span>Seguindo</span>
                    <span className="pill">{me.following?.length ?? 0}</span>
                    <span className={`caret ${showFollowing ? "up" : ""}`} />
                </button>

                {showFollowing && (
                    <ul className="people">
                        {(!me.following || me.following.length === 0) ? (
                            <li className="muted">Você ainda não segue ninguém</li>
                        ) : (
                            me.following.map(u => (
                                <li key={u.id}>
                                    <div className="avatar sm" />
                                    <div className="who">
                                        <strong>{u.username}</strong>
                                        <span className="muted">@{u.username}</span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </section>

            {/* 👥 Seguidores */}
            <section className="widget">
                <button
                    className="toggle-head"
                    onClick={() => setShowFollowers(v => !v)}
                    type="button"
                >
                    <span>Seguidores</span>
                    <span className="pill">{me.followers?.length ?? 0}</span>
                    <span className={`caret ${showFollowers ? "up" : ""}`} />
                </button>

                {showFollowers && (
                    <ul className="people">
                        {(!me.followers || me.followers.length === 0) ? (
                            <li className="muted">Ninguém te segue ainda</li>
                        ) : (
                            me.followers.map(u => (
                                <li key={u.id}>
                                    <div className="avatar sm" />
                                    <div className="who">
                                        <strong>{u.username}</strong>
                                        <span className="muted">@{u.username}</span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </section>

            {/* 🧩 Modal de perfil */}
            <ProfileModal
                open={openProfile}
                onClose={() => {
                    setOpenProfile(false);
                    refreshUser(); // ✅ atualiza ao fechar o modal
                }}
            />
        </div>
    );
}
