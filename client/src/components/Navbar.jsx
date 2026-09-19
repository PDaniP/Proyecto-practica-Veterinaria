import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/Logo Veterinaria.png'
import axios from 'axios'

const navItems = [
  { label: 'Productos', path: '/productos' },
  { label: 'Ventas', path: '/ventas' },
  { label: 'Clientes', path: '/clientes' },
  { label: 'Mascotas', path: '/mascotas' },
  //{ label: 'Historias Clínicas', path: '/historias-clinicas' },
]



export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [usuario, setUsuario] = useState(null);
  const [mostrarBotones, setMostrarBotones] = useState(false);
  const currentUser = { name: usuario, avatar: '👨‍⚕️' }
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/users/comprobar',{withCredentials: true})
      .then(response => {
        if (response.data.valid) {
          setUsuario(response.data.user.usuario);
          setMostrarBotones(true);
        } else {
          setUsuario(null);
        }
      })
      .catch(error => {
        console.error("Error al comprobar el token:", error);
        setUsuario(null);
        
      });
  }, []);
  
  
  const cerrarSesion = () => {

    axios.post('http://localhost:3000/users/logout',{},{withCredentials: true})
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

      <NavLink to="/" className={({ isActive }) => `nav-link nav-link-home${isActive ? ' active' : ''}`}>
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
          <div className="user-section">
            <span className="user-avatar">{currentUser.avatar}</span>
            <span className="user-name">{currentUser.name}</span>
          </div>
        )}
        {mostrarBotones && (
      <button className="logout-button" onClick={cerrarSesion}>
        Cerrar Sesión
      </button>
        )}

    </header>
  )
}
