import {descontarStock, registrarVenta, obtenerVentaPorFecha, registrarDetallesVenta, listaVentas, obtenerDetallesVentaController} from '../controllers/ventas.controller.js'
import express from 'express'
import { validarUsuario } from '../middlewares/validator.middlewares.js'
const router = express.Router()


//metodos GET
router.get('/lista-ventas', validarUsuario, listaVentas)
router.get('/detalles-venta/:id_venta', validarUsuario, obtenerDetallesVentaController)
router.get('/venta-por-fecha', validarUsuario, obtenerVentaPorFecha)

//metodos POST
router.post('/descontar-stock', validarUsuario, descontarStock)
router.post('/registrar-venta', validarUsuario, registrarVenta)
router.post('/registrar-detalles', validarUsuario, registrarDetallesVenta)

export default router