// estado simples em memória (perde ao cold start)
export const state = {
    users: [
        { id: 1, username: "alice", followers: [], following: [] },
        { id: 2, username: "bob", followers: [], following: [] },
    ],
    nextUserId: 3,
    // usuário "logado" no mock (apenas para simplificar)
    currentUserId: 1,

    tweets: [
        { id: 1, userId: 1, text: "Olá Vercel!", likes: new Set([2]), created_at: new Date().toISOString() },
        { id: 2, userId: 2, text: "Primeiro tweet no mock!", likes: new Set(), created_at: new Date().toISOString() },
    ],
    nextTweetId: 3,

    comments: {
        // tweetId: [ { id, userId, text, created_at } ]
    },
    nextCommentId: 1,
};

export function userById(id) {
    return state.users.find(u => u.id === id);
}

export function publicUser(u) {
    return { id: u.id, username: u.username };
}

export function tweetDTO(t, meId) {
    const user = userById(t.userId);
    const likes_count = t.likes.size;
    const liked = t.likes.has(meId);
    const comments_count = (state.comments[t.id] || []).length;
    return {
        id: t.id,
        user: user?.username || "user",
        text: t.text,
        created_at: t.created_at,
        likes_count,
        comments_count,
        liked
    };
}
