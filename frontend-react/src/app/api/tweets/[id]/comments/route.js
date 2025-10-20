import { NextResponse } from "next/server";
import { state } from "@/api/_state";

export async function GET(_req, { params }) {
  try {
    const id = parseInt(params.id);
    const comments = state.comments[id] || [];
    return NextResponse.json(comments);
  } catch (err) {
    console.error("Erro no GET /api/tweets/[id]/comments:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const id = parseInt(params.id);
    const tweet = state.tweets.find(t => t.id === id);
    if (!tweet) {
      return NextResponse.json({ error: "Tweet não encontrado" }, { status: 404 });
    }

    const { text } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Texto obrigatório" }, { status: 400 });
    }

    const comment = {
      id: state.nextCommentId++,
      userId: state.currentUserId,
      text,
      created_at: new Date().toISOString(),
    };

    if (!state.comments[id]) state.comments[id] = [];
    state.comments[id].push(comment);

    return NextResponse.json(comment);
  } catch (err) {
    console.error("Erro no POST /api/tweets/[id]/comments:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
