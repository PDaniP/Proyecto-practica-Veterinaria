import {obtenerEstadoWhatsapp} from '../config/whatsapp.js';
import jwt from 'jsonwebtoken';
import express from 'express';

const router = express.Router();

router.get('/estado', (req, res) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.sendStatus(401);
        }

        const usuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (Number(usuario.rol) !== 1) {
            return res.sendStatus(403);
        }

        res.set('Cache-Control', 'no-store');
        return res.json(obtenerEstadoWhatsapp());

    } catch (error) {
        return res.sendStatus(401);
    }
});

export default router;