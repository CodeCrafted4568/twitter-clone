import { useEffect, useState } from "react";
import api from "../services/api";

export default function TweetCard({ tweet, onLike }) {
    const [openComments, setOpenComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingC, setLoadingC] = useState(false);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    async function loadComments() {
        try {
            setLoadingC(true);
            const { data } = await api.get(`/api/tweets/${tweet.id}/comments/`);
            setComments(data);
        } finally {
            setLoadingC(false);
        }
    }

    useEffect(() => {
        if (openComments) loadComments();
    }, [openComments]);

    async function sendComment(e) {
        e.preventDefault();
        const payload = text.trim();
        if (!payload || sending) return;
        try {
            setSending(true);
            const { data } = await api.post(`/api/tweets/${tweet.id}/comments/`, { text: payload });
            setComments((c) => [...c, data]);
            setText("");
        } finally {
            setSending(false);
        }
    }

    return (
        <article className="tweet">
            <div className="tweet-body">
                <div className="tweet-head">
                    <strong>{tweet.user}</strong>
                    <span className="muted"> · {new Date(tweet.created_at).toLocaleString()}</span>
                </div>

                <div className="tweet-text">{tweet.text}</div>

                <div className="tweet-actions" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {/* Curtir (usa onLike de fora para atualizar contadores/estado) */}
                    <button className="icon-btn" onClick={onLike}>
                        {tweet.liked ? "♥" : "♡"} {tweet.likes_count ?? 0}
                    </button>

                    {/* Comentar */}
                    <button className="icon-btn" onClick={() => setOpenComments(v => !v)}>
                        💬 {tweet.comments_count ?? comments.length}
                    </button>
                </div>

                {openComments && (
                    <div className="comments" style={{ marginTop: 10 }}>
                        <form onSubmit={sendComment} style={{ display: "flex", gap: 8 }}>
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

                        {loadingC ? (
                            <p className="muted" style={{ marginTop: 8 }}>Carregando comentários…</p>
                        ) : (
                            <ul style={{ listStyle: "none", margin: 8, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                                {comments.map((c) => (
                                    <li key={c.id} style={{ borderLeft: "2px solid #243340", paddingLeft: 8 }}>
                                        <strong>{c.user}</strong>{" "}
                                        <span className="muted">· {new Date(c.created_at).toLocaleString()}</span>
                                        <div style={{ whiteSpace: "pre-wrap" }}>{c.text}</div>
                                    </li>
                                ))}
                                {comments.length === 0 && <li className="muted">Seja o primeiro a comentar.</li>}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
