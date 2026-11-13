import './GraficosConsultas.css';
import { useEffect, useState } from 'react';
import api from '../../../config/api.js'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'

const COLORES = ['#176f65', '#55a98f', '#daa15c', '#55879a'];

const generarGraficoPie = (data) => {

  const datos = data.map(item => ({
    motivo: item.motivo,
    total: Number(item.total)
  }));
  
  return (
    <div className="graficos-consultas-chart">
      <PieChart width={240} height={200} responsive={true}>
        <Pie data={datos} dataKey="total" nameKey="motivo" cx="50%" cy="50%" innerRadius={42} outerRadius={80} fill="#176f65">
          {datos.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
      <ul className="graficos-consultas-leyenda" aria-label="Consultas por motivo" tabIndex={0}>
        {datos.map((entry, index) => (
          <li key={`${entry.motivo}-${index}`}>
            <span className="graficos-consultas-color" style={{ backgroundColor: COLORES[index % COLORES.length] }} aria-hidden="true" />
            <span className="graficos-consultas-motivo">{entry.motivo}</span>
            <span>{entry.total}</span>
          </li>
        ))}
      </ul>
    </div>
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
          <div className="graficos-consultas-fechas">
            <label>
              Desde
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </label>
            <label>
              Hasta
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </label>
          </div>
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