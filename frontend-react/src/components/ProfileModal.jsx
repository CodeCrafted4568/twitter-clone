import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";
import perfilIcon from "../assets/perfil.png";
import "../styles/ProfileModal.css"; // ⟵ ADICIONE ISSO

export default function ProfileModal({ open, onClose }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState(null); // file
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const firstRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        (async () => {
            try {
                const { data } = await api.get("/api/users/me/");
                setUsername(data.username || "");
                setPreview(data.avatar_url || "");
            } catch { }
        })();
    }, [open]);

    useEffect(() => {
        if (open) setTimeout(() => firstRef.current?.focus(), 0);
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    useEffect(() => {
        if (!open) {
            setUsername("");
            setPassword("");
            setAvatar(null);
            setPreview("");
            setError("");
            setLoading(false);
        }
    }, [open]);

    if (!open) return null;

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        } else {
            setAvatar(null);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            setLoading(true);
            const fd = new FormData();
            if (username?.trim()) fd.append("username", username.trim());
            if (password) fd.append("password", password);
            if (avatar) fd.append("avatar", avatar);
            await api.put("/api/users/me/", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            onClose?.();
            window.location.reload();
        } catch (err) {
            setError("Não foi possível atualizar perfil.");
        } finally {
            setLoading(false);
        }
    }

    const fileName = avatar?.name || "Nenhum arquivo escolhido";

    return createPortal(
        <div
            className="modal-overlay"
            role="presentation"
            onMouseDown={(e) => {
                if (e.target.classList.contains("modal-overlay")) onClose?.();
            }}
        >
            <div className="modal-card modal-light" role="dialog" aria-modal="true">
                <button className="modal-close" onClick={onClose}>×</button>

                <h3 className="modal-title">Editar Perfil</h3>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="upload-row">
                        <img
                            src={preview || perfilIcon}
                            alt="Avatar"
                            className="avatar lg"
                        />

                        <div>
                            <input
                                id="profile-photo"
                                type="file"
                                accept="image/*"
                                className="file-input"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="profile-photo" className="file-label">
                                <span className="file-label-text">Escolher arquivo</span>
                                <span className="file-sep">•</span>
                                <span className="file-name" title={fileName}>{fileName}</span>
                            </label>
                        </div>
                    </div>

                    <input
                        ref={firstRef}
                        placeholder="Novo nome de usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Nova senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p className="form-error">{error}</p>}

                    <button
                        className="modal-submit"
                        disabled={loading || (!username && !password && !avatar)}
                    >
                        {loading ? "Salvando..." : "Salvar alterações"}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
}
