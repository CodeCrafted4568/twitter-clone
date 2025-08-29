import { useNavigate } from 'react-router-dom'
import x from '../assets/x.svg'

export default function Landing() {
  const nav = useNavigate()
  return (
    <div className="landing">
      <div className="logo-box"><img className="logo" src={x} alt="X logo" /></div>
      <div className="panel">
        <h1>Acontecendo agora</h1>

        <div className="cta">
          <h2>Inscreva-se</h2>
          <div className="buttons">
            <button className="btn btn-primary" onClick={() => nav('/register')}>
              Criar conta
            </button>
            <p className="muted">ou</p>
            <button className="btn btn-outline" onClick={() => nav('/login')}>
              Entrar
            </button>
          </div>
        </div>
      </div>

      <div className="footer-copy">Todos os direitos reservados © Tiago Silva Batista dos Santos</div>
    </div>
  )
}
