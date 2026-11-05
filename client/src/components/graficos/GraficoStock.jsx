import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import {useState, useEffect} from 'react'
import api from '../../../config/api.js'
import './GraficoStock.css'



const GraficoStock = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    api.get('/products/reporte')
      .then(res => setData(res.data.reporte.filter(item => item.value > 0)));
  }, []);

  return (
    <div className="grafico-stock-container">
      <div className="grafico-stock-wrapper">
        <h2 className="grafico-stock-titulo">Stock de Productos</h2>
        <div className="grafico-stock-chart">
          <PieChart width={600} height={600}>
            <Pie
              data={data}
              cx={300}
              cy={300}
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
export default GraficoStock;