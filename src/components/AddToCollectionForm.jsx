"use client"

import { useState, useEffect } from "react"
import "./AddToCollectionForm.css"
import { useAuth } from "../context/AuthContext"

const AddToCollectionForm = ({ brickheadz, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    brickheadz_id: brickheadz.id,
    user_id: "",
    date_acquired: new Date().toISOString().split("T")[0], // Fecha actual como valor predeterminado
    price_acquired: "",
    status: "Nuevo", // Valor predeterminado
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Cargar el userId al montar el componente
  useEffect(() => {
    const userId = user?.id || localStorage.getItem("userId")
    if (userId) {
      setFormData((prev) => ({
        ...prev,
        user_id: userId,
      }))
    }
  }, [user])

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
      const response = await fetch("https://api.lego.lagrailla.es/api/user/collection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al añadir a la colección")
      }

      const data = await response.json()
      onSuccess(data)
      onClose()
    } catch (error) {
      console.error("Error al añadir a la colección:", error)
      setError(error.message || "Error al añadir a la colección. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="add-collection-form">
      <h2 className="form-title">Añadir a mi colección</h2>

      <div className="set-info">
        <img
          src={brickheadz.image || "/placeholder.svg?height=100&width=100"}
          alt={brickheadz.name}
          className="set-thumbnail"
        />
        <div className="set-details">
          <h3>{brickheadz.name}</h3>
          <p>ID LEGO: {brickheadz.lego_id}</p>
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
            <option value="Nuevo">Nuevo</option>
            <option value="Usado">Usado</option>
            <option value="Dañado">Dañado</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="submit-button" disabled={isSubmitting || !formData.user_id}>
            {isSubmitting ? "Añadiendo..." : "Añadir a mi colección"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddToCollectionForm

