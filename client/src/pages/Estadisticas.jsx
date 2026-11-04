import GraficoEspecies from '../components/graficos/GraficoEspecies.jsx'
import GraficoStock from '../components/graficos/GraficoStock.jsx'

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
  </div>
)

export default Estadisticas;