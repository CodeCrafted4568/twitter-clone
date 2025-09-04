export default function TweetCard({ tweet, onLike }) {
    const user = tweet.user || tweet.author || {}
    return (
        <article className="tweet">
            <img className="avatar" src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username || "user"}`} alt="" />
            <div className="tweet-body">
                <header className="tweet-head">
                    <strong>{user.username || "User"}</strong>
                    <span className="muted">@{user.username || "user"} · {new Date(tweet.created_at).toLocaleTimeString()}</span>
                </header>

                <p className="tweet-text">{tweet.text}</p>

                {tweet.image_url && (
                    <div className="tweet-media">
                        <img src={tweet.image_url} alt="" />
                    </div>
                )}

                <footer className="tweet-actions">
                    <button className="icon-btn" onClick={onLike}>
                        ❤️ {tweet.likes_count ?? 0}
                    </button>
                </footer>
            </div>
        </article>
    )
}
