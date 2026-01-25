import { state } from "../../_state.js";

export default function handler(req, res) {
  const tweetId = parseInt(req.query.id, 10);
  if (req.method !== "DELETE") return res.status(405).end();

  const userId = state.currentUserId;
  if (!userId) return res.status(401).json({ detail: "Usuário não autenticado" });

  const tweetIndex = state.tweets.findIndex(t => t.id === tweetId);
  if (tweetIndex === -1) return res.status(404).json({ detail: "Tweet não encontrado" });

  const tweet = state.tweets[tweetIndex];
  if (tweet.userId !== userId) {
    return res.status(403).json({ detail: "Você não pode deletar este tweet" });
  }

  // Remove tweet
  state.tweets.splice(tweetIndex, 1);

  // Remove comentários vinculados
  delete state.comments[tweetId];

  res.status(204).end();
}
