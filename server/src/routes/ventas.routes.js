import {descontarStock, registrarVenta, registrarDetallesVenta, listaVentas, obtenerDetallesVentaController} from '../controllers/ventas.controller.js'
import express from 'express'
const router = express.Router()


//metodos GET
router.get('/lista-ventas', listaVentas)
router.get('/detalles-venta/:id_venta', obtenerDetallesVentaController)

//metodos POST
router.post('/descontar-stock', descontarStock)
router.post('/registrar-venta', registrarVenta)
router.post('/registrar-detalles', registrarDetallesVenta)

export default router