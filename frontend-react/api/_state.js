// 🔹 Estado global simulado (mock em memória — some ao reiniciar)
export const state = {
  users: [
    { id: 1, username: "alice", followers: [], following: [] },
    { id: 2, username: "bob", followers: [], following: [] },
  ],
  nextUserId: 3,

  // Usuário logado no mock
  currentUserId: 1,

  // Tweets com likes como arrays (compatível com includes/filter)
  tweets: [
    {
      id: 1,
      userId: 1,
      text: "Olá Vercel!",
      likes: [2], // IDs de usuários que curtiram
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      userId: 2,
      text: "Primeiro tweet no mock!",
      likes: [],
      created_at: new Date().toISOString(),
    },
  ],
  nextTweetId: 3,

  // Comentários organizados por tweetId
  comments: {
    1: [
      {
        id: 1,
        tweetId: 1,
        userId: 2,
        text: "Show!",
        created_at: new Date().toISOString(),
      },
    ],
  },
  nextCommentId: 2,
};

// ============================================================
// 🔹 Funções utilitárias
// ============================================================

// Retorna usuário completo (sem filtrar campos)
export function getUser(id) {
  return state.users.find((u) => u.id === id) || null;
}

// Retorna dados públicos de um usuário
export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    followers: u.followers || [],
    following: u.following || [],
  };
}

// Retorna usuário pelo ID (já formatado publicamente)
export function userById(id) {
  return publicUser(getUser(id));
}

// Retorna DTO (objeto) de um tweet formatado
export function tweetDTO(t) {
  const user = userById(t.userId);
  const commentsCount = (state.comments[t.id] || []).length;
  return {
    id: t.id,
    text: t.text,
    user,
    created_at: t.created_at,
    likes_count: t.likes.length,
    comments_count: commentsCount,
    liked: t.likes.includes(state.currentUserId),
  };
}
