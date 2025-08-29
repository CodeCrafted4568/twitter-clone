import { useEffect, useRef, useState } from "react"
import api from "../services/api"

export default function SignupModal({ open, onClose, onSuccess }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const firstFieldRef = useRef(null)

    // foco ao abrir
    useEffect(() => { if (open) setTimeout(() => firstFieldRef.current?.focus(), 0) }, [open])

    if (!open) return null

    const disabled = !username || !password || password !== confirm || loading

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        if (disabled) return
        try {
            setLoading(true)
            // cria usuário
            await api.post("/api/auth/register/", { username, password })
            // loga direto
            const { data } = await api.post("/api/auth/token/", { username, password })
            localStorage.setItem("token", data.access)
            onSuccess?.()   // ex.: navega para /home
        } catch (err) {
            setError("Não foi possível criar a conta. Tente um usuário diferente.")
        } finally {
            setLoading(false)
        }
    }

    function onBackdrop(e) {
        // fecha ao clicar fora do card
        if (e.target.classList.contains("modal-overlay")) onClose?.()
    }

    return (
        <div className="modal-overlay" onMouseDown={onBackdrop} role="presentation">
            <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="signup-title">
                <button className="modal-close" aria-label="Fechar" onClick={onClose}>×</button>

                <div className="modal-header">
                    <img src={x} alt="X" className="modal-logo" />
                </div>

                <h3 id="signup-title" className="modal-title">Criar sua conta</h3>

                <form onSubmit={handleSubmit} className="modal-form">
                    <input
                        ref={firstFieldRef}
                        placeholder="Usuário"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirmar senha"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                    />

                    {error && <p className="form-error">{error}</p>}

                    <button className={`btn btn-primary modal-submit ${disabled ? "btn-disabled" : ""}`} disabled={disabled}>
                        {loading ? "Enviando..." : "Avançar"}
                    </button>
                </form>
            </div>
        </div>
    )
}
