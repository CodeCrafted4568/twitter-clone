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
                className="composer-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onInput={(e) => {
                    // auto-expand até 140px, igual o Twitter
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                }}
                placeholder="O que está acontecendo?"
                rows={1}
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
