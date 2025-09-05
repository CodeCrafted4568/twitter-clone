import { state, tweetDTO } from "./_state";

export default function handler(req, res) {
    const meId = state.currentUserId;

    if (req.method === "GET") {
        // feed: somente de quem sigo (igual seu comportamento atual)
        const me = state.users.find(u => u.id === meId);
        const feedIds = new Set([meId, ...me.following]);
        const data = state.tweets
            .filter(t => feedIds.has(t.userId))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map(t => tweetDTO(t, meId));
        return res.json(data);
    }

    if (req.method === "POST") {
        const { text } = req.body || {};
        if (!text?.trim()) return res.status(400).json({ detail: "texto obrigatório" });
        const t = {
            id: state.nextTweetId++,
            userId: meId,
            text: String(text),
            likes: new Set(),
            created_at: new Date().toISOString(),
        };
        state.tweets.unshift(t);
        return res.status(201).json(tweetDTO(t, meId));
    }

    return res.status(405).end();
}
