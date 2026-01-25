import { state, publicUser } from "../_state.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { username } = req.body || {};
    if (!username || username.trim() === "") {
      return res.status(400).json({ detail: "Nome de usuário é obrigatório" });
    }

    // Evita duplicar nomes (case-insensitive)
    const exists = state.users.some(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ detail: "Usuário já existe" });
    }

    // Cria novo usuário mock
    const newUser = {
      id: state.nextUserId++,
      username: username.trim(),
      followers: [],
      following: [],
    };
    state.users.push(newUser);

    // Retorna dados públicos
    return res.status(201).json(publicUser(newUser));
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
    return res.status(500).json({ detail: "Erro interno do servidor" });
  }
}
