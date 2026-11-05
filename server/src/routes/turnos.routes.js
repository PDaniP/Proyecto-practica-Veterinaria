import express from 'express';
import turnosController from '../controllers/turnos.controller.js';
import { validarUsuario } from '../middlewares/validator.middlewares.js';

const router = express.Router();


router.get('/', turnosController.obtenerDatosTurno);

router.get('/fecha', turnosController.obtenerTurnosPorFecha);//agregue esta ruta para obtener turnos por fecha
router.get('/horario', validarUsuario, turnosController.obtenerHorarioAtencion);
router.put('/horario', validarUsuario, turnosController.actualizarHorarioAtencion);

router.post('/asignar', turnosController.asignarTurno);

router.patch('/modificar/:id', turnosController.modificarTurno);
router.patch('/cancelar/:id', turnosController.cancelarTurno);
router.patch('/completar/:id', turnosController.turnoCompletado);

export default router;