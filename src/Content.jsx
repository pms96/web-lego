"use client"

import { useState, useEffect } from "react"
import "./Content.css"
import Modal from "./Modal"
import { FaInfoCircle, FaExclamationTriangle, FaChevronDown } from "react-icons/fa"
import AddToCollectionForm from "./components/AddToCollectionForm"
import axios from "axios"

function Content({ brickheadz, isAuthenticated, isLoading, error, fetchBrickheadz, userId }) {
  const [filter, setFilter] = useState("all")
  const [selectedSet, setSelectedSet] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddToCollectionModalOpen, setIsAddToCollectionModalOpen] = useState(false)
  const [selectedSetForCollection, setSelectedSetForCollection] = useState(null)

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [allBrickheadz, setAllBrickheadz] = useState(brickheadz)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMorePages, setHasMorePages] = useState(true)
  const [paginationError, setPaginationError] = useState(null)

  // Estado para la colección del usuario (para filtrar los no coleccionados)
  const [userCollection, setUserCollection] = useState([])
  const [isLoadingCollection, setIsLoadingCollection] = useState(false)

  // Cargar la colección del usuario si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserCollection()
    }
  }, [isAuthenticated])

  // Actualizar allBrickheadz cuando cambia brickheadz (primera carga)
  useEffect(() => {
    if (brickheadz.length > 0 && allBrickheadz.length === 0) {
      setAllBrickheadz(brickheadz)
    }
  }, [brickheadz, allBrickheadz.length])

  // Función para obtener la colección del usuario
  const fetchUserCollection = async () => {
    setIsLoadingCollection(true)
    try {
      const response = await axios.get("https://api.lego.lagrailla.es/api/user/collection")
      if (response.data && response.data.data) {
        setUserCollection(response.data.data)
      }
    } catch (error) {
      console.error("Error al obtener la colección del usuario:", error)
    } finally {
      setIsLoadingCollection(false)
    }
  }

  // Filtrar los sets según el criterio seleccionado
  const filteredSets = allBrickheadz.filter((set) => {
    // Filtro básico
    if (filter === "all") return true
    if (filter === "available") return !set.is_discontinued
    if (filter === "discontinued") return set.is_discontinued

    // Filtro para sets no coleccionados
    if (filter === "not_collected") {
      // Verificar si el set no está en la colección del usuario
      return !userCollection.some((item) => item.brickheadz_id === set.id)
    }

    return true
  })

  const handleSetClick = (set) => {
    setSelectedSet(set)
    setIsModalOpen(true)
  }

  const handleAddToCollection = (e, set) => {
    e.stopPropagation() // Evitar que se abra el modal de detalles
    setSelectedSetForCollection(set)
    setIsAddToCollectionModalOpen(true)
  }

  const handleAddToCollectionSuccess = () => {
    // Refrescar los datos después de añadir a la colección
    fetchBrickheadz()
    // También actualizar la colección del usuario para el filtro
    fetchUserCollection()
  }

  const loadMoreBrickheadz = async () => {
    setIsLoadingMore(true)
    setPaginationError(null)

    try {
      const nextPage = currentPage + 1
      const response = await fetch(`https://api.lego.lagrailla.es/api/brickheadz?page=${nextPage}`)

      if (!response.ok) {
        throw new Error("Error al cargar más sets")
      }

      const data = await response.json()

      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Añadir los nuevos sets a los existentes
        setAllBrickheadz((prev) => [...prev, ...data.data])
        setCurrentPage(nextPage)

        // Verificar si hay más páginas
        setHasMorePages(data.meta?.current_page < data.meta?.last_page)
      } else {
        // No hay más datos para cargar
        setHasMorePages(false)
      }
    } catch (error) {
      console.error("Error al cargar más sets:", error)
      setPaginationError("No se pudieron cargar más sets. Inténtalo de nuevo.")
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (isLoading && allBrickheadz.length === 0) {
    return (
      <div className="content">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error && allBrickheadz.length === 0) {
    return (
      <div className="content">
        <div className="empty-state">
          <FaExclamationTriangle />
          <h3>Error al cargar los datos</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="content">
      <div className="content-header">
        <h2>Catálogo de BrickHeadz</h2>
        <select className="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todos los sets</option>
          <option value="available">Disponibles</option>
          <option value="discontinued">Descatalogados</option>
          {isAuthenticated && <option value="not_collected">No coleccionados</option>}
        </select>
      </div>

      {filteredSets.length === 0 ? (
        <div className="empty-state">
          <FaInfoCircle />
          <h3>No hay sets que mostrar</h3>
          <p>No se encontraron sets con los criterios seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="grid">
            {filteredSets.map((set) => (
              <div key={set.id} className="brickheadz-card" onClick={() => handleSetClick(set)}>
                <div className="image-container">
                  {set.is_new && <div className="card-badge">NUEVO</div>}
                  <img
                    src={set.image || "/placeholder.svg?height=220&width=220"}
                    alt={set.name}
                    className="brickheadz-image"
                  />
                </div>
                <div className="brickheadz-info">
                  <div className="brickheadz-title-container">
                    <h3>{set.name}</h3>
                    <div className="brickheadz-id">{set.id}</div>
                  </div>
                  <p>
                    <strong>ID LEGO:</strong> {set.lego_id}
                  </p>
                  <p>
                    <strong>Fecha:</strong> {set.release_date || "Desconocida"}
                  </p>
                  <p>
                    <strong>Estado:</strong>
                    <span className={set.is_discontinued ? "discontinued" : "available"}>
                      {set.is_discontinued ? " Descatalogado" : " Disponible"}
                    </span>
                  </p>

                  {isAuthenticated && (
                    <button className="add-to-collection" onClick={(e) => handleAddToCollection(e, set)}>
                      Añadir a mi colección
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sección de paginación */}
          {hasMorePages && (
            <div className="pagination-container">
              {paginationError && <div className="pagination-error">{paginationError}</div>}
              <button className="load-more-button" onClick={loadMoreBrickheadz} disabled={isLoadingMore}>
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
        </>
      )}

      {/* Modal de detalles del set */}
      {isModalOpen && selectedSet && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div>
            <h2 className="modal-title">
              {selectedSet.name}
              <div className="modal-brickheadz-id">{selectedSet.id}</div>
            </h2>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <img
                  src={selectedSet.image || "/placeholder.svg?height=300&width=300"}
                  alt={selectedSet.name}
                  style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
                />
              </div>
              <p>
                <strong>ID LEGO:</strong> {selectedSet.lego_id}
              </p>
              <p>
                <strong>Fecha de lanzamiento:</strong> {selectedSet.release_date || "Desconocida"}
              </p>
              <p>
                <strong>Piezas:</strong> {selectedSet.pieces || "Desconocido"}
              </p>
              <p>
                <strong>Estado:</strong>
                <span className={selectedSet.is_discontinued ? "discontinued" : "available"}>
                  {selectedSet.is_discontinued ? " Descatalogado" : " Disponible"}
                </span>
              </p>
              <p>
                <strong>Descripción:</strong>{" "}
                {selectedSet.description || "No hay descripción disponible para este set."}
              </p>
            </div>
            {isAuthenticated && (
              <div className="modal-footer">
                <button className="add-to-collection" onClick={(e) => handleAddToCollection(e, selectedSet)}>
                  Añadir a mi colección
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal para añadir a la colección */}
      {isAddToCollectionModalOpen && selectedSetForCollection && (
        <Modal isOpen={isAddToCollectionModalOpen} onClose={() => setIsAddToCollectionModalOpen(false)}>
          <AddToCollectionForm
            brickheadz={selectedSetForCollection}
            onClose={() => setIsAddToCollectionModalOpen(false)}
            onSuccess={handleAddToCollectionSuccess}
          />
        </Modal>
      )}
    </div>
  )
}

export default Content

