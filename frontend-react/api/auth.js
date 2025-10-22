import { state } from "./_state.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { username } = req.body;
    const user = state.users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ detail: "Usuário não encontrado" });
    }

    return res.json({ access: "fake-token", user_id: user.id });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ detail: "Erro interno no servidor" });
  }
}
