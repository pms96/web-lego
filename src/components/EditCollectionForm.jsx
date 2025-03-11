"use client"

import { useState } from "react"
import "./AddToCollectionForm.css" // Reutilizamos los estilos del formulario de añadir
import { useAuth } from "../context/AuthContext"

const EditCollectionForm = ({ collectionItem, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    id: collectionItem.id,
    brickheadz_id: collectionItem.brickheadz_id,
    user_id: user?.id || localStorage.getItem("userId"),
    date_acquired: collectionItem.date_acquired
      ? new Date(collectionItem.date_acquired).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    price_acquired: collectionItem.price_acquired || "",
    status: collectionItem.status || "NEW",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`https://api.lego.lagrailla.es/api/user/collection/${collectionItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el elemento de la colección")
      }

      const data = await response.json()
      onSuccess(data)
      onClose()
    } catch (error) {
      console.error("Error al actualizar el elemento de la colección:", error)
      setError(error.message || "Error al actualizar. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="add-collection-form">
      <h2 className="form-title">Editar elemento de la colección</h2>

      <div className="set-info">
        <img
          src={collectionItem.brickheadz?.image || "/placeholder.svg?height=100&width=100"}
          alt={collectionItem.brickheadz?.name}
          className="set-thumbnail"
        />
        <div className="set-details">
          <h3>{collectionItem.brickheadz?.name}</h3>
          <p>ID LEGO: {collectionItem.brickheadz?.lego_id}</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date_acquired">Fecha de adquisición</label>
          <input
            type="date"
            id="date_acquired"
            name="date_acquired"
            value={formData.date_acquired}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="price_acquired">Precio de adquisición (€)</label>
          <input
            type="number"
            id="price_acquired"
            name="price_acquired"
            value={formData.price_acquired}
            onChange={handleChange}
            placeholder="Ej: 19.99"
            step="0.01"
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Estado</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange}>
            <option value="NEW">Nuevo</option>
            <option value="BOX_AND_INSTRUCTIONS">Caja e instrucciones</option>
            <option value="ONLY_BOX">Solo caja</option>
            <option value="INSTRUCTIONS">Instrucciones</option>
            <option value="COMPLETE">Completo</option>
            <option value="INCOMPLETE">Incompleto</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditCollectionForm

