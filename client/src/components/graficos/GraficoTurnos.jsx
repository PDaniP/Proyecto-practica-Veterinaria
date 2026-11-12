import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from '../../../config/api.js';
import './GraficoTurnos.css';

const formatearFecha = (fecha) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
};


const GraficoTurnos = ({ data }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="grafico-turnos-grafico-item">
      <h3 className="grafico-turnos-grafico-titulo">Distribución de Turnos</h3>
      <div className="grafico-turnos-chart">
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            dataKey="cantidad"
            nameKey="estado"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};
const GraficoProfesional = ({ data }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="grafico-turnos-grafico-item">
      <h3 className="grafico-turnos-grafico-titulo">Turnos por Profesional</h3>
      <div className="grafico-turnos-chart">
        <BarChart width={400} height={400} data={data} layout='vertical'>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="profesional" />
          <Tooltip />
          <Legend />
          <Bar dataKey="turnos_asignados" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};

const ReporteTurnos = () => {
    const [turnosData, setTurnosData] = useState([]);
    const [profesionalData, setProfesionalData] = useState([]);
    const [fechaInicio, setFechaInicio] = useState(formatearFecha(new Date()));
    const [fechaFin, setFechaFin] = useState(formatearFecha(new Date(Date.now()+7*24*60*60*1000)));
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/turnos/reportes?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
                
                setTurnosData(response.data.rows);
                setProfesionalData(response.data.rows2)
            } catch (error) {
                console.error("Error al obtener los datos de turnos:", error);
            }
        };
        fetchData();
    }, [fechaInicio, fechaFin]);
    return (
      <div className="grafico-turnos-container">
        <div className="grafico-turnos-filtros">
          <div className="grafico-turnos-filtro-grupo">
            <label>Fecha Inicio: </label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="grafico-turnos-filtro-grupo">
            <label>Fecha Fin: </label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
        </div>
        <div className="grafico-turnos-graficos">
          <GraficoTurnos data={turnosData} />
          <GraficoProfesional data={profesionalData} />
        </div>
      </div>
    );
};

export default ReporteTurnos;
