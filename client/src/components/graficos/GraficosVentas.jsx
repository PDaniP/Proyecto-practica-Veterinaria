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
} from "recharts";
import React, { useState, useEffect } from "react";
import api from '../../../config/api.js'

const formatearFecha = (fecha) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
};
    
function generarGraficoLinea(data, periodo) {
  console.log(data, periodo);
  if (!Array.isArray(data?.reporte)) {
    return <p>Cargando datos...</p>;
  }
  const datosGraficos = data.reporte.map((item) => ({
    hora: new Date(item.fecha).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),

    total:
      Number(item.efectivo) + Number(item.tarjeta) + Number(item.transferencia),
  }));

  return (
    <>
      <h2>Ventas del {periodo}</h2>
      <LineChart
        width={600}
        height={300}
        responsive={true}
        data={datosGraficos}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hora" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="efectivo" stroke="#82ca9d" />
        <Line type="monotone" dataKey="tarjeta" stroke="#8884d8" />
        <Line type="monotone" dataKey="transferencia" stroke="#ffc658" />
        <Line type="monotone" dataKey="total" stroke="#ff7300" />
      </LineChart>
    </>
  );
}

const generarGraficoBarra = (data, periodo) => {
  if (!Array.isArray(data?.reporte)) {
    return <p>Cargando datos...</p>;
  }
  const datosGraficos = data.reporte.map((item) => ({
    hora: new Date(item.fecha).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    efectivo: Number(item.efectivo),
    tarjeta: Number(item.tarjeta),
    transferencia: Number(item.transferencia),
    }));

  return (
    <>
      <h2>Ventas del {periodo}</h2>
      <PieChart
        width={600}
        height={300}
        responsive={true}
        data={datosGraficos}
      >
        <Tooltip />
        <Legend />
        <Pie dataKey="efectivo" fill="#82ca9d" innerRadius={40} outerRadius={80} />
        <Pie dataKey="tarjeta" fill="#8884d8" innerRadius={40} outerRadius={80} />
        <Pie dataKey="transferencia" fill="#ffc658" innerRadius={40} outerRadius={80} />
      </PieChart>
    </>
  );
};



const GraficosVentas = () => {
    const [periodo, setPeriodo] = useState('dia');
    const [fechaInicio, setFechaInicio] = useState(formatearFecha(new Date()));
    const [fechaFin, setFechaFin] = useState(formatearFecha(new Date(Date.now()+24*60*60*1000)));
    const [ventasDiarias, setVentasDiarias] = useState([]);
    const [ventasSemanales, setVentasSemanales] = useState([]);
    const [ventasMensuales, setVentasMensuales] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/ventas/reporte/${periodo}?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        const data = response.data;
        if (periodo === 'dia') setVentasDiarias(data);
        if (periodo === 'semana') setVentasSemanales(data);
        if (periodo === 'mes') setVentasMensuales(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [periodo, fechaInicio, fechaFin]);

  return (
    <div>
        <button onClick={() => setPeriodo('dia')}>Día</button>
        <button onClick={() => setPeriodo('semana')}>Semana</button>
        <button onClick={() => setPeriodo('mes')}>Mes</button>
        <label>
          Fecha Inicio
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </label>
        {periodo !== "dia" && <label> Fecha fin<input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} /></label>}
      {periodo === 'dia' && (
        <div>
          {generarGraficoLinea(ventasDiarias, "dia")}
          {generarGraficoBarra(ventasDiarias, "dia")}
        </div>
     )}
     {periodo === 'semana' && (
        <div>
          {generarGraficoLinea(ventasSemanales, "semana")}
          {generarGraficoBarra(ventasSemanales, "semana")}
        </div>
     )}
     {periodo === 'mes' && (
        <div>
          {generarGraficoLinea(ventasMensuales, "mes")}
          {generarGraficoBarra(ventasMensuales, "mes")}
        </div>
     )}
     </div>
  );
};

export default GraficosVentas;