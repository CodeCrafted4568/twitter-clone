import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import api from "../services/api"
import x from "../assets/x.svg"

export default function LoginModal({ open, onClose, onSuccess, onOpenSignup }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const firstRef = useRef(null)

    // foco + trava scroll
    useEffect(() => {
        if (open) setTimeout(() => firstRef.current?.focus(), 0)
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    // 🔄 resetar quando fechar
    useEffect(() => {
        if (!open) {
            setUsername("")
            setPassword("")
            setError("")
            setLoading(false)
        }
    }, [open])

    if (!open) return null

    function handleClose() {
        // também zera ao clicar no X ou fora
        setUsername("")
        setPassword("")
        setError("")
        setLoading(false)
        onClose?.()
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        if (!username || !password) return
        try {
            setLoading(true)
            const { data } = await api.post("/api/auth/token/", { username, password })
            localStorage.setItem("token", data.access)
            onSuccess?.()
        } catch {
            setError("Usuário ou senha inválidos.")
        } finally {
            setLoading(false)
        }
    }

    return createPortal(
        <div className="modal-overlay" role="presentation"
            onMouseDown={(e) => { if (e.target.classList.contains("modal-overlay")) handleClose() }}>
            <div className="modal-card modal-light" role="dialog" aria-modal="true" aria-labelledby="login-title">
                <button type="button" className="modal-close" aria-label="Fechar" onClick={handleClose}>×</button>

                <div className="modal-header"><img src={x} alt="X" className="modal-logo" /></div>
                <h3 id="login-title" className="modal-title">Entrar no X</h3>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <input ref={firstRef} placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} />
                    <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
                    {error && <p className="form-error">{error}</p>}

                    <button
                        className="btn btn-primary modal-submit"
                        disabled={loading || !username || !password}
                    >
                        {loading ? "Entrando..." : "Avançar"}
                    </button>


                </form>

                <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>
                    Não tem uma conta?{" "}
                    <button type="button" className="linklike"
                        onClick={() => { handleClose(); onOpenSignup?.() }}>
                        Inscreva-se
                    </button>
                </p>
            </div>
        </div>,
        document.body
    )
}
