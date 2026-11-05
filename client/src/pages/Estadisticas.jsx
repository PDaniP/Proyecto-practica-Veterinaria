import GraficoEspecies from '../components/graficos/GraficoEspecies.jsx'
import GraficoStock from '../components/graficos/GraficoStock.jsx'
import GraficosVentas from '../components/graficos/GraficosVentas.jsx'
import ReporteTurnos from '../components/graficos/GraficoTurnos.jsx'
const Estadisticas = () => (
  <div>
    <h1>Estadísticas</h1>
    <div>
    <h1>Especies</h1>
    <GraficoEspecies />
    </div>
    <div>
    <h1>Stock</h1>
    <GraficoStock />
    </div>
    <div>
    <h1>Ventas</h1>
    <GraficosVentas />
    </div>
    <div>
    <h1>Turnos</h1>
    <ReporteTurnos />
    </div>
  </div>
)

export default Estadisticas;