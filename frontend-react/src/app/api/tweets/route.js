import { NextResponse } from "next/server";
import { state, tweetDTO } from "@/api/_state";

export async function GET() {
  console.log("🔥 [/api/tweets] rota GET chamada");
  const tweets = state.tweets.map(t => tweetDTO(t, state.currentUserId));
  return NextResponse.json({ tweets });
}

export async function POST(req) {
  console.log("🔥 [/api/tweets] rota POST chamada");
  const data = await req.json();
  const { text } = data;

  if (!text) {
    console.error("Texto do tweet ausente");
    return NextResponse.json({ error: "Texto é obrigatório" }, { status: 400 });
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
}
