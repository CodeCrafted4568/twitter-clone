import { useEffect, useState } from "react"
import api from "../services/api"
import perfilIcon from "../assets/perfil.png"
import ProfileModal from "../components/ProfileModal.jsx"
import ProfileSearch from "../components/ProfileSearch.jsx";

export default function RightRail() {
    const [me, setMe] = useState(null)
    const [following, setFollowing] = useState([])
    const [followers, setFollowers] = useState([])
    const [openProfile, setOpenProfile] = useState(false)
    const [showFollowing, setShowFollowing] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);

    useEffect(() => {
        async function load() {
            const meRes = await api.get("/api/users/me/")
            setMe(meRes.data)

            const a = await api.get("/api/users/following/")
            const b = await api.get("/api/users/followers/")
            setFollowing(a.data.results ?? a.data)
            setFollowers(b.data.results ?? b.data)
        }
        load()
    }, [])

    return (
        <div className="right-rail">
            <ProfileSearch />

            <section
                className="widget profile-widget"
                onClick={() => setOpenProfile(true)}
            >
                <div className="profile-header">
                    <img
                        className="avatar lg"
                        src={me?.avatar_url || perfilIcon}
                        alt="Perfil"
                    />
                    <div className="who">
                        <strong>{me?.username ?? "Meu perfil"}</strong>
                        <span className="muted">{me?.username}</span>
                    </div>
                </div>
            </section>

            {/* Seguindo */}
            <section className="widget">
                <button
                    className="toggle-head"
                    onClick={() => setShowFollowing(v => !v)}
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
                            following.map(u => (
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
                    onClick={() => setShowFollowers(v => !v)}
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
                            followers.map(u => (
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

            {/* Modal de edição de perfil */}
            <ProfileModal open={openProfile} onClose={() => setOpenProfile(false)} />
        </div>
    )
}
