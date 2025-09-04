import { useEffect, useState } from "react"
import api from "../services/api"
import Feed from "../ui/Feed"
import RightRail from "../ui/RightRail"
import "./home.css"

export default function Home() {
  const [me, setMe] = useState(null)
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    try {
      setLoading(true)
      // usuário logado (se quiser exibir avatar/nome depois)
      const meRes = await api.get("/api/users/me/")
      setMe(meRes.data)

      // feed (recomenda-se paginação; aqui simples)
      const twRes = await api.get("/api/feed/")
      setTweets(twRes.data.results ?? twRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  // callbacks do feed
  async function onPost(text) {
    if (!text.trim()) return
    const { data } = await api.post("/api/tweets/", { text })
    setTweets(t => [data, ...t])
  }
  async function onLike(id) {
    await api.post(`/api/tweets/${id}/like/`)
    setTweets(t => t.map(x => x.id === id ? { ...x, likes_count: (x.likes_count || 0) + 1, liked: true } : x))
  }
  async function onUnlike(id) {
    await api.delete(`/api/tweets/${id}/like/`)
    setTweets(t => t.map(x => x.id === id ? { ...x, likes_count: Math.max((x.likes_count || 1) - 1, 0), liked: false } : x))
  }

  return (
    <div className="home-layout">
      <main className="home-main">
        <header className="home-topbar">Para você</header>

        {loading ? (
          <p className="muted" style={{ textAlign: "center", marginTop: 20 }}>
            Carregando...
          </p>
        ) : (
          <>
            <Feed
              me={me}
              tweets={tweets}
              loading={loading}
              onPost={onPost}
              onLike={onLike}
              onUnlike={onUnlike}
            />
          </>
        )}

      </main>

      <aside className="home-right">
        <RightRail />
      </aside>
    </div>
  )
}
