import { state } from "../../_state.js";

export default function handler(req, res) {
  const tweetId = parseInt(req.query.id, 10);
  const tweet = state.tweets.find(t => t.id === tweetId);

  if (!tweet) return res.status(404).json({ detail: "Tweet não encontrado" });
  if (req.method !== "POST") return res.status(405).end();

  const userId = state.currentUserId;
  if (!userId) return res.status(401).json({ detail: "Usuário não autenticado" });

  if (!Array.isArray(tweet.likes)) tweet.likes = [];

  // Remove o like do usuário, se existir
  tweet.likes = tweet.likes.filter(id => id !== userId);

  res.status(200).json({ likes: tweet.likes.length });
}
