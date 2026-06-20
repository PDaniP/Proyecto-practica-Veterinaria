import { useState } from "react";
import FormularioProductos from "../../components/FormularioProductos";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";



export default function Productos() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const navigate = useNavigate()
  const [datos,setDatos] = useState([])

  useEffect(()=> {
    axios.get('http://localhost:3000/products')
    .then((response)=> setDatos(response.data))
  },[])

  console.log(datos)
 

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

      <ul>
    {datos.map((p)=>{
      return (
        <li>{p.nombre}</li>
      )
    })}
    </ul>


      {mostrarFormulario && <FormularioProductos />}
    </section>
  )
}
