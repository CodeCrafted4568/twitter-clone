import { state, publicUser } from "./_state";

export default function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ detail: "username e password são obrigatórios" });

    if (state.users.some(u => u.username.toLowerCase() === String(username).toLowerCase())) {
        return res.status(400).json({ username: ["Um usuário com este nome de usuário já existe."] });
    }

    const u = { id: state.nextUserId++, username: String(username), followers: [], following: [] };
    state.users.push(u);

    // no front você salva token; aqui devolvemos um dummy
    return res.status(201).json(publicUser(u));
}
