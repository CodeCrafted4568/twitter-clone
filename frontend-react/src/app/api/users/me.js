import { state, publicUser } from "../_state";

export default function handler(req, res) {
    const u = state.users.find(x => x.id === state.currentUserId);
    if (!u) return res.status(401).json({ detail: "not auth" });

    // compatível com seu ProfileModal: avatar_url pode ser null
    res.json({ ...publicUser(u), avatar_url: null });
}
