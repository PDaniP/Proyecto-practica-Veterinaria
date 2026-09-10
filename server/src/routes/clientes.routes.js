import clientController from '../controllers/client.controller.js';
import express from 'express';
import { validarUsuario } from '../middlewares/validator.middlewares.js';
const router = express.Router();


//metodos GET
router.get('/', validarUsuario, clientController.listaClientes);

//metodos POST
router.post('/add', validarUsuario, clientController.añadirCliente);

//metodos PUT
router.put('/editar/:id', validarUsuario, clientController.editarCliente);

//metodos DELETE
router.delete('/eliminar/:id', validarUsuario, clientController.eliminarCliente);

export default router;