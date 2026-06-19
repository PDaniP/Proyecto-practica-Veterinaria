import productModel from "../models/product.model.js";

const añadirProducto = async (req,res) => {
    const {id_categoria, nombre,descripcion,codigo_barras,precio_costo,precio_venta,stock_actual,stock_minimo,venta_al_publico, fecha_de_vencimiento} = req.body
    if(!id_categoria || !nombre || !descripcion || !codigo_barras || !precio_costo || !precio_venta || !stock_actual || !stock_minimo || !venta_al_publico || !fecha_de_vencimiento){
        return res.status(401).json({message: "Error al añadir, existen campos vacios"})
    }
    const datos = await productModel.añadirProductoADB(Number(id_categoria),nombre,descripcion,Number(codigo_barras),Number(precio_costo),Number(precio_venta),Number(stock_actual),Number(stock_minimo),venta_al_publico, fecha_de_vencimiento)
    console.log(datos)
    if (!datos){
        res.status(401).json({message: 'error al añadir producto'})
    }
    res.status(200).json({message:"producto añadido con exito"})


}

const editarProducto = () => {

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
    const datos = await productModel.obtenerProductos()
    if(datos.length < 1){
        res.status(401).json({message:"no existen datos"})
    }
    res.status(200).json(datos,{message:'datos obtenidos con exito'})
}

const productoPorId = async (req, res) => {
    const {id} = req.params
    const datos = await productModel.obtenerProductoPorId(id)
    console.log(datos)
    if(datos.length < 1){
        res.status(401).json({message: "no existen datos con esa id"})
    }
    res.status(200).json(datos,{message: 'Producto obtenido exitosamente'})
} 

export default {listaProducto,
                productoPorId,
                eliminarProducto,
                editarProducto,
                añadirProducto
}