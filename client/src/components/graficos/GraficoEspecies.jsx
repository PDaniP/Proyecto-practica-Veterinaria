import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import api from '../../../config/api.js'

const data = await api.get('/especies/reporte/cantidad-mascotas').then(res => res.data.reporte.filter(item => item.cantidad > 0).map(item => ({
  name: item.nombre,
  value: Number(item.cantidad)
})));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

console.log(data)
const GraficoEspecies = () => (
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
);

export default GraficoEspecies;