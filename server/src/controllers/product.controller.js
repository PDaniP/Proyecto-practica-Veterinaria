import productModel from "../models/product.model.js";

const añadirProducto = async (req,res) => {
    const {id_categoria, nombre,marca,descripcion,codigo_barras,precio_costo,precio_venta,stock_minimo,venta_al_publico} = req.body
    if(!id_categoria || !nombre || !marca || !descripcion || !codigo_barras || !precio_costo || !precio_venta || !stock_minimo){
        return res.status(401).json({message: "Error al añadir, existen campos vacios"})
    }
    const datos = await productModel.añadirProductoADB(Number(id_categoria),nombre,marca,descripcion,Number(codigo_barras),Number(precio_costo),Number(precio_venta),Number(stock_minimo),venta_al_publico)
    
    if (!datos){
        res.status(401).json({message: 'error al añadir producto'})
    }
    res.status(200).json({message:"producto añadido con exito"})


}

const añadirCategoria = async (req,res) => {
    const {nombre,descripcion} = req.body

    if(!nombre || !descripcion){
        return res.status(401).json({message:"Error al añadir, existen campos vacios"})
    }
    const datos = await productModel.añadirCategoriaADB(nombre,descripcion)
    
    if(!datos){
        res.status(401).json({message: "Error al añadir categoria"})
    }
    res.status(200).json({message: "Categoria añadida con exito"})
}

const añadirLote = async (req,res) => {
    const {id_producto, codigo_lote, stock_inicial,stock_actual, fecha_vencimiento, activo} = req.body

    if (!id_producto || !codigo_lote || !stock_actual || !stock_inicial || !fecha_vencimiento || !activo){
        return res.status(401).json({message:"Error al añadir, existen campos vacios"})
    }
    const datos = await productModel.añadirLoteADB(Number(id_producto),codigo_lote,Number(stock_inicial),Number(stock_actual),fecha_vencimiento,activo)
    
    if(datos.fecha_vencimiento < new Date().toISOString().split('T')[0]) {
        datos.activo = false;
    }
    if(!datos) {
        res.status(401).json({message: 'Error al añadir producto'})
    }
    res.status(200).json({message:'Lote añadido con exito'})
    }

const editarProducto = async (req,res) => {
    const{precio_costo,precio_venta, stock_minimo} = req.body
    const {id} = req.params
    console.log(precio_costo,precio_venta,stock_minimo,id)
    if(!precio_costo || !precio_venta || !stock_minimo){
        return res.status(401).json({message:"Error al añadir, existen campos vacios"})
    }
    const datos = await productModel.editarProductoEnDB(precio_costo,precio_venta,stock_minimo,id)
    
    if(!datos){
        return res.status(401).json({message: "Error al editar productos"})
    }
    res.status(200).json({message:"Producto editado con exito"})
}

const eliminarProducto = async (req,res) => {
    const {id} = req.params
    let comprobarAccion = false
    if(!id){
        res.status(400).json({message: "No existe una id valida"})
    }
    if (!comprobarAccion){
    await productModel.eliminarProductoEnDB(id)
    comprobarAccion = true
    res.status(200).json({message:"producto eliminado con exito"})
    }else{
        res.status(400).json({message:"Accion No Realizada"})
    }

}

const listaProducto = async (req,res) => {
    const datos = await productModel.productosConStockSumado()
    if(datos.length < 1){
        res.status(401).json({message:"no existen datos"})
    }
    
    res.status(200).json(datos,{message:'datos obtenidos con exito'})
}

const listaCategorias = async (req,res) => {
    const datos = await productModel.obtenerCategorias()
    if(!datos){
        res.status(401).json({message:"No existen datos"})
    }
    res.status(200).json(datos,{message:"Datos obtenidos con exito"})
}

const listaLotes = async (req,res) => {
        const datosLoteYProductos = await productModel.obtenerLoteConProducto()
        console.log(datosLoteYProductos)
        if(!datosLoteYProductos || datosLoteYProductos.length < 1){
            return res.status(401).json({message:"No existen datos"})
    }
        const datosFormateados = datosLoteYProductos.map((lote) => ({
            codigo_lote: lote.codigo_lote,
            nombre_producto: lote.nombre,
            marca_producto: lote.marca,
            stock_inicial: lote.stock_inicial,
            stock_actual: lote.stock_actual,
            fecha_vencimiento: lote.fecha_vencimiento,
            activo: lote.activo,
        }));
        
    res.status(200).json({datos: datosFormateados, message:"Datos obtenidos con exito"})
}
const productoPorId = async (req, res) => {
    const {id} = req.params
    const datos = await productModel.obtenerProductoPorId(id)
    
    if(datos.length < 1){
        return res.status(401).json({message: "no existen datos con esa id"})
    }
    res.status(200).json(datos,{message: 'Producto obtenido exitosamente'})
} 



export default {listaProducto,
                productoPorId,
                eliminarProducto,
                editarProducto,
                añadirProducto,
                añadirLote,
                añadirCategoria,
                listaCategorias,
                listaLotes,
}