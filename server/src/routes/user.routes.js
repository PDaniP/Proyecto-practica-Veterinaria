//importaciones necesarias
import userController from '../controllers/user.controller.js'
import express from 'express'
const router = express.Router()


router.post('/login', userController.userLogin)

router.post('/logout', userController.cerrarSesion)

router.get('/comprobar', userController.comprobarUsuario)

router.post('/add', userController.crearUsuario)

router.put('/editar/:id', userController.editarUsuario)

router.delete('/eliminar/:id', userController.eliminarUsuario)

export default router