import { state } from "../_state";

export default function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();
    const { username, password } = req.body || {};
    const u = state.users.find(x => x.username === username);
    if (!u) return res.status(401).json({ detail: "Usuário ou senha inválidos" });

    // token fake + userId
    return res.json({ access: "fake-token", user_id: u.id });
}
