//validador de usuario con cookies

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const validarUsuario = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};
