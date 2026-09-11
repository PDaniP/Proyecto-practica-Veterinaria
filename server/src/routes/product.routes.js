import express from 'express'
import productController from '../controllers/product.controller.js'
import { validarUsuario } from '../middlewares/validator.middlewares.js'

const router = express.Router()

router.get('/', validarUsuario, productController.listaProducto )
router.get('/product/categorias', validarUsuario, productController.listaCategorias)
router.get('/product/lotes', validarUsuario, productController.listaLotes)
router.get('/product/:id', validarUsuario, productController.productoPorId)




router.post('/product/add', validarUsuario, productController.añadirProducto)
router.post('/product/addlote', validarUsuario, productController.añadirLote)
router.post('/product/addcategoria', validarUsuario, productController.añadirCategoria)

router.patch('/product/update/:id', validarUsuario, productController.editarProducto)

router.delete('/product/delete/:id', validarUsuario, productController.eliminarProducto)



export default router