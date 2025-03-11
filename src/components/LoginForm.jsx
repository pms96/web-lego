"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import "./LoginForm.css"

const LoginForm = ({ onClose }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, error } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success && onClose) {
        onClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-form-container">
      <h2 className="login-title">Iniciar Sesión</h2>

      {error && <div className="login-error">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
          />
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>

      <div className="login-footer">
        <p>¿No tienes una cuenta? Contacta con el administrador.</p>
      </div>
    </div>
  )
}

export default LoginForm

