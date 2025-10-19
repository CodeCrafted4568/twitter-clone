// src/api/tweets/[id]/comments.js
import { state } from "../../_state";

export default function handler(req, res) {
    const meId = state.currentUserId;
    const id = parseInt(req.query.id, 10);
    const t = state.tweets.find(x => x.id === id);
    if (!t) return res.status(404).json({ detail: "not found" });

    // Garante estrutura de comentários
    if (!state.comments[id]) {
        state.comments[id] = [];
    }

    if (req.method === "GET") {
        const list = state.comments[id];
        return res.json(list.map(c => ({
            id: c.id,
            user: state.users.find(u => u.id === c.userId)?.username || "user",
            text: c.text,
            created_at: c.created_at
        })));
    }

    if (req.method === "POST") {
        const { text } = req.body || {};
        if (!text?.trim()) return res.status(400).json({ detail: "texto obrigatório" });
        const c = {
            id: state.nextCommentId++,
            userId: meId,
            text: String(text),
            created_at: new Date().toISOString()
        };
        state.comments[id].unshift(c); // adiciona no início
        return res.status(201).json({
            id: c.id,
            user: state.users.find(u => u.id === c.userId)?.username || "user",
            text: c.text,
            created_at: c.created_at
        });
    }

    return res.status(405).end();
}
