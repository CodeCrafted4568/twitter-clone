import { NextResponse } from "next/server";
import { state, tweetDTO } from "../../../../_state";

export async function POST(req, { params }) {
  const id = parseInt(params.id, 10);
  const meId = state.currentUserId;
  const t = state.tweets.find(x => x.id === id);
  if (!t) return NextResponse.json({ detail: "not found" }, { status: 404 });
  t.likes.add(meId);
  return NextResponse.json({ status: "liked", ...tweetDTO(t, meId) });
}

export async function DELETE(req, { params }) {
  const id = parseInt(params.id, 10);
  const meId = state.currentUserId;
  const t = state.tweets.find(x => x.id === id);
  if (!t) return NextResponse.json({ detail: "not found" }, { status: 404 });
  t.likes.delete(meId);
  return NextResponse.json({ status: "unliked", ...tweetDTO(t, meId) });
}
