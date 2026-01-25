import { state, userById } from "../../_state.js";

export default function handler(req, res) {
  const tweetId = parseInt(req.query.id, 10);
  const tweet = state.tweets.find(t => t.id === tweetId);

  if (!tweet) return res.status(404).json({ detail: "Tweet não encontrado" });
  if (!state.comments[tweetId]) state.comments[tweetId] = [];

  if (req.method === "GET") {
    // Lista todos os comentários, incluindo o autor
    const comments = state.comments[tweetId].map(c => ({
      ...c,
      user: userById(c.userId),
    }));
    return res.status(200).json(comments);
  }

  if (req.method === "POST") {
    const { text } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ detail: "Texto obrigatório" });
    }

    const userId = state.currentUserId;
    if (!userId) return res.status(401).json({ detail: "Usuário não autenticado" });

    const newComment = {
      id: state.nextCommentId++,
      tweetId,
      userId,
      text: text.trim(),
      created_at: new Date().toISOString(),
    };

    state.comments[tweetId].push(newComment);

    return res.status(201).json({
      ...newComment,
      user: userById(userId),
    });
  }

  return res.status(405).json({ detail: "Método não permitido" });
}
