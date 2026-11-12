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
    const {id_producto, codigo_lote, cantidad, fecha_vencimiento, activo} = req.body

    if (!id_producto || !codigo_lote || !cantidad || !fecha_vencimiento || !activo){
        return res.status(401).json({message:"Error al añadir, existen campos vacios"})
    }
    const stock_inicial = 0
    const LoteProducto = await productModel.obtenerLotePorIdDeProducto(Number(id_producto))
    let stock_actual = cantidad 
 
    
    const datos = await productModel.añadirLoteADB(Number(id_producto),codigo_lote,Number(cantidad), stock_actual,fecha_vencimiento,activo)
    
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
    const id = Number(req.params.id);
    const costo = Number(precio_costo);
    const venta = Number(precio_venta);
    const minimo = Number(stock_minimo);
    if(!Number.isInteger(id) || id <= 0 ||
        precio_costo === '' || stock_minimo === '' ||
        !Number.isFinite(costo) || costo < 0 ||
        precio_venta === null || precio_venta === undefined ||
        precio_venta === '' || !Number.isFinite(venta) || venta <= 0 ||
        !Number.isInteger(minimo) || minimo < 0){
        return res.status(400).json({message:"Ingrese precios válidos y un stock mínimo no negativo."})
    }

    try {
        const datos = await productModel.editarProductoEnDB(costo,venta,minimo,id);
        if(!datos){
            return res.status(404).json({message: "Producto no encontrado"})
        }
        return res.status(200).json({message:"Producto editado con exito", producto: datos})
    } catch (error) {
        console.error('Error al editar el producto:', error);
        return res.status(500).json({
            message: 'No se pudo actualizar el producto. Revisá los datos y la conexión con la base de datos.',
            code: error.code
        });
    }
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

const reporteCantidadProductos = async (req, res) => {
    const datos = await productModel.reporteCantidadProductos()
    

    const reporte = [
        {name:'sin stock',value: Number(datos.sin_stock)},
        {name:'Stock bajo', value: Number(datos.bajo_stock) },
        {name:'Stock suficiente', value: Number(datos.stock_suficiente) }
    ]

    if(!datos || datos.length < 1){
        return res.status(401).json({message:"No existen datos"})
    }
    res.status(200).json({reporte, message:"Datos obtenidos con exito"})
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
                reporteCantidadProductos
}