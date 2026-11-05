import GraficoEspecies from '../components/graficos/GraficoEspecies.jsx'
import GraficoStock from '../components/graficos/GraficoStock.jsx'
import GraficosVentas from '../components/graficos/GraficosVentas.jsx'
import ReporteTurnos from '../components/graficos/GraficoTurnos.jsx'
import './Estadisticas.css'

const Estadisticas = () => (
  <div className="estadisticas-page">
    <h1 className="estadisticas-titulo">Estadísticas</h1>
    
    <section className="estadisticas-seccion">
      <h2 className="estadisticas-seccion-titulo">Distribución de Especies</h2>
      <div className="estadisticas-contenido">
        <GraficoEspecies />
      </div>
    </section>

    <section className="estadisticas-seccion">
      <h2 className="estadisticas-seccion-titulo">Stock de Productos</h2>
      <div className="estadisticas-contenido">
        <GraficoStock />
      </div>
    </section>

    <section className="estadisticas-seccion">
      <h2 className="estadisticas-seccion-titulo">Reportes de Ventas</h2>
      <div className="estadisticas-contenido">
        <GraficosVentas />
      </div>
    </section>

    <section className="estadisticas-seccion">
      <h2 className="estadisticas-seccion-titulo">Reporte de Turnos</h2>
      <div className="estadisticas-contenido">
        <ReporteTurnos />
      </div>
    </section>
  </div>
)

export default Estadisticas;