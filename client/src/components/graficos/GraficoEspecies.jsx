import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import api from '../../../config/api.js'
import {useState, useEffect} from 'react'
import './GraficoEspecies.css'

const COLORES_ESPECIES = ['#176f65', '#55a98f', '#b5cda9', '#55879a', '#daa15c', '#9d879e']

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
          <PieChart width={340} height={260} responsive={true}>
            <Pie
              data={data}
              cx="50%"
              cy="46%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              innerRadius={36}
              outerRadius={72}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORES_ESPECIES[index % COLORES_ESPECIES.length]} />
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