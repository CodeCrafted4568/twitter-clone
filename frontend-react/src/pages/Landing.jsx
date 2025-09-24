import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import x from '../assets/x.svg'
import SignupModal from '../components/SignupModal.jsx'
import LoginModal from '../components/LoginModal.jsx'

export default function Landing() {
  const nav = useNavigate()
  const [openSignup, setOpenSignup] = useState(false)
  const [openLogin, setOpenLogin] = useState(false)

  const openSignupModal = () => { setOpenLogin(false); setOpenSignup(true) }
  const openLoginModal = () => { setOpenSignup(false); setOpenLogin(true) }
  const closeSignup = () => setOpenSignup(false)
  const closeLogin = () => setOpenLogin(false)

  return (
    <>
      <div className="landing">
        <div className="logo-box"><img className="logo" src={x} alt="X logo" /></div>

        <div className="panel">
          <h1>Acontecendo agora</h1>

          <div className="cta">
            <h2>Inscreva-se hoje</h2>
            <div className="buttons">
              <button
                type="button"
                className="btn btn-primary"
                onClick={openSignupModal}
              >
                Criar conta
              </button>

              <p className="muted">ou</p>

              <button
                type="button"
                className="btn btn-outline"
                onClick={openLoginModal}
              >
                Entrar
              </button>
            </div>
          </div>
        </div>

        <div className="footer-copy">Todos os direitos reservados © Tiago Silva Batista dos Santos</div>
      </div>

      {/* Modais via Portal */}
      <SignupModal
        open={openSignup}
        onClose={closeSignup}
        onSuccess={() => nav('/home')}
      />

      <LoginModal
        open={openLogin}
        onClose={closeLogin}
        onSuccess={() => nav('/home')}
        onOpenSignup={openSignupModal}
      />
    </>
  )
}
