import { useEffect, useState } from "react"
import api from "../services/api"
import perfilIcon from "../assets/perfil.png"
import ProfileModal from "../components/ProfileModal.jsx"

export default function RightRail() {
    const [me, setMe] = useState(null)
    const [following, setFollowing] = useState([])
    const [followers, setFollowers] = useState([])
    const [openProfile, setOpenProfile] = useState(false)

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
                        <span className="muted">@{me?.username ?? "user"}</span>
                    </div>
                </div>
            </section>

            {/* Seguindo */}
            <section className="widget">
                <h3>Seguindo</h3>
                {/* ... */}
            </section>

            {/* Seguidores */}
            <section className="widget">
                <h3>Seguidores</h3>
                {/* ... */}
            </section>

            {/* Modal de edição de perfil */}
            <ProfileModal open={openProfile} onClose={() => setOpenProfile(false)} />
        </div>
    )
}
