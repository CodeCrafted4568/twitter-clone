import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import SignupModal from "../components/SignupModal"

export default function Login() {
  const nav = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false) // <-- modal de cadastro

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    try {
      const { data } = await api.post("/api/auth/token/", { username, password })
      localStorage.setItem("token", data.access)
      nav("/home")
    } catch {
      setError("Usuário ou senha inválidos")
    }
  }

  return (
    <>
      <div style={{ maxWidth: 420, margin: "80px auto", padding: 24 }}>
        <h2>Entrar</h2>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary">Entrar</button>
          {error && <p className="muted" style={{ color: "#f00" }}>{error}</p>}
        </form>

        <p className="muted" style={{ marginTop: 16 }}>
          Não tem conta?
          {" "}
          <button
            type="button"
            className="linklike"         // opcional: estilize como link
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
          >
            Criar
          </button>
        </p>
      </div>

      {/* Modal de cadastro */}
      <SignupModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => nav("/home")}
      />
    </>
  )
}
