"use client"

import { useState, useEffect, useCallback } from "react"
import "./App.css"
import Header from "./Header.jsx"
import Content from "./Content.jsx"
import Input from "./Input.jsx"
import UserCollection from "./components/UserCollection.jsx"
import { AuthProvider, useAuth } from "./context/AuthContext"
import axios from "axios"

// Componente principal envuelto en AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

// Contenido de la aplicación que usa el contexto de autenticación
function AppContent() {
  const [brickheadz, setBrickheadz] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCollection, setShowCollection] = useState(false)
  const { isAuthenticated, loading, user } = useAuth()

  // Función para obtener los sets BrickHeadz desde la API
  const fetchBrickheadz = useCallback(() => {
    setIsLoading(true)
    setError(null)

    axios
      .get("https://api.lego.lagrailla.es/api/brickheadz")
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
  }, [])

  useEffect(() => {
    fetchBrickheadz()
  }, [fetchBrickheadz]) // Added fetchBrickheadz to dependencies

  // Esperar a que se verifique la autenticación
  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Header
        isAuthenticated={isAuthenticated}
        onToggleCollection={() => setShowCollection(!showCollection)}
        showCollection={showCollection}
      />
      <div className="main-content">
        {isAuthenticated && showCollection ? (
          <UserCollection refreshData={fetchBrickheadz} />
        ) : (
          <>
            <Input fetchBrickheadz={fetchBrickheadz} />
            <Content
              brickheadz={brickheadz}
              fetchBrickheadz={fetchBrickheadz}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              error={error}
              userId={user?.id}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default App

