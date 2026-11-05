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
  console.log(data, periodo);
  if (!Array.isArray(data?.reporte)) {
    return <p>Cargando datos...</p>;
  }
  const datosGraficos = data.reporte.map((item) => ({
    fecha: obtenerEtiqueta(item.fecha, periodo),
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
    </>
  );
}

const generarGraficoTorta = (data, periodo) => {
  if (!Array.isArray(data?.reporte)) {
    return <p>Cargando datos...</p>;
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
    return <p>No hay datos para mostrar</p>;
  }
  return (
    <>
      <h2>Ventas del {periodo}</h2>
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
    </>
  );
};

const graficoProductoMasVendido = (data,periodo) => {
  
  if (!Array.isArray(data?.reporte)) {
    return <p>Cargando datos...</p>;
  }
  
    const datos = data.reporte;
    console.log(datos);
  return (
    <div>
      <h2>Producto más vendido del {periodo}</h2>
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
          {generarGraficoTorta(ventasDiarias, "dia")}
          {graficoProductoMasVendido(productoMasVendido, "dia")}
        </div>
     )}
     {periodo === 'semana' && (
        <div>
          {generarGraficoLinea(ventasSemanales, "semana")}
          {generarGraficoTorta(ventasSemanales, "semana")}
          {graficoProductoMasVendido(productoMasVendido, "semana")}
        </div>
     )}
     {periodo === 'mes' && (
        <div>
          {generarGraficoLinea(ventasMensuales, "mes")}
          {generarGraficoTorta(ventasMensuales, "mes")}
          {graficoProductoMasVendido(productoMasVendido, "mes")}
        </div>
     )}
     </div>
  );
};

export default GraficosVentas;