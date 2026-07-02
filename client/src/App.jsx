import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar.jsx'
import Home from './pages/home.jsx'
import Productos from './pages/comercial/Productos.jsx'
import Ventas from './pages/comercial/Ventas.jsx'
import Clientes from './pages/comercial/Clientes.jsx'
import Mascotas from './pages/clinica/Mascotas.jsx'
import HistoriasClinicas from './pages/clinica/historiasClinicas.jsx'
import Login from './pages/auth/Login.jsx'
import { VerificacionToken } from './pages/auth/Login.jsx'
import FormularioProductos from './components/FormularioProductos.jsx'


function App() {


  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<VerificacionToken />}>

              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Productos />} />
              <Route path='/productos/añadir' element={<FormularioProductos />}></Route>
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/mascotas" element={<Mascotas />} />
              <Route path="/historias-clinicas" element={<HistoriasClinicas />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
