import { useState } from "react";
import perfilIcon from "../assets/perfil.png";
import ProfileModal from "../components/ProfileModal.jsx";
import ProfileSearch from "../components/ProfileSearch.jsx";
import { useUser } from "../components/UserContext.jsx";

export default function RightRail() {
    const { me, following, followers, refreshUser } = useUser();
    const [openProfile, setOpenProfile] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);

    return (
        <div className="right-rail">
            <ProfileSearch onChangeFollow={refreshUser} />

            <section className="widget profile-widget" onClick={() => setOpenProfile(true)}>
                <div className="profile-header">
                    <img
                        className="avatar lg"
                        src={me?.avatar_url || perfilIcon}
                        alt="Perfil"
                        loading="lazy"
                    />
                    <div className="who">
                        <strong>{me?.username ?? "Meu perfil"}</strong>
                    </div>
                </div>
            </section>

            {/* Seguindo */}
            <section className="widget">
                <button
                    className="toggle-head"
                    onClick={() => setShowFollowing((v) => !v)}
                    type="button"
                >
                    <span>Seguindo</span>
                    <span className="pill">{following.length}</span>
                    <span className={`caret ${showFollowing ? "up" : ""}`} />
                </button>

                {showFollowing && (
                    <ul className="people">
                        {following.length === 0 ? (
                            <li className="muted">Você ainda não segue ninguém</li>
                        ) : (
                            following.map((u) => (
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

            {/* Seguidores */}
            <section className="widget">
                <button
                    className="toggle-head"
                    onClick={() => setShowFollowers((v) => !v)}
                    type="button"
                >
                    <span>Seguidores</span>
                    <span className="pill">{followers.length}</span>
                    <span className={`caret ${showFollowers ? "up" : ""}`} />
                </button>

                {showFollowers && (
                    <ul className="people">
                        {followers.length === 0 ? (
                            <li className="muted">Ninguém te segue ainda</li>
                        ) : (
                            followers.map((u) => (
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

            <ProfileModal
                open={openProfile}
                onClose={() => {
                    setOpenProfile(false);
                    refreshUser();
                }}
            />
        </div>
    );
}
