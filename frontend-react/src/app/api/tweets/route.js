import { NextResponse } from "next/server";
import { state, tweetDTO } from "@/api/_state";

export async function GET() {
  const tweets = state.tweets.map(t => tweetDTO(t, state.currentUserId));
  return NextResponse.json(tweets);
}

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Texto obrigatório" }, { status: 400 });
    }

    const newTweet = {
      id: state.nextTweetId++,
      userId: state.currentUserId,
      text,
      likes: new Set(),
      created_at: new Date().toISOString(),
    };

    state.tweets.unshift(newTweet);
    return NextResponse.json(tweetDTO(newTweet, state.currentUserId));
  } catch (err) {
    console.error("Erro no POST /api/tweets:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
