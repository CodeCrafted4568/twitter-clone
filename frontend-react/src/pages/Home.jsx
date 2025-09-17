import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import Feed from "../ui/Feed";
import RightRail from "../ui/RightRail";
import "./home.css";

export default function Home() {
  const [me, setMe] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      // baseURL já é .../api/, então aqui é só o caminho relativo
      const [{ data: meData }, { data: feedData }] = await Promise.all([
        api.get("users/me/"),
        api.get("feed/")
      ]);
      setMe(meData);
      setTweets(feedData.results ?? feedData ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function onPost(text) {
    const body = (text || "").trim();
    if (!body) return;
    const { data } = await api.post("tweets/", { text: body });
    setTweets(t => [data, ...t]);
  }

  async function onLike(id) {
    await api.post(`tweets/${id}/like/`);
    setTweets(t =>
      t.map(x => x.id === id
        ? { ...x, likes_count: (x.likes_count || 0) + 1, liked: true }
        : x
      )
    );
  }

  async function onUnlike(id) {
    await api.delete(`tweets/${id}/like/`);
    setTweets(t =>
      t.map(x => x.id === id
        ? { ...x, likes_count: Math.max((x.likes_count || 1) - 1, 0), liked: false }
        : x
      )
    );
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
          <Feed
            me={me}
            tweets={tweets}
            loading={loading}
            onPost={onPost}
            onLike={onLike}
            onUnlike={onUnlike}
          />
        )}
      </main>

      <aside className="home-right">
        <RightRail />
      </aside>
    </div>
  );
}
