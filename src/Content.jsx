"use client"

import { useState } from "react"
import "./Content.css"
import Modal from "./Modal"
import { FaInfoCircle, FaExclamationTriangle } from "react-icons/fa"

function Content({ brickheadz, isAuthenticated, isLoading, error, onAddToCollection }) {
  const [filter, setFilter] = useState("all")
  const [selectedSet, setSelectedSet] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtrar los sets según el criterio seleccionado
  const filteredSets = brickheadz.filter((set) => {
    if (filter === "all") return true
    if (filter === "available") return !set.is_discontinued
    if (filter === "discontinued") return set.is_discontinued
    return true
  })

  const handleSetClick = (set) => {
    setSelectedSet(set)
    setIsModalOpen(true)
  }

  const handleAddToCollection = (e, legoId) => {
    e.stopPropagation() // Evitar que se abra el modal
    onAddToCollection(legoId)
  }

  if (isLoading) {
    return (
      <div className="content">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
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
        </select>
      </div>

      {filteredSets.length === 0 ? (
        <div className="empty-state">
          <FaInfoCircle />
          <h3>No hay sets que mostrar</h3>
          <p>No se encontraron sets con los criterios seleccionados.</p>
        </div>
      ) : (
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
                <h3>{set.name}</h3>
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
                  <button className="add-to-collection" onClick={(e) => handleAddToCollection(e, set.lego_id)}>
                    Añadir a mi colección
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedSet && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div>
            <h2 className="modal-title">{selectedSet.name}</h2>
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
                <button className="add-to-collection" onClick={(e) => handleAddToCollection(e, selectedSet.lego_id)}>
                  Añadir a mi colección
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Content

