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

        const users = await userModel();

        const user = users.find(u => u.usuario === usuario);
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign({ id: user.id, usuario: user.usuario, rol: user.rol }, JWT_SECRET, { expiresIn: '1d' });
            res.cookie("token", token, {
                httpOnly: true,
                secure: false, // Cambia a true en producción
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000 // 1 día
            });
            res.status(200).json({ message: 'Logueado Correctamente', user: { id: user.id, usuario: user.usuario, rol: user.rol } });
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

const comprobarUsuario = (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ valid:true, message: 'Token válido', user: decoded });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
    
};

const cerrarSesion = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false, // Cambia a true en producción
        sameSite: "lax"
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

export default {
    userLogin,
    comprobarUsuario,
    cerrarSesion,
    crearUsuario,
    editarUsuario,
    eliminarUsuario
}