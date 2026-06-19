import { useState } from "react";
import FormularioProductos from "../../components/FormularioProductos";
import { useNavigate } from "react-router-dom";



export default function Productos() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const navigate = useNavigate()
 

  return (
    <section className="page-shell">
      <h1>Productos</h1>
      <p>Administra el catálogo de productos para tu clínica veterinaria.</p>

    
      <button
        type="button"
        onClick={() =>navigate('/productos/añadir') }
      >
        {mostrarFormulario ? "Ocultar formulario" : "Agregar producto"}
      </button>


      {mostrarFormulario && <FormularioProductos />}
    </section>
  )
}
