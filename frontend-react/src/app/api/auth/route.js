import { NextResponse } from "next/server";
import { state, publicUser } from "@/api/_state";

export async function GET() {
  console.log("🔥 ROTA /api/auth chamada");

  const me = state.users.find(u => u.id === state.currentUserId);
  if (!me) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    me: publicUser(me),
    message: "Auth endpoint ativo e retornando usuário mockado"
  });
}
