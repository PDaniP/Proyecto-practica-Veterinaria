import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import api from '../../../config/api.js'
import {useState, useEffect} from 'react'
import './GraficoEspecies.css'


const GraficoEspecies = () =>{ 
  const [data, setData] = useState([]);
  
  useEffect(() => {
    api.get('/especies/reporte/cantidad-mascotas')
      .then(res => setData(res.data.reporte.filter(item => item.cantidad > 0).map(item => ({
        name: item.nombre,
        value: Number(item.cantidad)
      }))));
  }, []);

  return (
    <div className="grafico-especies-container">
      <div className="grafico-especies-wrapper">
        <h2 className="grafico-especies-titulo">Distribución de Especies</h2>
        <div className="grafico-especies-chart">
          <PieChart width={400} height={400}>
            <Pie
              data={data}
              cx={200}
              cy={200}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${(index * 360 / data.length)}, 70%, 50%)`} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
}
export default GraficoEspecies;