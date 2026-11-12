import userModel from '../models/user.models.js'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const JWT_SECRET = process.env.JWT_SECRET;

const userLogin = async (req, res) => {
    try {
        const { usuario, password } = req.body;
        if (!usuario || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            });
        }

        const users = await userModel.userModel();

        const user = users.find(u => u.usuario === usuario);
        if (user?.activo && await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign({ id: user.id, usuario: user.usuario, rol: user.id_rol }, JWT_SECRET, { expiresIn: '1d' });//perdon matu cambie "rol: user.rol" por "rol: user.id_rol"
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 24 * 60 * 60 * 1000 
            });
            res.status(200).json({ message: 'Logueado Correctamente', user: { id: user.id, usuario: user.usuario, rol: user.rol }, token });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error("Error en userLogin:", error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

const comprobarUsuario = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado' });
    }
    try {
        const decoded = req.user ?? jwt.verify(token, JWT_SECRET);
        const usuario =
            req.usuarioAutenticado ?? await userModel.obtenerUsuarioPorId(decoded.id);
        if (!usuario?.activo) {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
            });
            return res.status(401).json({ message: 'La cuenta está inactiva o no existe.' });
        }
        return res.status(200).json({ valid: true, message: 'Token válido', user: decoded });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
            });
            return res.status(401).json({ message: 'Token inválido' });
        }
        console.error('Error al comprobar la sesión:', error);
        return res.status(500).json({ message: 'No se pudo comprobar la sesión.' });
    }
};

const obtenerPerfil = async (req, res) => {
    try {
        const usuario = await userModel.obtenerUsuarioPorId(req.user.id);

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ user: usuario });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el perfil', error });
    }
};

const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await userModel.obtenerUsuarios();
        res.status(200).json({ usuarios });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error });
    }
};

const cambiarEstadoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const activo = req.body?.activo;

        if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0 || typeof activo !== 'boolean') {
            return res.status(400).json({ message: 'El ID y el estado del usuario no son válidos.' });
        }

        const administrador = await userModel.obtenerUsuarioPorId(req.user.id);
        if (!administrador || administrador.rol?.trim().toLowerCase() !== 'administrador') {
            return res.status(403).json({ message: 'Solo un administrador puede cambiar estados de usuario.' });
        }

        const usuarioObjetivo = await userModel.obtenerUsuarioPorId(id);
        if (!usuarioObjetivo) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        if (usuarioObjetivo.rol?.trim().toLowerCase() === 'administrador') {
            return res.status(403).json({ message: 'No se puede cambiar el estado de un administrador.' });
        }

        const usuarioActualizado = await userModel.actualizarEstadoUsuarioADB(id, activo);
        if (!usuarioActualizado) {
            return res.status(403).json({ message: 'No se puede cambiar el estado de un administrador.' });
        }

        return res.status(200).json({
            message: 'Estado del usuario actualizado correctamente.',
            user: usuarioActualizado,
        });
    } catch (error) {
        console.error('Error al cambiar el estado del usuario:', error);
        return res.status(500).json({ message: 'No se pudo cambiar el estado del usuario.' });
    }
};

const restablecerContrasenaUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({ message: 'El ID del usuario no es válido.' });
        }

        const administrador = await userModel.obtenerUsuarioPorId(req.user.id);
        if (!administrador || administrador.rol?.trim().toLowerCase() !== 'administrador') {
            return res.status(403).json({ message: 'Solo un administrador puede restablecer contraseñas.' });
        }

        const usuarioObjetivo = await userModel.obtenerUsuarioPorId(id);
        if (!usuarioObjetivo) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        if (usuarioObjetivo.rol?.trim().toLowerCase() === 'administrador') {
            return res.status(403).json({ message: 'No se puede restablecer la contraseña de un administrador.' });
        }

        const passwordHash = await bcrypt.hash('temp123', 10);
        const usuarioActualizado = await userModel.restablecerContrasenaUsuarioADB(
            id,
            passwordHash,
        );
        if (!usuarioActualizado) {
            return res.status(403).json({ message: 'No se puede restablecer la contraseña de un administrador.' });
        }

        return res.status(200).json({
            message: 'La contraseña se restableció correctamente.',
        });
    } catch (error) {
        console.error('Error al restablecer la contraseña del usuario:', error);
        return res.status(500).json({ message: 'No se pudo restablecer la contraseña.' });
    }
};

const editarDatosPropios = async (req, res) => {
    try {
        const { usuario, email, password } = req.body;

        if (!usuario?.trim() || !email?.trim()) {
            return res.status(400).json({ message: 'El usuario y el email son obligatorios' });
        }

        const password_hash = password?.trim()
            ? await bcrypt.hash(password, 10)
            : null;
        const usuarioEditado = await userModel.editarDatosUsuarioADB(req.user.id, {
            usuario: usuario.trim(),
            email: email.trim(),
            password_hash,
        });

        res.status(200).json({ message: 'Datos actualizados correctamente', user: usuarioEditado });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'El email ya está en uso' });
        }
        res.status(500).json({ message: 'Error al actualizar los datos', error });
    }
};

const cerrarSesion = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    return res.status(200).json({ message: 'Sesión cerrada correctamente' });
};

const crearUsuario = async (req, res) => {
    try {
        const { nombre,usuario,email, password, rol,activo } = req.body;
        if (!nombre || !usuario || !email || !password || !rol || !activo) {
            return res.status(400).json({ message: 'Faltan datos obligatorios' });
        }
        const password_hash = await bcrypt.hash(password, 10);
        const nuevoUsuario = await userModel.añadirUsuarioADB({ nombre, usuario, email, password_hash, id_rol: rol, activo });
        res.status(201).json({ message: 'Usuario creado correctamente', user: nuevoUsuario });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario', error });
    }
}

const editarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Falta el ID del usuario' });
        }
        const { nombre,usuario,email, password, rol,activo } = req.body;
        if (!nombre || !usuario || !email || !password || !rol || !activo) {
            return res.status(400).json({ message: 'Faltan datos obligatorios' });
        }
        const password_hash = await bcrypt.hash(password, 10);
        const usuarioEditado = await userModel.editarUsuarioADB(id, { nombre, usuario, email, password_hash, id_rol: rol, activo });
        res.status(200).json({ message: 'Usuario editado correctamente', user: usuarioEditado });
    } catch (error) {
        res.status(500).json({ message: 'Error al editar el usuario', error });
    }
};

const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Falta el ID del usuario' });
        }
        const usuarioEliminado = await userModel.eliminarUsuarioADB(id);
        res.status(200).json({ message: 'Usuario eliminado correctamente', user: usuarioEliminado });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
}; 

const obtenerRoles = async (req, res) => {
    try {
        const roles = await userModel.obtenerRoles();
        res.status(200).json({ roles });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los roles', error });
    }
};

export default {
    userLogin,
    comprobarUsuario,
    obtenerPerfil,
    obtenerUsuarios,
    cambiarEstadoUsuario,
    restablecerContrasenaUsuario,
    editarDatosPropios,
    cerrarSesion,
    crearUsuario,
    editarUsuario,
    eliminarUsuario,
    obtenerRoles
}