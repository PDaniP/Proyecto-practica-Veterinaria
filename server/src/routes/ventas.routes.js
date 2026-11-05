import {descontarStock, registrarVenta, obtenerVentaPorFecha, registrarDetallesVenta, listaVentas, obtenerDetallesVentaController, reporteVentas, reporteVentasPorDia, reporteVentasPorSemana, reporteVentasPorMes, reporteProductoMasVendido} from '../controllers/ventas.controller.js'
import express from 'express'
import { validarUsuario } from '../middlewares/validator.middlewares.js'
const router = express.Router()


//metodos GET
router.get('/lista-ventas', validarUsuario, listaVentas)
router.get('/detalles-venta/:id_venta', validarUsuario, obtenerDetallesVentaController)
router.get('/venta-por-fecha', validarUsuario, obtenerVentaPorFecha)
router.get('/reporte', validarUsuario, reporteVentas)
router.get('/reporte/dia', validarUsuario, reporteVentasPorDia)//requiere dia por query
router.get('/reporte/semana', validarUsuario, reporteVentasPorSemana)//requiere dia inicio y dia fin por query
router.get('/reporte/mes', validarUsuario, reporteVentasPorMes)//requiere dia inicio y dia fin por query
router.get('/reporte/producto-mas-vendido', reporteProductoMasVendido)


//metodos POST
router.post('/descontar-stock', validarUsuario, descontarStock)
router.post('/registrar-venta', validarUsuario, registrarVenta)
router.post('/registrar-detalles', validarUsuario, registrarDetallesVenta)

export default router