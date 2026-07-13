import {obtenerLotesVentas, actualizarStockLote, añadirVenta, filtrarProductoPorID, detallesVenta} from '../models/ventas.model.js'

const descontarStock = async (req, res) => {
    const { id_lote, cantidad } = req.body;
    try {
        const lote = await actualizarStockLote(id_lote, cantidad);
        if (!lote) {
            return res.status(404).json({ message: 'Lote no encontrado' });
        }
        res.json({ message: 'Stock descontado correctamente', lote });
    } catch (error) {
        res.status(500).json({ message: 'Error al descontar el stock', error });
    }
};

const eliminarLoteVacio = async (req, res) => {
    const { id_lote } = req.body;
    try {
        const loteEliminado = await eliminarLoteVacio(id_lote);
        if (!loteEliminado) {
            return res.status(404).json({ message: 'Lote no encontrado o no vacío' });
        }
        res.json({ message: 'Lote eliminado correctamente', loteEliminado });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el lote', error });
    }
};

const registrarVenta = async (req, res) => {
    const { id_usuario, id_cliente, metodoPago, total } = req.body;
    if(!id_usuario || !id_cliente || !metodoPago || !total) {
        return res.status(400).json({ message: 'Faltan datos para registrar la venta' });
    }
    const fechaVenta = new Date(); // Obtener la fecha actual
    try {
        const venta = await añadirVenta(id_usuario, id_cliente, metodoPago, fechaVenta, total);
        if (!venta) {
            return res.status(500).json({ message: 'Error al registrar la venta' });
        }
        res.status(201).json({ message: 'Venta registrada correctamente', venta });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la venta', error });
    }
};

const registrarDetallesVenta = async (req, res) => {
    const { id_venta, id_producto, id_servicio, cantidad} = req.body;
    if(!id_venta || (!id_producto && !id_servicio) || !cantidad) {
        return res.status(400).json({ message: 'Faltan datos para registrar los detalles de la venta' });
    }

    const producto = id_producto ? await filtrarProductoPorID(id_producto) : null;
    
    const subtotal = producto ? producto.precio_venta * cantidad : null;
   
    if(!id_producto) {
        try {
            const detalle = await detallesVenta(id_venta, null, id_servicio, cantidad, producto.precio_venta, subtotal);
            console.log('Detalle de venta registrado:', detalle);
            if (!detalle) {
                return res.status(500).json({ message: 'Error al registrar los detalles de la venta' });
            }
            res.status(201).json({ message: 'Detalles de la venta registrados correctamente', detalle });
        } catch (error) {
            res.status(500).json({ message: 'Error al registrar los detalles de la venta', error });
        }
    } else if(!id_servicio) {
        try {
            const detalle = await detallesVenta(id_venta, id_producto, null, cantidad, producto.precio_venta, subtotal);
            console.log('Detalle de venta registrado:', detalle);
            if (!detalle) {
                return res.status(500).json({ message: 'Error al registrar los detalles de la venta' });
            }
            res.status(201).json({ message: 'Detalles de la venta registrados correctamente', detalle });
        } catch (error) {
            res.status(500).json({ message: 'Error al registrar los detalles de la venta', error });
            
        }
    }
};

export { descontarStock, eliminarLoteVacio, registrarVenta, registrarDetallesVenta };