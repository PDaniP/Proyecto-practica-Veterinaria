import './GraficosConsultas.css';

const GraficosConsultas = () => {
  return (
    <div className="graficos-consultas-container">
      <h2 className="graficos-consultas-titulo">Gráficos de Consultas</h2>
      <div className="graficos-consultas-graficos">
        <div className="graficos-consultas-grafico-item">
          <h3 className="graficos-consultas-grafico-titulo">Sin datos disponibles</h3>
          <p className="graficos-consultas-loading">Aguardando datos...</p>
        </div>
      </div>
    </div>
  );
};

export default GraficosConsultas;