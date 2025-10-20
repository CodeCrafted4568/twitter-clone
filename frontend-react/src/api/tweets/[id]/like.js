import { state, tweetDTO } from "../../_state";

export default function handler(req, res) {
    try {
        const meId = state.currentUserId;
        const id = parseInt(req.query.id, 10);
        const t = state.tweets.find(x => x.id === id);
        if (!t) return res.status(404).json({ detail: "Tweet não encontrado" });

        // Garante array
        if (!Array.isArray(t.likes)) t.likes = [];

        if (req.method === "POST") {
            if (!t.likes.includes(meId)) t.likes.push(meId);
            return res.status(200).json({ status: "liked", ...tweetDTO(t, meId) });
        }

        if (req.method === "DELETE") {
            t.likes = t.likes.filter(uid => uid !== meId);
            return res.status(200).json({ status: "unliked", ...tweetDTO(t, meId) });
        }

        return res.status(405).json({ detail: "Método não permitido" });
    } catch (err) {
        console.error("Erro em /like:", err);
        return res.status(500).json({ detail: "Erro interno no like", error: String(err) });
    }
}
