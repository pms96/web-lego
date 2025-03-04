"use client"

import { useState } from "react"
import axios from "axios"
import "./Input.css"
import { FaSearch } from "react-icons/fa"

function Input({ fetchBrickheadz }) {
  const [legoId, setLegoId] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (legoId.trim() === "") return

    setIsSearching(true)
    axios
      .get(`http://localhost:8000/api/brickheadz/${legoId}`)
      .then((response) => {
        if (response.data) {
          alert(`Encontrado: ${response.data.name}`)
          // Refrescar la lista después de una búsqueda exitosa
          fetchBrickheadz()
        } else {
          alert("No se encontró el set.")
        }
      })
      .catch((error) => {
        console.error("Error al buscar el set:", error)
        alert("Error al buscar el set. Por favor, inténtalo de nuevo.")
      })
      .finally(() => {
        setIsSearching(false)
      })
  }

  return (
    <div className="input-container">
      <h3 className="input-title">Buscar por ID LEGO</h3>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Introduce el ID del set (ej: 41600)"
          value={legoId}
          onChange={(e) => setLegoId(e.target.value)}
          disabled={isSearching}
        />
        <button type="submit" disabled={isSearching || legoId.trim() === ""}>
          {isSearching ? (
            "Buscando..."
          ) : (
            <>
              <FaSearch /> Buscar
            </>
          )}
        </button>
      </form>
      <p className="search-tips">Introduce el número de ID del set LEGO BrickHeadz para encontrarlo rápidamente.</p>
    </div>
  )
}

export default Input

