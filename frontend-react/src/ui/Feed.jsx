import { useState } from "react"
import TweetCard from "./TweetCard"

export default function Feed({ me, tweets, loading, onPost, onLike, onUnlike }) {
    const [text, setText] = useState("")

    function submit(e) { e.preventDefault(); onPost(text); setText("") }

    return (
        <>
            <form className="composer" onSubmit={submit}>
                <textarea
                    placeholder="O que está acontecendo?"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={3}
                />
                <div className="composer-actions">
                    <button type="submit" className="btn btn-primary" disabled={!text.trim()}>
                        Tweetar
                    </button>
                </div>
            </form>

            {loading && <div className="skeleton">Carregando…</div>}

            <ul className="tweet-list">
                {tweets.map(t => (
                    <li key={t.id}>
                        <TweetCard
                            tweet={t}
                            onLike={() => t.liked ? onUnlike(t.id) : onLike(t.id)}
                        />
                    </li>
                ))}
            </ul>
        </>
    )
}
