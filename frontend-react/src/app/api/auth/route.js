import { NextResponse } from "next/server";
import { state, publicUser } from "@/api/_state";

export async function GET() {
  console.log("🔥 [/api/auth] rota acessada");
  const me = state.users.find(u => u.id === state.currentUserId);

  if (!me) {
    console.error("Usuário mock não encontrado");
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    me: publicUser(me),
    message: "Auth ativo",
  });
}
