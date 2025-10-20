import { NextResponse } from "next/server";
import { state, userById } from "@/api/_state";

export async function GET(req, { params }) {
  const { id } = params;
  console.log("🔥 [/api/tweets/" + id + "/comments] rota GET chamada");

  const list = state.comments[id] || [];
  return NextResponse.json({ comments: list });
}

export async function POST(req, { params }) {
  const { id } = params;
  const { text } = await req.json();
  console.log("🔥 [/api/tweets/" + id + "/comments] rota POST chamada");

  if (!text) return NextResponse.json({ error: "Texto é obrigatório" }, { status: 400 });

  const comment = {
    id: state.nextCommentId++,
    userId: state.currentUserId,
    text,
    created_at: new Date().toISOString(),
  };

  if (!state.comments[id]) state.comments[id] = [];
  state.comments[id].push(comment);

  return NextResponse.json({
    id: comment.id,
    user: userById(comment.userId)?.username || "user",
    text: comment.text,
    created_at: comment.created_at,
  });
}
