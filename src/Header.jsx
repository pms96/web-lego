"use client"

import { useState } from "react"
import "./Header.css"
import logo from "./assets/lego-logo.svg"
import { FaSearch, FaSignOutAlt, FaList, FaChartBar, FaHome } from "react-icons/fa"
import { useAuth } from "./context/AuthContext"
import Modal from "./Modal"
import LoginForm from "./components/LoginForm"

function Header({ isAuthenticated, activeView, onViewChange }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { logout } = useAuth()

  const handleSearch = (e) => {
    e.preventDefault()
    // Implementar la lógica de búsqueda aquí
    console.log("Buscando:", searchQuery)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="header">
      <div className="header-container">
        <img src={logo || "/placeholder.svg"} className="logo" alt="BrickHeadz Collection" />

        <div className="search-container">
          <form onSubmit={handleSearch} style={{ width: "100%" }}>
            <input
              type="text"
              placeholder="Buscar set por nombre o ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <FaSearch />
            </button>
          </form>
        </div>

        <div className="user-container">
          {isAuthenticated ? (
            <div className="user-menu">
              <button
                className={`nav-button ${activeView === "catalog" ? "active" : ""}`}
                onClick={() => onViewChange("catalog")}
                title="Ver catálogo"
              >
                <FaHome />
                <span>Catálogo</span>
              </button>

              <button
                className={`nav-button ${activeView === "collection" ? "active" : ""}`}
                onClick={() => onViewChange("collection")}
                title="Ver mi colección"
              >
                <FaList />
                <span>Mi Colección</span>
              </button>

              <button
                className={`nav-button ${activeView === "dashboard" ? "active" : ""}`}
                onClick={() => onViewChange("dashboard")}
                title="Ver dashboard"
              >
                <FaChartBar />
                <span>Dashboard</span>
              </button>

              <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowLoginModal(true)}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>

      {/* Modal de inicio de sesión */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <LoginForm onClose={() => setShowLoginModal(false)} />
      </Modal>
    </header>
  )
}

export default Header

