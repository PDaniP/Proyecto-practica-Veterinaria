import express from "express";
import mascotasController from "../controllers/mascotas.controller.js";

const router = express.Router();

router.get('/', mascotasController.listaMascotas);

router.post('/add', mascotasController.añadirMascota);

router.put('/editar/:id', mascotasController.editarMascota);

router.put('/eliminar/:id', mascotasController.eliminarMascota);

export default router;