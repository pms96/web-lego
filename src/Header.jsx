"use client"

import { useState } from "react"
import "./Header.css"
import logo from "./assets/lego-logo.svg"
import { FaUser, FaSearch } from "react-icons/fa"

function Header({ isAuthenticated }) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    // Implementar la lógica de búsqueda aquí
    console.log("Buscando:", searchQuery)
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
          {isAuthenticated ? <FaUser className="user-icon" /> : <button className="login-btn">Iniciar Sesión</button>}
        </div>
      </div>
    </header>
  )
}

export default Header

