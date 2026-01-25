import { state, userById } from "../../_state.js";

export default function handler(req, res) {
  const tweetId = parseInt(req.query.id, 10);
  const tweet = state.tweets.find(t => t.id === tweetId);

  if (!tweet) return res.status(404).json({ detail: "Tweet não encontrado" });
  if (req.method !== "POST") return res.status(405).json({ detail: "Método não permitido" });

  const userId = state.currentUserId;
  if (!userId) return res.status(401).json({ detail: "Usuário não autenticado" });

  // Alternar like / dislike
  if (tweet.likes.includes(userId)) {
    tweet.likes = tweet.likes.filter(id => id !== userId); // remove
  } else {
    tweet.likes.push(userId); // adiciona
  }

  res.status(200).json({
    tweetId,
    like_count: tweet.likes.length,
    liked: tweet.likes.includes(userId),
    user: userById(tweet.userId),
  });
}
