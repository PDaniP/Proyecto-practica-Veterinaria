import './GraficosConsultas.css';
import { useEffect, useState } from 'react';
import api from '../../../config/api.js'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const generarGraficoPie = (data) => {

  const datos = data.map(item => ({
    motivo: item.motivo,
    total: Number(item.total)
  }));
  
  return (
    <PieChart width={400} height={400}>
      <Pie data={datos} dataKey="total" nameKey="motivo" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
        {datos.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042'][index % 4]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

const formatearFecha = (fecha) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
};

const GraficosConsultas = () => {
  const [datos, setDatos] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(formatearFecha(new Date()));
  const [fechaFin, setFechaFin] = useState(formatearFecha(new Date()));

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const response = await api.get(`mascotas/reporte/consultas-por-motivos?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        setDatos(response.data);
      } catch (error) {
        console.error('Error al obtener los datos del gráfico:', error);
      }
    };
    fetchDatos();
  }, [fechaInicio, fechaFin]);

  return (
    <div className="graficos-consultas-container">
      <h2 className="graficos-consultas-titulo">Gráficos de Consultas</h2>
      <div className="graficos-consultas-graficos">
        <div className="graficos-consultas-grafico-item">
          <h3 className="graficos-consultas-grafico-titulo">Consultas por Motivo</h3>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
          {datos.length === 0 ? (
            <p className="graficos-consultas-loading">Aguardando datos...</p>
          ) : (
            generarGraficoPie(datos)
          )}
        </div>
      </div>
    </div>
  );
};

export default GraficosConsultas;