import { useState } from "react";
import axios from "axios";

const NuevaCategoria = ({ onCategoriaCreada }) => {
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [categoria, setCategoria] = useState({
    nombre: "",
    descripcion: "",
  });

  const handleChange = (e) => {
    setCategoria({
      ...categoria,
      [e.target.name]: e.target.value,
    });
  };

  const validar = () => {
    if (!categoria.nombre.trim()) {
      setError("El nombre es obligatorio");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    let categoriaCreada = false
    if (!validar()) return;

    try {
      setLoading(true);
      setError("");
      await axios.post("http://localhost:3000/products/product/addcategoria", categoria,{withCredentials:true})
            .then(()=> categoriaCreada = categoria)

      console.log(categoriaCreada)

      // 👉 avisar al componente padre
      if (onCategoriaCreada) {
        onCategoriaCreada(categoriaCreada);
      }

      // 👉 resetear formulario
      setCategoria({ nombre: "", descripcion: "" });
      setMostrar(false);
    } catch (err) {
      console.error(err);
      setError("Error al crear la categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{formStyles}</style>
      <div>
        {/* Botón para abrir */}
        <button
          type="button"
          onClick={() => setMostrar(true)}
          className="btn-add"
          style={{ marginLeft: "10px" }}
        >
          ➕ Nueva Categoria
        </button>

        {/* Formulario */}
        {mostrar && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "#aaa7a7",
            }}
          >
            <h4 className="titulo">Nueva Categoría</h4>
            <div className="form-fields">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={categoria.nombre}
                onChange={handleChange}
              />

              

              <input
                type="text"
                name="descripcion"
                placeholder="Descripción"
                value={categoria.descripcion}
                onChange={handleChange}
              />

             
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="button-group">
              <button className="btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setMostrar(false);
                  setError("");
                }}
                style={{ marginLeft: "10px" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NuevaCategoria;

const formStyles = `
.button-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.button-group button {
    flex: 1;
    height: 35px;
}

.btn {
  height: 30px;
  background: #534ab7;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #463fa0;
}

.btn:active {
  transform: scale(0.98);
}

.btn-secondary {
  height: 30px;
  background: #fc0000;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #9c0404;
  transform: scale(1.02);
}

.btn-secondary:active {
  transform: scale(0.90);
}


.btn-add {
  height: 37px;
  background: linear-gradient(135deg, #4CAF50, #2e7d32);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0 14px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: auto
}

.btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.btn-add:active {
  transform: scale(0.96);
}


.btn-small {
  height: 32px;
  padding: 0 10px;
  font-size: 12px;
}


button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 5px; 
  margin-bottom: 5px; 
}

.titulo{
    margin:2px
    
}
`;
