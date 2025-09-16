import Composer from "./Composer";
import TweetCard from "./TweetCard";

export default function Feed({ me, tweets, loading, onPost, onLike, onUnlike }) {
    return (
        <div>
            {me && <Composer me={me} onPost={onPost} />}

            {loading && <div className="skeleton" style={{ marginTop: 12 }}>Carregando…</div>}

            {tweets.length > 0 ? (
                <ul className="tweet-list">
                    {tweets.map((t) => (
                        <li key={t.id}>
                            <TweetCard
                                tweet={t}
                                onLike={() => (t.liked ? onUnlike(t.id) : onLike(t.id))}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <p style={{ textAlign: "center", color: "#8ecdf7", marginTop: 20 }}>
                    Siga alguns perfis para ver os tweets aqui.
                </p>
            )}
        </div>
    );
}
