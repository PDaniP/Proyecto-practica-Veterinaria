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
import React, { useState, useEffect } from "react";
import api from '../../../config/api.js'
import './GraficosVentas.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const formatearFecha = (fecha) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
};

const obtenerEtiqueta = (fecha,periodo) => {
  const fechaElegida = new Date(fecha);
  if (periodo === 'dia') {
    return fechaElegida.toLocaleTimeString("es-AR",{
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }
  return fechaElegida.toLocaleDateString("es-AR",{
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
    
function generarGraficoLinea(data, periodo) {
  
  if (!Array.isArray(data?.reporte)) {
    return <p className="graficos-ventas-mensaje">Cargando datos...</p>;
  }
  const datosGraficos = data.reporte.map((item) => ({
    fecha: obtenerEtiqueta(item.fecha, periodo),
    total:
      Number(item.efectivo) + Number(item.tarjeta) + Number(item.transferencia),
  }));

  return (
    <div className="graficos-ventas-grafico-item">
      <h3 className="graficos-ventas-grafico-titulo">Ventas del {periodo}</h3>
      <div className="graficos-ventas-chart">
        <LineChart
          width={600}
          height={300}
          responsive={true}
          data={datosGraficos}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis
            tickFormatter={(valor) =>
              `$${valor.toLocaleString('es-AR')}`
              }
            />
          <Tooltip formatter={(valor) => [`$${Number(valor).toLocaleString('es-AR')}`, 'Ingresos']} />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#ff7300" />
        </LineChart>
      </div>
    </div>
  );
}

const generarGraficoTorta = (data, periodo) => {
  if (!Array.isArray(data?.reporte)) {
    return <p className="graficos-ventas-mensaje">Cargando datos...</p>;
  }
  const totales = data.reporte.reduce((acc, item) => {
    acc.efectivo = (acc.efectivo || 0) + Number(item.efectivo);
    acc.tarjeta = (acc.tarjeta || 0) + Number(item.tarjeta);
    acc.transferencia = (acc.transferencia || 0) + Number(item.transferencia);
    return acc;
  }, {efectivo: 0, tarjeta: 0, transferencia: 0});
  const datosGraficos = [
    { name: 'Efectivo', value: totales.efectivo },
    { name: 'Tarjeta', value: totales.tarjeta },
    { name: 'Transferencia', value: totales.transferencia },
  ].filter(item => item.value > 0);
  if(datosGraficos.length === 0) {
    return <p className="graficos-ventas-mensaje">No hay datos para mostrar</p>;
  }
  return (
    <div className="graficos-ventas-grafico-item">
      <h3 className="graficos-ventas-grafico-titulo">Métodos de Pago - {periodo}</h3>
      <div className="graficos-ventas-chart">
        <PieChart
          width={600}
          height={300}
          responsive={true}
         
        >
          <Tooltip />
          <Legend />
          <Pie data={datosGraficos} 
              dataKey="value"
              nameKey="name"
              innerRadius={40} 
              outerRadius={80} 
              label={({percent}) => `${(percent * 100).toFixed(1)}%`}
          >
            {datosGraficos.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </div>
    </div>
  );
};

const graficoProductoMasVendido = (data,periodo) => {
  
  if (!Array.isArray(data?.reporte)) {
    return <p className="graficos-ventas-mensaje">Cargando datos...</p>;
  }
  
    const datos = data.reporte;
    
  return (
    <div className="graficos-ventas-grafico-item">
      <h3 className="graficos-ventas-grafico-titulo">Producto más vendido del {periodo}</h3>
      <div className="graficos-ventas-chart">
        <BarChart
          width={600}
          height={300}
          data={datos}
          layout="vertical"

        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="total_vendido" />
          <YAxis type="category" dataKey="producto_nombre" width={200} />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_vendido" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};



const GraficosVentas = () => {
    const [periodo, setPeriodo] = useState('dia');
    const [fechaInicio, setFechaInicio] = useState(formatearFecha(new Date()));
    const [fechaFin, setFechaFin] = useState(formatearFecha(new Date(Date.now()+24*60*60*1000)));
    const [ventasDiarias, setVentasDiarias] = useState([]);
    const [ventasSemanales, setVentasSemanales] = useState([]);
    const [ventasMensuales, setVentasMensuales] = useState([]);
    const [productoMasVendido, setProductoMasVendido] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(periodo === 'dia'){
          const response = await api.get(`/ventas/reporte/dia?fecha=${fechaInicio}`);
          const data = response.data;
          setVentasDiarias(data);
          return;
        }
        const response = await api.get(`/ventas/reporte/${periodo}?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        const data = response.data;
        if (periodo === 'semana') setVentasSemanales(data);
        if (periodo === 'mes') setVentasMensuales(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [periodo, fechaInicio, fechaFin]);

  useEffect(() => {
    const fetchProductoMasVendido = async () => {
      try {
        const response = await api.get(`/ventas/reporte/producto-mas-vendido?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        setProductoMasVendido(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProductoMasVendido();
  }, [fechaInicio, fechaFin]);

  return (
    <div className="graficos-ventas-container">
      <div className="graficos-ventas-controles">
        <button className="graficos-ventas-boton" onClick={() => setPeriodo('dia')}>Día</button>
        <button className="graficos-ventas-boton" onClick={() => setPeriodo('semana')}>Semana</button>
        <button className="graficos-ventas-boton" onClick={() => setPeriodo('mes')}>Mes</button>
        <div className="graficos-ventas-filtro">
          <label>Fecha Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        {periodo !== "dia" && <div className="graficos-ventas-filtro">
          <label>Fecha Fin</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>}
      </div>
      <div className="graficos-ventas-graficos">
        {periodo === 'dia' && (
          <>
            {generarGraficoLinea(ventasDiarias, "dia")}
            {generarGraficoTorta(ventasDiarias, "dia")}
            {graficoProductoMasVendido(productoMasVendido, "dia")}
          </>
       )}
       {periodo === 'semana' && (
          <>
            {generarGraficoLinea(ventasSemanales, "semana")}
            {generarGraficoTorta(ventasSemanales, "semana")}
            {graficoProductoMasVendido(productoMasVendido, "semana")}
          </>
       )}
       {periodo === 'mes' && (
          <>
            {generarGraficoLinea(ventasMensuales, "mes")}
            {generarGraficoTorta(ventasMensuales, "mes")}
            {graficoProductoMasVendido(productoMasVendido, "mes")}
          </>
       )}
      </div>
    </div>
  );
};

export default GraficosVentas;