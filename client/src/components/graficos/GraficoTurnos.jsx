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

const COLORES_TURNOS = ['#176f65', '#daa15c', '#55879a', '#9d879e'];

const formatearFecha = (fecha) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
};


const GraficoTurnos = ({ data }) => {
  return (
    <div className="grafico-turnos-grafico-item">
      <h3 className="grafico-turnos-grafico-titulo">Distribución de Turnos</h3>
      <div className="grafico-turnos-chart">
        <PieChart width={340} height={260} responsive={true}>
          <Pie
            data={data}
            dataKey="cantidad"
            nameKey="estado"
            cx="50%"
            cy="46%"
            innerRadius={36}
            outerRadius={74}
            fill="#176f65"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORES_TURNOS[index % COLORES_TURNOS.length]} />
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
  return (
    <div className="grafico-turnos-grafico-item">
      <h3 className="grafico-turnos-grafico-titulo">Turnos por Profesional</h3>
      <div className="grafico-turnos-chart">
        <BarChart width={420} height={260} responsive={true} data={data} layout='vertical'>
          <CartesianGrid stroke="#e7efeb" strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="profesional" />
          <Tooltip />
          <Legend />
          <Bar dataKey="turnos_asignados" fill="#176f65" radius={[0, 5, 5, 0]} />
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
