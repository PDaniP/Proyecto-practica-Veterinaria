import express from 'express'
import productController from '../controllers/product.controller.js'

const router = express.Router()

router.get('/', productController.listaProducto )
router.get('/product/categorias', productController.listaCategorias)
router.get('/product/lotes', productController.listaLotes)
router.get('/product/:id', productController.productoPorId)




router.post('/product/add',productController.añadirProducto)
router.post('/product/addlote', productController.añadirLote)
router.post('/product/addcategoria', productController.añadirCategoria)

router.patch('/product/update/:id', productController.editarProducto)

router.delete('/product/delete/:id', productController.eliminarProducto)



export default router