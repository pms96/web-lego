"use client"

import { useState, useEffect } from "react"
import "./App.css"
import Header from "./Header.jsx"
import Content from "./Content.jsx"
import Input from "./Input.jsx"
import axios from "axios"

function App() {
  const [brickheadz, setBrickheadz] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Comprobar si el usuario está autenticado (puede basarse en un token en localStorage)
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  // Función para obtener los sets BrickHeadz desde la API
  const fetchBrickheadz = () => {
    setIsLoading(true)
    setError(null)

    axios
      .get("http://localhost:8000/api/brickheadz")
      .then((response) => {
        if (Array.isArray(response.data.data)) {
          setBrickheadz(response.data.data)
        } else {
          console.error("Los datos no son un array:", response.data.data)
          setError("Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.")
        }
      })
      .catch((error) => {
        console.error("Error al obtener los datos: ", error)
        setError("Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchBrickheadz()
  }, []) // Removed fetchBrickheadz from the dependency array

  return (
    <div className="app-container">
      <Header isAuthenticated={isAuthenticated} />
      <div className="main-content">
        <Input fetchBrickheadz={fetchBrickheadz} />
        <Content
          brickheadz={brickheadz}
          fetchBrickheadz={fetchBrickheadz}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  )
}

export default App

