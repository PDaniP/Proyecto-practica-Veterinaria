//importaciones necesarias
import userController from '../controllers/user.controller.js'
import express from 'express'
import { validarUsuario } from '../middlewares/validator.middlewares.js'
const router = express.Router()


router.post('/login', userController.userLogin)

router.post('/logout', validarUsuario, userController.cerrarSesion)

router.get('/comprobar', validarUsuario, userController.comprobarUsuario)

router.get('/ventas/:id_cliente', validarUsuario, userController.obtenerRegistroVentaPorCliente)

router.post('/add', userController.crearUsuario)

router.put('/editar/:id', validarUsuario, userController.editarUsuario)

router.delete('/eliminar/:id', validarUsuario, userController.eliminarUsuario)

export default router