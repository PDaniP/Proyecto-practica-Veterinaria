import { Router } from 'express'
import { cargarEstudio, listarEstudios, visualizarEstudio } from '../controllers/estudios.controller.js'
import upload from '../middlewares/uploadFile.js'
import { validarUsuario } from '../middlewares/validator.middlewares.js'

const router = Router()

const recibirArchivo = (req, res, next) => {
    upload.single('archivo')(req, res, (error) => {
        if (!error) return next();
        const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : error.statusCode || 400;
        return res.status(status).json({
            message: error.code === 'LIMIT_FILE_SIZE'
                ? 'El archivo supera el límite de 50 MB.'
                : error.message
        });
    });
};

router.post('/cargar', validarUsuario, recibirArchivo, cargarEstudio)
router.post('/consulta/:id_consulta', validarUsuario, recibirArchivo, cargarEstudio)
router.get('/consulta/:id_consulta', validarUsuario, listarEstudios)
router.get('/archivo/:id_estudio', validarUsuario, visualizarEstudio)

export default router