import { state, userById } from "../../_state.js";

export default function handler(req, res) {
    const me = userById(state.currentUserId);
    const targetId = parseInt(req.query.id, 10);
    const target = userById(targetId);
    if (!target) return res.status(404).json({ detail: "not found" });

    if (req.method !== "POST") return res.status(405).end();
    if (me.id === target.id) return res.status(400).json({ detail: "Você não pode seguir a si mesmo." });

    if (!me.following.includes(targetId)) me.following.push(targetId);
    if (!target.followers.includes(me.id)) target.followers.push(me.id);

    res.json({ status: "following" });
}
