import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";
import perfilIcon from "../assets/perfil.png";
import "../styles/ProfileModal.css";
import { useUser } from "../components/UserContext";

export default function ProfileModal({ open, onClose }) {
    const { me, refreshUser } = useUser();
    const [username, setUsername] = useState("");
    const [initialUsername, setInitialUsername] = useState("");
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState(null); // File
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const firstRef = useRef(null);

    // carrega dados atuais ao abrir
    useEffect(() => {
        if (!open || !me) return;

        setUsername(me.username || "");
        setInitialUsername(me.username || "");
        setPreview(me.avatar_url ? `${me.avatar_url}?t=${Date.now()}` : "");
    }, [open, me]);

    // foco inicial + trava scroll
    useEffect(() => {
        if (open) setTimeout(() => firstRef.current?.focus(), 0);
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    // cleanup/volta ao default ao fechar
    useEffect(() => {
        if (!open) {
            setUsername("");
            setInitialUsername("");
            setPassword("");
            setAvatar(null);
            setPreview("");
            setError("");
            setLoading(false);
        }
    }, [open]);

    // libera URL de preview quando trocar/fechar
    useEffect(() => {
        return () => {
            if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    if (!open) return null;

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) {
            setAvatar(null);
            return;
        }
        // validaçãozinha básica (ajuste se quiser)
        if (!file.type.startsWith("image/")) {
            setError("Escolha uma imagem.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError("Imagem até 2MB, por favor.");
            return;
        }
        setError("");
        setAvatar(file);
        const url = URL.createObjectURL(file);
        setPreview(url);
    }

    const isDirty =
        (username?.trim() && username.trim() !== initialUsername) ||
        !!password ||
        !!avatar;

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (!isDirty) return;
        try {
            setLoading(true);
            const fd = new FormData();
            if (username?.trim() && username.trim() !== initialUsername)
                fd.append("username", username.trim());
            if (password) fd.append("password", password);
            if (avatar) fd.append("profile.avatar", avatar);

            // atualização parcial
            await api.patch("users/me/", fd, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // Atualiza o contexto SEM deixar erro vazar
            try {
                await refreshUser();
            } catch (refreshErr) {
                console.warn("Falha ao atualizar contexto, mas PATCH funcionou:", refreshErr);
            }

            // fecha modal
            onClose?.();


        } catch (err) {
            console.log("Erro real:", err);
            const data = err?.response?.data;
            const msg =
                data?.detail ||
                data?.username?.[0] ||
                data?.password?.[0] ||
                "Não foi possível atualizar o perfil.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    function handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem("token");
        try {
            delete api.defaults.headers.common.Authorization;
        } catch { }
        onClose?.();
        const target = import.meta.env.VITE_LOGOUT_REDIRECT || "/";
        window.location.assign(target);
    }

    const fileName = avatar?.name || "Nenhum arquivo escolhido";

    return createPortal(
        <div
            className="modal-overlay"
            role="presentation"
            onKeyDown={(e) => {
                if (e.key === "Escape") onClose?.();
            }}
            onMouseDown={(e) => {
                if (e.target.classList.contains("modal-overlay")) onClose?.();
            }}
        >
            <div
                className="modal-card modal-light"
                role="dialog"
                aria-modal="true"
                aria-labelledby="profile-title"
            >
                <button className="modal-close" onClick={onClose}>
                    ×
                </button>

                <h3 id="profile-title" className="modal-title">
                    Editar Perfil
                </h3>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="upload-row">
                        <img src={preview || perfilIcon} alt="Avatar" className="avatar lg" />

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
                                <span className="file-name" title={fileName}>
                                    {fileName}
                                </span>
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

                    <button className="modal-submit" disabled={loading || !isDirty}>
                        {loading ? "Salvando..." : "Salvar alterações"}
                    </button>

                    <div className="logout-row">
                        <button type="button" className="link-logout" onClick={handleLogout}>
                            Sair da conta
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
