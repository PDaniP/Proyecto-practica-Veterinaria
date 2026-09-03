import clientController from '../controllers/client.controller.js';
import express from 'express';
const router = express.Router();


//metodos GET
router.get('/', clientController.listaClientes);

//metodos POST
router.post('/add', clientController.añadirCliente);

//metodos PUT
router.put('/editar/:id', clientController.editarCliente);

//metodos DELETE
router.delete('/eliminar/:id', clientController.eliminarCliente);

export default router;