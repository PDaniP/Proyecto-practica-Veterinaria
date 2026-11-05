import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import {useState, useEffect} from 'react'
import api from '../../../config/api.js'



const GraficoStock = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    api.get('/products/reporte')
      .then(res => setData(res.data.reporte.filter(item => item.value > 0)));
  }, []);

  return (
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
);
}
export default GraficoStock;