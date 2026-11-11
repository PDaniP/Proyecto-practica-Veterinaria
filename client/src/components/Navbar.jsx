import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/Logo Veterinaria.png'
import api from '../../config/api.js'

const navItems = [
  { label: 'Productos', path: '/productos' },
  { label: 'Ventas', path: '/ventas' },
  { label: 'Clientes', path: '/clientes' },
  { label: 'Mascotas', path: '/mascotas' },
  { label: 'Estadísticas', path: '/estadisticas' },
  //{ label: 'Historias Clínicas', path: '/historias-clinicas' },
]



export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [usuario, setUsuario] = useState(null);
  const [mostrarBotones, setMostrarBotones] = useState(false);
  const currentUser = { name: usuario, avatar: '👨‍⚕️' }
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;
    let intervalId;

    const comprobarSesion = () => {
      api.get('/users/comprobar', { withCredentials: true })
        .then((response) => {
          if (!activo) return;
          if (response.data.valid) {
            setUsuario(response.data.user.usuario);
            setMostrarBotones(true);
            if (!intervalId) {
              intervalId = window.setInterval(comprobarSesion, 15000);
            }
          }
        })
        .catch((error) => {
          if (!activo) return;
          if (error.response?.status === 401) {
            setMostrarBotones(false);
            setUsuario(null);
            if (window.location.pathname !== '/login') {
              navigate('/login');
            }
            return;
          }
          console.error("Error al comprobar el token:", error);
        });
    };

    comprobarSesion();

    return () => {
      activo = false;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [navigate]);
  
  
  const cerrarSesion = () => {

    api.post('/users/logout',{},{withCredentials: true})
      .then(
        () => {
          setMostrarBotones(false);
          setUsuario(null);
          navigate('/login');
        }
      )
  }

  if (!usuario) {
    return null; // No renderizar nada si no hay usuario
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <img src={logo} alt="Logo Veterinaria" className="brand-logo" />
        <span>Veterinaria</span>
      </div>

      <NavLink to="/inicio" className={({ isActive }) => `nav-link nav-link-home${isActive ? ' active' : ''}`}>
        Home
      </NavLink>

      <button
        type="button"
        className={`navbar-toggle${menuOpen ? ' open' : ''}`}
        aria-expanded={menuOpen}
        aria-label="Abrir menú"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
      </button>

      <nav className={`navbar-nav${menuOpen ? ' open' : ''}`} aria-label="Principal">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link${isActive ? ' active' : ''}`
            }
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
        {mostrarBotones && (
          <button
            type="button"
            className="user-section"
            onClick={() => {
              setMenuOpen(false)
              navigate('/perfil')
            }}
            aria-label="Ver perfil"
          >
            <span className="user-avatar">{currentUser.avatar}</span>
            <span className="user-name">{currentUser.name}</span>
          </button>
        )}
        {mostrarBotones && (
      <button className="logout-button" onClick={cerrarSesion}>
        Cerrar Sesión
      </button>
        )}

    </header>
  )
}