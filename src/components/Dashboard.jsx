"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./Dashboard.css"
import { FaExclamationTriangle, FaSync, FaChartBar, FaMoneyBillWave, FaBoxOpen } from "react-icons/fa"

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalSets: 0,
    totalValue: 0,
    averagePrice: 0,
    mostExpensive: null,
    cheapest: null,
    statusDistribution: [],
    acquisitionsByMonth: [],
    acquisitionsByYear: [],
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const userId = localStorage.getItem("userId")
      const response = await axios.get("https://api.lego.lagrailla.es/api/user/" + userId+ "/dashboard/stats")
      const data = response.data

      // Procesar los datos para el dashboard
      processStats(data)
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
      setError("No se pudieron cargar las estadísticas. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  const processStats = (data) => {
    // Procesar estadísticas generales
    const generalStats = {
      totalSets: data.general_stats?.total_sets || 0,
      totalValue: Number.parseFloat(data.general_stats?.total_value || 0).toFixed(2),
      averagePrice: Number.parseFloat(data.general_stats?.average_price || 0).toFixed(2),
    }

    // Procesar distribución por estado
    const statusDistribution =
      data.status_distribution?.map((item) => ({
        name: getStatusLabel(item.status),
        value: item.count,
        percentage: (item.count / generalStats.totalSets) * 100,
      })) || []

    // Procesar adquisiciones por mes
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]

    const acquisitionsByMonth = Array(12)
      .fill()
      .map((_, i) => ({
        name: monthNames[i],
        value: 0,
        percentage: 0,
      }))

    // Llenar los datos de meses disponibles
    if (data.acquisitions_by_month && data.acquisitions_by_month.length > 0) {
      const maxMonthCount = Math.max(...data.acquisitions_by_month.map((item) => item.count), 1)
      data.acquisitions_by_month.forEach((item) => {
        const monthIndex = Number.parseInt(item.month) - 1 // Ajustar índice (1-12 a 0-11)
        if (monthIndex >= 0 && monthIndex < 12) {
          acquisitionsByMonth[monthIndex].value = item.count
          acquisitionsByMonth[monthIndex].percentage = (item.count / maxMonthCount) * 100
        }
      })
    }

    // Procesar adquisiciones por año
    const acquisitionsByYear =
      data.acquisitions_by_year?.map((item) => ({
        name: item.year,
        value: item.count,
        percentage: 0,
      })) || []

    // Calcular porcentajes para años
    if (acquisitionsByYear.length > 0) {
      const maxYearCount = Math.max(...acquisitionsByYear.map((item) => item.value), 1)
      acquisitionsByYear.forEach((item) => {
        item.percentage = (item.value / maxYearCount) * 100
      })
    }

    // Actualizar el estado con todos los datos procesados
    setStats({
      ...generalStats,
      statusDistribution,
      acquisitionsByMonth,
      acquisitionsByYear,
      mostExpensive: data.most_expensive,
      cheapest: data.cheapest,
    })
  }

  // Función para mostrar el estado en español
  const getStatusLabel = (status) => {
    const statusMap = {
      NEW: "Nuevo",
      BOX_AND_INSTRUCTIONS: "Caja e instrucciones",
      ONLY_BOX: "Solo caja",
      INSTRUCTIONS: "Instrucciones",
      COMPLETE: "Completo",
      INCOMPLETE: "Incompleto",
      // Mantener compatibilidad con valores antiguos
      Nuevo: "Nuevo",
      Usado: "Usado",
      Dañado: "Dañado",
    }

    return statusMap[status] || status
  }

  const refreshDashboard = () => {
    fetchDashboardStats()
  }

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FaExclamationTriangle />
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={refreshDashboard}>Intentar de nuevo</button>
      </div>
    )
  }

  if (stats.totalSets === 0) {
    return (
      <div className="dashboard-empty">
        <h3>No hay datos para mostrar</h3>
        <p>Añade sets de BrickHeadz a tu colección para ver estadísticas.</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard de mi Colección</h2>
        <button className="refresh-button" onClick={refreshDashboard} title="Actualizar estadísticas">
          <FaSync />
        </button>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBoxOpen />
          </div>
          <div className="stat-content">
            <h3>Total de Sets</h3>
            <p className="stat-value">{stats.totalSets}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <h3>Valor Total</h3>
            <p className="stat-value">{stats.totalValue}€</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>Precio Medio</h3>
            <p className="stat-value">{stats.averagePrice}€</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Distribución por estado */}
        <div className="dashboard-card">
          <h3 className="card-title">Distribución por Estado</h3>
          <div className="simple-chart">
            {stats.statusDistribution.length > 0 ? (
              stats.statusDistribution.map((item, index) => (
                <div key={index} className="chart-item">
                  <div className="chart-item-label">
                    <span className="chart-item-name">{item.name}</span>
                    <span className="chart-item-value">
                      {item.value} sets ({Math.round(item.percentage)}%)
                    </span>
                  </div>
                  <div className="chart-item-bar-container">
                    <div
                      className="chart-item-bar"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: getColorForIndex(index),
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No hay datos de estado disponibles</p>
            )}
          </div>
        </div>

        {/* Adquisiciones por mes */}
        <div className="dashboard-card">
          <h3 className="card-title">Adquisiciones por Mes</h3>
          <div className="simple-chart">
            {stats.acquisitionsByMonth.some((item) => item.value > 0) ? (
              stats.acquisitionsByMonth.map((item, index) => (
                <div key={index} className="chart-item">
                  <div className="chart-item-label">
                    <span className="chart-item-name">{item.name}</span>
                    <span className="chart-item-value">{item.value} sets</span>
                  </div>
                  <div className="chart-item-bar-container">
                    <div
                      className="chart-item-bar"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: "#e4002b",
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No hay datos de adquisiciones por mes</p>
            )}
          </div>
        </div>

        {/* Adquisiciones por año */}
        <div className="dashboard-card">
          <h3 className="card-title">Adquisiciones por Año</h3>
          <div className="simple-chart">
            {stats.acquisitionsByYear.length > 0 ? (
              stats.acquisitionsByYear.map((item, index) => (
                <div key={index} className="chart-item">
                  <div className="chart-item-label">
                    <span className="chart-item-name">{item.name}</span>
                    <span className="chart-item-value">{item.value} sets</span>
                  </div>
                  <div className="chart-item-bar-container">
                    <div
                      className="chart-item-bar"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: "#ffcf00",
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No hay datos de adquisiciones por año</p>
            )}
          </div>
        </div>

        {/* Información del set más caro */}
        <div className="dashboard-card">
          <h3 className="card-title">Set Más Caro</h3>
          {stats.mostExpensive ? (
            <div className="highlight-set">
              <div className="highlight-set-image">
                <img
                  src={stats.mostExpensive.brickheadz?.image || "/placeholder.svg?height=150&width=150"}
                  alt={stats.mostExpensive.brickheadz?.name}
                />
              </div>
              <div className="highlight-set-info">
                <h4>{stats.mostExpensive.brickheadz?.name}</h4>
                <p>
                  <strong>ID:</strong> {stats.mostExpensive.brickheadz?.lego_id}
                </p>
                <p>
                  <strong>Precio:</strong> {stats.mostExpensive.price_acquired}€
                </p>
                <p>
                  <strong>Adquirido:</strong> {new Date(stats.mostExpensive.date_acquired).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="no-data">No hay información de precios disponible</p>
          )}
        </div>

        {/* Información del set más barato */}
        <div className="dashboard-card">
          <h3 className="card-title">Set Más Barato</h3>
          {stats.cheapest ? (
            <div className="highlight-set">
              <div className="highlight-set-image">
                <img
                  src={stats.cheapest.brickheadz?.image || "/placeholder.svg?height=150&width=150"}
                  alt={stats.cheapest.brickheadz?.name}
                />
              </div>
              <div className="highlight-set-info">
                <h4>{stats.cheapest.brickheadz?.name}</h4>
                <p>
                  <strong>ID:</strong> {stats.cheapest.brickheadz?.lego_id}
                </p>
                <p>
                  <strong>Precio:</strong> {stats.cheapest.price_acquired}€
                </p>
                <p>
                  <strong>Adquirido:</strong> {new Date(stats.cheapest.date_acquired).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="no-data">No hay información de precios disponible</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Función para obtener colores para los gráficos
function getColorForIndex(index) {
  const colors = ["#e4002b", "#ffcf00", "#3498db", "#2ecc71", "#9b59b6", "#f39c12", "#1abc9c"]
  return colors[index % colors.length]
}

export default Dashboard

