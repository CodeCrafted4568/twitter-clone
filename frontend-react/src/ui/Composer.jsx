import { useState } from "react";

export default function Composer({ me, onPost }) {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        const payload = text.trim();
        if (!payload || sending) return;
        try {
            setSending(true);
            await onPost(payload);
            setText("");
        } finally {
            setSending(false);
        }
    }

    function handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
        }
    }

    return (
        <form className="composer" onSubmit={handleSubmit}>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="O que está acontecendo?"
                rows={3}
            />
            <div className="composer-actions">
                <button
                    type="submit"
                    className="mini"
                    disabled={!text.trim() || sending}
                >
                    {sending ? "Enviando..." : "Tweetar"}
                </button>
            </div>
        </form>
    );
}
