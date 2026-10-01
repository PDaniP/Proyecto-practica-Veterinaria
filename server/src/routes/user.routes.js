//importaciones necesarias
import userController from '../controllers/user.controller.js'
import { obtenerRegistroVentaPorCliente } from '../controllers/ventas.controller.js'
import express from 'express'
import { validarUsuario } from '../middlewares/validator.middlewares.js'
const router = express.Router()


router.post('/login', userController.userLogin)

router.post('/logout', validarUsuario, userController.cerrarSesion)

router.get('/comprobar', userController.comprobarUsuario)

router.get('/perfil', validarUsuario, userController.obtenerPerfil)

router.get('/lista', validarUsuario, userController.obtenerUsuarios)

router.patch('/datos/:id', validarUsuario, userController.editarDatosPropios)

router.get('/roles', validarUsuario, userController.obtenerRoles)

router.get('/ventas/:id_cliente', validarUsuario, obtenerRegistroVentaPorCliente)

router.post('/add',  userController.crearUsuario)

router.put('/editar/:id', validarUsuario, userController.editarUsuario)

router.put('/eliminar/:id', validarUsuario, userController.eliminarUsuario)

export default router