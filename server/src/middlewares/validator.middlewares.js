//validador de usuario con cookies

import jwt from 'jsonwebtoken';
import userModel from '../models/user.models.js';

const JWT_SECRET = process.env.JWT_SECRET;

const limpiarCookieSesion = (res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
};

export const verificarCuentaActiva = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return next();

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return next();
        }
        console.error('Error al verificar el token de sesión:', error);
        return res.status(500).json({ message: 'No se pudo verificar la sesión.' });
    }

    try {
        const usuario = await userModel.obtenerUsuarioPorId(decoded.id);
        if (!usuario?.activo) {
            limpiarCookieSesion(res);
            return res.status(401).json({ message: 'La cuenta está inactiva o no existe.' });
        }
        req.user = decoded;
        req.usuarioAutenticado = usuario;
        return next();
    } catch (error) {
        console.error('Error al validar el estado de la cuenta:', error);
        return res.status(500).json({ message: 'No se pudo validar el estado de la cuenta.' });
    }
};

export const validarUsuario = async (req, res, next) => {
    if (req.user) return next();

    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const usuario = await userModel.obtenerUsuarioPorId(decoded.id);
        if (!usuario?.activo) {
            limpiarCookieSesion(res);
            return res.status(401).json({ message: 'La cuenta está inactiva o no existe.' });
        }
        req.user = decoded;
        return next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            limpiarCookieSesion(res);
            return res.status(401).json({ message: 'Token inválido' });
        }
        console.error('Error al validar la sesión:', error);
        return res.status(500).json({ message: 'No se pudo validar la sesión.' });
    }
};
