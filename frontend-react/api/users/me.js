import { state, publicUser } from "../_state.js";

export default function handler(req, res) {
  try {
    const me = state.users.find((u) => u.id === state.currentUserId);
    if (!me) {
      return res.status(401).json({ detail: "Usuário não autenticado" });
    }

    // Compatível com seu ProfileModal (avatar pode ser null)
    return res.status(200).json({ ...publicUser(me), avatar_url: null });
  } catch (err) {
    console.error("Erro ao buscar usuário atual:", err);
    return res.status(500).json({ detail: "Erro interno do servidor" });
  }
}
