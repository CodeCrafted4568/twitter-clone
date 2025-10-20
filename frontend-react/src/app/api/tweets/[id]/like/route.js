import { NextResponse } from "next/server";
import { state, tweetDTO } from "@/api/_state";

export async function POST(req, { params }) {
  const { id } = params;
  const tweet = state.tweets.find(t => t.id === parseInt(id));
  console.log("🔥 [/api/tweets/" + id + "/like] rota chamada");

  if (!tweet) {
    console.error("Tweet não encontrado");
    return NextResponse.json({ error: "Tweet não encontrado" }, { status: 404 });
  }

  const meId = state.currentUserId;
  if (tweet.likes.has(meId)) tweet.likes.delete(meId);
  else tweet.likes.add(meId);

  return NextResponse.json(tweetDTO(tweet, meId));
}
