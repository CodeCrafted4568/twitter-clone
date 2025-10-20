import { NextResponse } from "next/server";
import { state, tweetDTO } from "@/api/_state";

export async function POST(req, { params }) {
  try {
    const id = parseInt(params.id);
    const tweet = state.tweets.find(t => t.id === id);
    if (!tweet) {
      return NextResponse.json({ error: "Tweet não encontrado" }, { status: 404 });
    }

    const userId = state.currentUserId;
    if (tweet.likes.has(userId)) {
      tweet.likes.delete(userId);
    } else {
      tweet.likes.add(userId);
    }

    return NextResponse.json(tweetDTO(tweet, userId));
  } catch (err) {
    console.error("Erro em POST /api/tweets/[id]/like:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
