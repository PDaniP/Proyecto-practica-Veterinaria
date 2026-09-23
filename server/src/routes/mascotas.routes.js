import express from "express";
import mascotasController from "../controllers/mascotas.controller.js";
import { validarUsuario } from "../middlewares/validator.middlewares.js";
const router = express.Router();

router.get('/', validarUsuario, mascotasController.listaMascotas);

router.post('/add', validarUsuario, mascotasController.añadirMascota);

router.get('/historia/:id', validarUsuario, mascotasController.historiaClinica);

//router.put('/historia/actualizar/:id', validarUsuario, mascotasController.actualizarHistoriaClinica);

router.put('/editar/:id', validarUsuario, mascotasController.editarMascota);

router.put('/eliminar/:id', validarUsuario, mascotasController.eliminarMascota);

export default router;