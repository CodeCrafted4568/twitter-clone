import { useEffect, useState } from "react";
import api from "../services/api";

export default function TweetCard({ tweet, onLikeChange, onCommentAdded }) {
    const [openComments, setOpenComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingC, setLoadingC] = useState(false);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [liked, setLiked] = useState(!!tweet.liked);
    const [likesCount, setLikesCount] = useState(tweet.likes_count ?? 0);

    useEffect(() => {
        setLiked(!!tweet.liked);
        setLikesCount(tweet.likes_count ?? 0);
    }, [tweet.id]);


    // ============================================================
    // 🔹 Carrega comentários
    // ============================================================
    async function loadComments() {
        try {
            setLoadingC(true);
            const { data } = await api.get(`api/tweets/${tweet.id}/comments/`);
            setComments(data.results ?? data ?? []);
        } catch (err) {
            console.error("❌ Erro ao carregar comentários:", err);
        } finally {
            setLoadingC(false);
        }
    }

    useEffect(() => {
        if (openComments) loadComments();
    }, [openComments]);

    // ============================================================
    // 🔹 Enviar comentário
    // ============================================================
    async function sendComment(e) {
        e.preventDefault();
        const payload = text.trim();
        if (!payload || sending) return;

        try {
            setSending(true);
            const { data } = await api.post(`tweets/${tweet.id}/comments/`, {
                text: payload,
            });
            setComments((c) => [...c, data]);
            setText("");

            // Atualiza contador de comentários no feed
            if (onCommentAdded) onCommentAdded(tweet.id);
        } catch (err) {
            console.error("❌ Erro ao comentar:", err);
        } finally {
            setSending(false);
        }
    }

    // ============================================================
    // 🔹 Curtir / Descurtir (otimista)
    // ============================================================
    async function handleLike() {
        const optimisticLiked = !liked;
        const currentCount = typeof likesCount === "number" ? likesCount : 0;
        const optimisticCount = currentCount + (optimisticLiked ? 1 : -1);

        setLiked(optimisticLiked);
        setLikesCount(optimisticCount);

        try {
            const endpoint = `tweets/${tweet.id}/like/`;
            const method = optimisticLiked ? "post" : "delete";
            const { data } = await api[method](endpoint);

            // sincroniza com backend
            setLiked(!!data.liked);
            setLikesCount(data.likes_count ?? 0);

            if (onLikeChange) onLikeChange(tweet.id, data.liked);
        } catch (err) {
            console.error("❌ Erro ao curtir/descurtir:", err);
            // rollback visual se falhar
            setLiked(!optimisticLiked);
            setLikesCount(currentCount);
        }
    }

    // ============================================================
    // 🔹 Render
    // ============================================================
    return (
        <article className="tweet">
            <div className="tweet-body">
                <div className="tweet-head">
                    <strong>{tweet.user}</strong>
                    <span className="muted"> · {new Date(tweet.created_at).toLocaleString()}</span>
                </div>

                <div className="tweet-text">{tweet.text}</div>

                <div
                    className="tweet-actions"
                    style={{ display: "flex", gap: 16, alignItems: "center" }}
                >
                    {/* ❤️ Curtir */}
                    <button className="icon-btn" onClick={handleLike}>
                        {liked ? "♥" : "♡"} {likesCount}
                    </button>

                    {/* 💬 Comentar */}
                    <button
                        className="icon-btn"
                        onClick={() => setOpenComments((v) => !v)}
                    >
                        💬 {tweet.comments_count ?? comments.length}
                    </button>
                </div>

                {openComments && (
                    <div className="comments" style={{ marginTop: 10 }}>
                        {/* Formulário de comentário */}
                        <form
                            onSubmit={sendComment}
                            style={{ display: "flex", gap: 8, marginBottom: 10 }}
                        >
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Responder…"
                                className="reply-input"
                                style={{
                                    flex: 1,
                                    background: "#0b141a",
                                    color: "#e6eef4",
                                    border: "1px solid #243340",
                                    borderRadius: 8,
                                    padding: "8px 10px",
                                }}
                            />
                            <button className="mini" disabled={!text.trim() || sending}>
                                {sending ? "Enviando…" : "Comentar"}
                            </button>
                        </form>

                        {/* Lista de comentários */}
                        {loadingC ? (
                            <p className="muted">Carregando comentários…</p>
                        ) : (
                            <ul
                                style={{
                                    listStyle: "none",
                                    margin: 0,
                                    padding: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                {comments.map((c) => (
                                    <li
                                        key={c.id}
                                        style={{
                                            borderLeft: "2px solid #243340",
                                            paddingLeft: 8,
                                        }}
                                    >
                                        <strong>{c.user}</strong>{" "}
                                        <span className="muted">
                                            · {new Date(c.created_at).toLocaleString()}
                                        </span>
                                        <div style={{ whiteSpace: "pre-wrap" }}>{c.text}</div>
                                    </li>
                                ))}

                                {comments.length === 0 && (
                                    <li className="muted">Seja o primeiro a comentar.</li>
                                )}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}


