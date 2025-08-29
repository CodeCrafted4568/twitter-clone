import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()
  async function onSubmit(e) {
    e.preventDefault(); setError('')
    try {
      const { data } = await api.post('/api/auth/token/', { username, password })
      localStorage.setItem('token', data.access); nav('/home')
    } catch { setError('Usuário ou senha inválidos') }
  }
  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 24 }
    }>
      <h2>Entrar </h2>
      < form onSubmit={onSubmit} >
        <div style={{ display: 'grid', gap: 12 }}>
          <input placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="btn btn-primary" > Entrar </button>
          {error && <p className="muted" style={{ color: '#f00' }}> {error} </p>}
        </div>
      </form>
      < p className="muted" style={{ marginTop: 16 }}> Não tem conta ? <Link to="/register" > Criar < /Link></p >
    </div>
  )
}
