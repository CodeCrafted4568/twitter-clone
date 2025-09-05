import { state, tweetDTO } from "../../_state";

export default function handler(req, res) {
    const meId = state.currentUserId;
    const id = parseInt(req.query.id, 10);
    const t = state.tweets.find(x => x.id === id);
    if (!t) return res.status(404).json({ detail: "not found" });

    if (req.method === "POST") {
        t.likes.add(meId);
        return res.json({ status: "liked", ...tweetDTO(t, meId) });
    }
    if (req.method === "DELETE") {
        t.likes.delete(meId);
        return res.json({ status: "unliked", ...tweetDTO(t, meId) });
    }
    return res.status(405).end();
}
