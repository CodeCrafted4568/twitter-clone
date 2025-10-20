import { NextResponse } from "next/server";
import { state } from "../_state";

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    const user = state.users.find(u => u.username === username);

    if (!user) {
      return NextResponse.json(
        { detail: "Usuário ou senha inválidos" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      access: "fake-token",
      user_id: user.id,
    });
  } catch (err) {
    console.error("Erro em /api/auth:", err);
    return NextResponse.json(
      { detail: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
