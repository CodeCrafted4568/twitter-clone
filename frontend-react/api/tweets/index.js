import { state, tweetDTO } from "../_state.js";

export default async function handler(req, res) {
  // ============================================================
  // GET → lista todos os tweets
  // ============================================================
  if (req.method === "GET") {
    const tweets = state.tweets.map(tweetDTO);
    return res.status(200).json(tweets);
  }

  // ============================================================
  // POST → cria um novo tweet
  // ============================================================
  if (req.method === "POST") {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ detail: "Texto obrigatório" });
    }

    const userId = state.currentUserId;
    if (!userId) {
      return res.status(401).json({ detail: "Usuário não autenticado" });
    }

    const newTweet = {
      id: state.nextTweetId++,
      userId,
      text: text.trim(),
      likes: [],
      created_at: new Date().toISOString(),
    };

    // Novo tweet vai pro topo
    state.tweets.unshift(newTweet);

    // Retorna o tweet já formatado via DTO
    return res.status(201).json(tweetDTO(newTweet));
  }

  // ============================================================
  // Método não permitido
  // ============================================================
  return res.status(405).json({ detail: "Método não permitido" });
}
