import { useEffect, useRef, useState } from "react"
import api from "../services/api"
import x from "../assets/x.svg"

export default function SignupModal({ open, onClose, onSuccess }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const firstFieldRef = useRef(null)

    // Foco ao abrir
    useEffect(() => {
        if (open) {
            setTimeout(() => firstFieldRef.current?.focus(), 0)
        }
    }, [open])

    // Resetar inputs ao fechar
    useEffect(() => {
        if (!open) {
            setUsername("")
            setPassword("")
            setConfirm("")
            setError("")
            setLoading(false)
        }
    }, [open])

    if (!open) return null

    const disabled = !username || !password || password !== confirm || loading

    async function handleSubmit(e) {
        e.preventDefault()
        if (disabled) return
        setError("")
        try {
            setLoading(true)
            await api.post("/api/register/", { username, password })
            const { data } = await api.post("/api/auth/token/", { username, password })
            localStorage.setItem("token", data.access)
            onSuccess?.()
        } catch (err) {
            setError("Não foi possível criar a conta. Tente um usuário diferente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target.classList.contains("modal-overlay") && onClose?.()}>
            <div className="modal-card" role="dialog">
                <button className="modal-close" onClick={onClose}>×</button>
                <div className="modal-header">
                    <img src={x} alt="X" className="modal-logo" />
                </div>
                <h3 className="modal-title">Criar sua conta</h3>

                <form onSubmit={handleSubmit} className="modal-form">
                    <input ref={firstFieldRef} placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <input type="password" placeholder="Confirmar senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                    {error && <p className="form-error">{error}</p>}
                    <button className={`btn btn-primary modal-submit ${disabled ? "btn-disabled" : ""}`} disabled={disabled}>
                        {loading ? "Enviando..." : "Avançar"}
                    </button>
                </form>
            </div>
        </div>
    )
}
