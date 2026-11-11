import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './App.css'
import WhatsApp from './pages/WhatsApp.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/home.jsx'
import Productos from './pages/comercial/Productos.jsx'
import Ventas from './pages/comercial/Ventas.jsx'
import ReportesVentas from './pages/comercial/ReportesVentas.jsx'
import AlertasStock from './pages/comercial/AlertasStock.jsx'
import Clientes from './pages/comercial/Clientes.jsx'
import Mascotas from './pages/clinica/Mascotas.jsx'
import HistoriasClinicas from './pages/clinica/historiasClinicas.jsx'
import Login from './pages/auth/Login.jsx'
import { VerificacionToken } from './pages/auth/Login.jsx'
import Perfil from './pages/auth/Perfil.jsx'
import PanelControl from './pages/auth/PanelControl.jsx'
import FormularioProductos from './components/FormularioProductos.jsx'
import Estadisticas from './pages/Estadisticas.jsx'
import { SystemFeedbackProvider } from './components/SystemFeedback.jsx'

function App() {


  return (
    <BrowserRouter>
      <SystemFeedbackProvider>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
            <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />


            <Route element={<VerificacionToken />}>
              <Route path="/inicio" element={<Home />} />
              {/*<Route path="/" element={<Home />} />*/}
              <Route path="/productos" element={<Productos />} />
              <Route path='/productos/añadir' element={<FormularioProductos />}></Route>
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/reportes" element={<ReportesVentas />} />
              <Route path="/alertas" element={<AlertasStock />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/mascotas" element={<Mascotas />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/panel-control" element={<PanelControl />} />
              <Route path="/historias-clinicas/:id" element={<HistoriasClinicas />} />
              <Route path="/estadisticas" element={<Estadisticas />} />
              <Route path="/whatsapp" element={<WhatsApp />} />
            </Route>
            </Routes>
          </main>
        </div>
      </SystemFeedbackProvider>
    </BrowserRouter>
  )
}

export default App