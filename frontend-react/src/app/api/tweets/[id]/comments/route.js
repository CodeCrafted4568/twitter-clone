import { NextResponse } from "next/server";
import { state } from "../../../../_state";

export async function GET(req, { params }) {
  const id = parseInt(params.id, 10);
  const t = state.tweets.find(x => x.id === id);
  if (!t) return NextResponse.json({ detail: "not found" }, { status: 404 });
  const list = state.comments[id] || [];
  const comments = list.map(c => ({
    id: c.id,
    user: state.users.find(u => u.id === c.userId)?.username || "user",
    text: c.text,
    created_at: c.created_at
  }));
  return NextResponse.json(comments);
}

export async function POST(req, { params }) {
  const id = parseInt(params.id, 10);
  const { text } = await req.json();
  const meId = state.currentUserId;
  if (!text?.trim()) return NextResponse.json({ detail: "texto obrigatório" }, { status: 400 });
  const c = { id: state.nextCommentId++, userId: meId, text, created_at: new Date().toISOString() };
  state.comments[id] = [c, ...(state.comments[id] || [])];
  return NextResponse.json({
    id: c.id,
    user: state.users.find(u => u.id === c.userId)?.username || "user",
    text: c.text,
    created_at: c.created_at
  }, { status: 201 });
}
