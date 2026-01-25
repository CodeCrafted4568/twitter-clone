import { state, userById } from "../../_state.js";

export default function handler(req, res) {
    const me = userById(state.currentUserId);
    const targetId = parseInt(req.query.id, 10);
    const target = userById(targetId);
    if (!target) return res.status(404).json({ detail: "not found" });

    if (req.method !== "POST") return res.status(405).end();

    me.following = me.following.filter(x => x !== targetId);
    target.followers = target.followers.filter(x => x !== me.id);

    res.json({ status: "unfollowed" });
}
