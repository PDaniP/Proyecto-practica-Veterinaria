import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Modal from '../../components/Modal.jsx'
import FormularioEdicionUsuario from '../../components/FormularioEdicionUsuario.jsx'
import './Perfil.css'

const API_URL = 'http://localhost:3000/users'

export default function Perfil() {
	const [usuario, setUsuario] = useState(null)
	const [modalAbierto, setModalAbierto] = useState(false)
	const [cargando, setCargando] = useState(true)
	const [error, setError] = useState('')
	const navigate = useNavigate()

	const cargarPerfil = async () => {
		try {
			setCargando(true)
			setError('')
			const response = await axios.get(`${API_URL}/perfil`, {
				withCredentials: true,
			})
			setUsuario(response.data.user)
		} catch (err) {
			console.error('Error al cargar el perfil:', err)
			setError('No se pudieron cargar los datos del usuario.')
		} finally {
			setCargando(false)
		}
	}

	useEffect(() => {
		cargarPerfil()
	}, [])

	if (cargando) {
		return <section className="page-shell perfil-page"><p className="perfil-loading">Cargando perfil...</p></section>
	}

	if (error) {
		return <section className="page-shell perfil-page"><p className="perfil-error">{error}</p></section>
	}

	const esAdministrador = Number(usuario?.id_rol) === 1

	return (
		<section className="page-shell perfil-page">
			<header className="perfil-header">
				<p className="perfil-eyebrow">Cuenta</p>
				<h1>Mi perfil</h1>
			</header>

			<article className="perfil-card">
				<div className="perfil-avatar" aria-hidden="true">👨‍⚕️</div>

				<dl className="perfil-datos">
					<div className="perfil-dato">
						<dt>Nombre</dt>
						<dd>{usuario.nombre}</dd>
					</div>
					<div className="perfil-dato">
						<dt>Usuario</dt>
						<dd>{usuario.usuario}</dd>
					</div>
					<div className="perfil-dato">
						<dt>Email</dt>
						<dd>{usuario.email}</dd>
					</div>
					<div className="perfil-dato">
						<dt>Rol</dt>
						<dd>{usuario.rol}</dd>
					</div>

					<div className="perfil-acciones">
						<button className="btn-primary" type="button" onClick={() => setModalAbierto(true)}>
							Editar datos
						</button>

						{esAdministrador && (
							<button className="btn-secondary" type="button" onClick={() => navigate('/panel-control')}>
								Panel de control
							</button>
						)}
					</div>
				</dl>
			</article>

			<Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)}>
				<FormularioEdicionUsuario
					usuarioInicial={usuario}
					onClose={() => setModalAbierto(false)}
					onUsuarioActualizado={cargarPerfil}
				/>
			</Modal>
		</section>
	)
}