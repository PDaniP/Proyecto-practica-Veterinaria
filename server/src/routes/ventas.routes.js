import {descontarStock, registrarVenta, registrarDetallesVenta} from '../controllers/ventas.controller.js'
import express from 'express'
const router = express.Router()


//metodos POST
router.post('/descontar-stock', descontarStock)
router.post('/registrar-venta', registrarVenta)
router.post('/registrar-detalles', registrarDetallesVenta)

export default router