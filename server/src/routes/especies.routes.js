import express from "express";
import especiesController from "../controllers/especies.controller.js";
import { validarUsuario } from "../middlewares/validator.middlewares.js";

const router = express.Router();

router.get("/", validarUsuario, especiesController.listarEspecies);
router.get("/:idEspecie/razas", validarUsuario, especiesController.listarRazas);
router.get("/reporte/cantidad-mascotas", validarUsuario, especiesController.ReporteCantidadMascotasPorEspecie);

export default router;