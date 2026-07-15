import listaClientes from '../controllers/client.controller.js';
import express from 'express';
const router = express.Router();


//metodos GET
router.get('/', listaClientes);

export default router;