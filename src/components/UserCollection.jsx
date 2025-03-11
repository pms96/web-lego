"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./UserCollection.css"
import { FaExclamationTriangle, FaTrash, FaSync, FaChevronDown } from "react-icons/fa"

const UserCollection = ({ refreshData }) => {
  const [collection, setCollection] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMorePages, setHasMorePages] = useState(true)
  const [paginationError, setPaginationError] = useState(null)

  useEffect(() => {
    fetchUserCollection(1, true) // Cargar la primera página al montar
  }, [])

  const fetchUserCollection = async (page = 1, resetCollection = false) => {
    if (page === 1) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    setError(null)
    setPaginationError(null)

    try {
      const response = await axios.get(`https://api.lego.lagrailla.es/api/user/collection?page=${page}`)

      const newItems = response.data.data || []

      if (resetCollection) {
        setCollection(newItems)
      } else {
        setCollection((prev) => [...prev, ...newItems])
      }

      // Verificar si hay más páginas
      if (response.data.meta) {
        setHasMorePages(response.data.meta.current_page < response.data.meta.last_page)
      } else {
        setHasMorePages(newItems.length > 0)
      }

      setCurrentPage(page)
    } catch (error) {
      console.error("Error al obtener la colección:", error)
      if (page === 1) {
        setError("No se pudo cargar tu colección. Por favor, inténtalo de nuevo más tarde.")
      } else {
        setPaginationError("Error al cargar más elementos. Inténtalo de nuevo.")
      }
    } finally {
      if (page === 1) {
        setIsLoading(false)
      } else {
        setIsLoadingMore(false)
      }
    }
  }

  const loadMoreItems = () => {
    fetchUserCollection(currentPage + 1, false)
  }

  const refreshCollection = () => {
    fetchUserCollection(1, true)
  }

  const removeFromCollection = async (setId) => {
    // Esta función es un placeholder - la API actual no tiene endpoint de eliminación
    // Cuando se implemente, se podría usar algo como:
    // await axios.delete(`https://api.lego.lagrailla.es/api/user/collection/${setId}`);

    alert(`Funcionalidad para eliminar el set ${setId} de tu colección aún no implementada.`)
  }

  if (isLoading) {
    return (
      <div className="user-collection-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tu colección...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="user-collection-error">
        <FaExclamationTriangle />
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={refreshCollection}>Intentar de nuevo</button>
      </div>
    )
  }

  if (collection.length === 0) {
    return (
      <div className="user-collection-empty">
        <h3>Tu colección está vacía</h3>
        <p>Añade sets de BrickHeadz a tu colección para verlos aquí.</p>
      </div>
    )
  }

  return (
    <div className="user-collection">
      <div className="collection-header">
        <h2 className="collection-title">Mi Colección de BrickHeadz</h2>
        <button className="refresh-button" onClick={refreshCollection} title="Actualizar colección">
          <FaSync />
        </button>
      </div>

      <div className="collection-grid">
        {collection.map((item) => (
          <div key={item.id} className="collection-item">
            <div className="collection-item-image">
              <img
                src={item.brickheadz?.image || "/placeholder.svg?height=150&width=150"}
                alt={item.brickheadz?.name}
              />
            </div>
            <div className="collection-item-info">
              <h3>{item.brickheadz?.name}</h3>
              <p>
                <strong>ID:</strong> {item.brickheadz?.lego_id}
              </p>
              <p>
                <strong>Adquirido:</strong> {new Date(item.date_acquired).toLocaleDateString()}
              </p>
              {item.price_acquired && (
                <p>
                  <strong>Precio:</strong> {item.price_acquired}€
                </p>
              )}
              <p>
                <strong>Estado:</strong> <span className="status-badge">{item.status || "Nuevo"}</span>
              </p>
              <button className="remove-button" onClick={() => removeFromCollection(item.id)}>
                <FaTrash /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de paginación */}
      {hasMorePages && (
        <div className="pagination-container">
          {paginationError && <div className="pagination-error">{paginationError}</div>}
          <button className="load-more-button" onClick={loadMoreItems} disabled={isLoadingMore}>
            {isLoadingMore ? (
              <>
                <div className="loading-spinner-small"></div>
                Cargando...
              </>
            ) : (
              <>
                Cargar más <FaChevronDown />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default UserCollection

