"use client"

import { createContext, useState, useEffect, useContext } from "react"
import axios from "axios"

// Crear el contexto
const AuthContext = createContext(null)

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Configurar axios para incluir el token en todas las solicitudes
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, []) // Removed isAuthenticated from dependencies

  // Verificar si hay un token al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")

      if (token) {
        try {
          // Configurar el token para esta solicitud
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

          // Aquí podrías hacer una petición para verificar el token
          // Por ejemplo: const response = await axios.get('https://api.lego.lagrailla.es/api/user');

          setIsAuthenticated(true)
          // Si tienes un endpoint para obtener datos del usuario:
          // setUser(response.data);

          // Si no hay una respuesta con datos del usuario, al menos establecemos el ID
          if (userId) {
            setUser((prevUser) => ({
              ...(prevUser || {}),
              id: userId,
            }))
          }
        } catch (error) {
          console.error("Error al verificar la autenticación:", error)
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          delete axios.defaults.headers.common["Authorization"]
          setIsAuthenticated(false)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  // Función para iniciar sesión
  const login = async (email, password) => {
    setError(null)
    try {
      const response = await axios.post("https://api.lego.lagrailla.es/api/login", {
        email,
        password,
      })

      const { token, user: userData, userId } = response.data

      // Guardar el token y userId en localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("userId", userId || userData?.id)

      // Configurar axios para incluir el token en futuras solicitudes
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setUser({
        ...userData,
        id: userId || userData?.id,
      })
      setIsAuthenticated(true)
      return true
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setError(error.response?.data?.message || "Error al iniciar sesión")
      return false
    }
  }

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await axios.post("https://api.lego.lagrailla.es/api/logout")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      // Limpiar el token, userId y el estado de autenticación
      localStorage.removeItem("token")
      localStorage.removeItem("userId")
      delete axios.defaults.headers.common["Authorization"]
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  // Valores que se proporcionarán a través del contexto
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

