import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import Feed from "../ui/Feed";
import RightRail from "../ui/RightRail";
import { useUser } from "../components/UserContext.jsx";
import "./home.css";

export default function Home() {
  const { me, refreshUser } = useUser();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // 🔹 Carrega perfil + feed
  // ============================================================
  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("feed/");
      setTweets(data.results ?? data ?? []);
    } catch (err) {
      console.error("❌ Erro ao carregar feed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();  // garante que me já está atualizado
    loadFeed();     // carrega apenas o feed
  }, [loadFeed, refreshUser]);

  // ============================================================
  // 🔹 Postar novo tweet
  // ============================================================
  async function onPost(text) {
    const body = (text || "").trim();
    if (!body) return;
    try {
      const { data } = await api.post("api/tweets/", { text: body });
      setTweets((prev) => [data, ...prev]);
    } catch (err) {
      console.error("❌ Erro ao postar tweet:", err);
    }
  }

  // ============================================================
  // 🔹 Atualiza estado local de likes (sem reload do feed)
  // ============================================================
  function onLikeChange(id, liked) {
    setTweets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
            ...t,
            liked,
            likes_count: t.likes_count + (liked ? 1 : -1),
          }
          : t
      )
    );
  }

  // ============================================================
  // 🔹 Atualiza comentários de um tweet (sem recarregar tudo)
  // ============================================================
  function onCommentAdded(id) {
    setTweets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, comments_count: (t.comments_count ?? 0) + 1 }
          : t
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
            onLikeChange={onLikeChange}
            onCommentAdded={onCommentAdded}
          />
        )}
      </main>

      <aside className="home-right">
        <RightRail />
      </aside>
    </div>
  );
}
