import express from "express";
import mascotasController from "../controllers/mascotas.controller.js";
import { validarUsuario } from "../middlewares/validator.middlewares.js";
const router = express.Router();

router.get('/', validarUsuario, mascotasController.listaMascotas);

router.post('/add', validarUsuario, mascotasController.añadirMascota);

router.get('/historia/:id', validarUsuario, mascotasController.historiaClinica);



router.post('/historia/consulta', validarUsuario, mascotasController.registrarConsulta);

router.get('/historia/consulta/:id_consulta', validarUsuario, mascotasController.consultaPorId);
router.get('/historia/vacuna/:id_vacuna', validarUsuario, mascotasController.vacunasPorId);

router.put('/editar/:id', validarUsuario, mascotasController.editarMascota);

router.put('/eliminar/:id', validarUsuario, mascotasController.eliminarMascota);

export default router;