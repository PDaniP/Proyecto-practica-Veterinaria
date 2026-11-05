import './Indicador.css';

const Indicador = ({ 
  label = 'Indicador',
  valor = '0',
  subtexto = '',
  variante = 'neutro',
  icono = null
}) => {
  return (
    <div className={`indicador-container indicador-${variante}`}>
      <div className={icono ? 'indicador-con-icono' : ''}>
        {icono && <div className="indicador-icono">{icono}</div>}
        <div className="indicador-contenido">
          <p className="indicador-label">{label}</p>
          <h3 className="indicador-valor">{valor}</h3>
          {subtexto && <p className="indicador-subtexto">{subtexto}</p>}
        </div>
      </div>
    </div>
  );
};

export default Indicador;