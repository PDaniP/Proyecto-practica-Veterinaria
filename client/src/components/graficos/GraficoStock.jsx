import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import {useState, useEffect} from 'react'
import api from '../../../config/api.js'
import './GraficoStock.css'

const COLORES_STOCK = ['#176f65', '#55a98f', '#b5cda9', '#55879a', '#daa15c', '#9d879e']

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
          <PieChart width={360} height={260} responsive={true}>
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
                <Cell key={`cell-${index}`} fill={COLORES_STOCK[index % COLORES_STOCK.length]} />
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