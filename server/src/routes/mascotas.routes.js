import express from "express";
import mascotasController from "../controllers/mascotas.controller.js";
import { validarUsuario } from "../middlewares/validator.middlewares.js";
import extrasController from "../controllers/extras.controller.js";
const router = express.Router();

router.get('/', validarUsuario, mascotasController.listaMascotas);

router.post('/add', validarUsuario, mascotasController.añadirMascota);

router.get('/historia/:id', validarUsuario, mascotasController.historiaClinica);

router.get('/motivos', validarUsuario, mascotasController.motivosConsultas);
router.post('/motivos/anadir', validarUsuario, extrasController.añadirMotivo);
//agregue la siguiente ruta
router.get(
  "/motivos/:motivoId/diagnosticos",
  validarUsuario,
  mascotasController.diagnosticosPorMotivo
);
router.post('/motivos/diagnostico/anadir', validarUsuario, extrasController.añadirDiagnosticoSegunMotivo);
router.post('/historia/consulta', validarUsuario, mascotasController.registrarConsulta);

router.get('/historia/consulta/:id_consulta', validarUsuario, mascotasController.consultaPorId);
router.put('/historia/consulta/editar/:id', validarUsuario, mascotasController.editarConsultaPorId);



router.put('/editar/:id', validarUsuario, mascotasController.editarMascota);

router.put('/eliminar/:id', validarUsuario, mascotasController.eliminarMascota);

export default router;