import { state } from "../../_state";

export default function handler(req, res) {
    try {
        const meId = state.currentUserId;
        const id = parseInt(req.query.id, 10);
        const t = state.tweets.find(x => x.id === id);
        if (!t) return res.status(404).json({ detail: "Tweet não encontrado" });

        if (!state.comments[id]) state.comments[id] = [];

        if (req.method === "GET") {
            const list = state.comments[id].map(c => ({
                id: c.id,
                user: state.users.find(u => u.id === c.userId)?.username || "user",
                text: c.text,
                created_at: c.created_at,
            }));
            return res.status(200).json(JSON.parse(JSON.stringify(list)));
        }

        if (req.method === "POST") {
            const { text } = req.body || {};
            if (!text?.trim()) return res.status(400).json({ detail: "Texto obrigatório" });

            const c = {
                id: state.nextCommentId++,
                userId: meId,
                text: text.trim(),
                created_at: new Date().toISOString(),
            };
            state.comments[id].unshift(c);

            const safeComment = JSON.parse(JSON.stringify({
                id: c.id,
                user: state.users.find(u => u.id === c.userId)?.username || "user",
                text: c.text,
                created_at: c.created_at,
            }));

            return res.status(201).json(safeComment);
        }

        return res.status(405).json({ detail: "Método não permitido" });
    } catch (err) {
        console.error("Erro em /comments:", err);
        return res.status(500).json({ detail: "Erro interno nos comentários", error: String(err) });
    }
}
