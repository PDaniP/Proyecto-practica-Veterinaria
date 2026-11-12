import {obtenerLotesVentas, 
    actualizarStockLote,
     añadirVenta, 
     registrarVentaCompleta,
     obtenerVentaPorFechaActual, 
     filtrarProductoPorID, 
     detallesVenta, 
     obtenerListaVentas,
      obtenerDetallesVenta, 
      filtrarServiciosPorId,
      generarReporteVentas,
      generarReporteVentasPorDia,
      generarReporteVentasPorSemana,
      generarReporteVentasPorMes,
    productoMasVendido} from '../models/ventas.model.js'
import productModel from '../models/product.model.js'

const descontarStock = async (req, res) => {
    const { id_producto,cantidad } = req.body;
    try {
        const id_lote = await productModel.obtenerLotePorIdDeProducto(id_producto);
        if (!id_lote || id_lote.length === 0) {
            return res.status(404).json({ message: 'No se encontró ningún lote para el producto especificado' });
        }
        const lote = await actualizarStockLote(id_lote[0].id, cantidad);
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
        res.status(201).json({ message: 'Venta registrada correctamente', id_venta: venta.id });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la venta', error });
    }
};

const registrarVentaCompletaController = async (req, res) => {
    const { id_cliente, metodoPago, items } = req.body;
    const idCliente = Number(id_cliente);
    if (!Number.isInteger(idCliente) || idCliente <= 0 || !metodoPago ||
        !Array.isArray(items) || items.length === 0 ||
        items.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) {
        return res.status(400).json({ message: 'Faltan datos válidos para registrar la venta.' });
    }

    try {
        const venta = await registrarVentaCompleta({
            id_usuario: req.user.id,
            id_cliente: idCliente,
            metodoPago,
            items
        });
        res.status(201).json({ message: 'Venta registrada correctamente', ...venta });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error('Error al registrar la venta completa:', error);
        res.status(500).json({ message: 'Error al registrar la venta.' });
    }
};

const obtenerVentaPorFecha = async (req, res) => {
    try {
        const venta = await obtenerVentaPorFechaActual();
        if (!venta) {
            return res.status(404).json({ message: 'No se encontró ninguna venta para la fecha actual' });
        }
        res.status(200).json({ message: 'Venta obtenida correctamente', venta });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la venta por fecha', error });
    }
};

const registrarDetallesVenta = async (req, res) => {
    const { id_venta, id_producto, id_servicio, cantidad} = req.body;
    
    if(!id_venta || (!id_producto && !id_servicio) || !cantidad) {
        return res.status(400).json({ message: 'Faltan datos para registrar los detalles de la venta' });
    }

    const producto = id_producto ? await filtrarProductoPorID(id_producto) : null;
    const servicio = id_servicio ? await filtrarServiciosPorId(id_servicio) : null;
    
    const subtotal = producto ? producto.precio_venta * cantidad : servicio ? servicio.precio_venta * cantidad : 0;
   
    if(!id_producto) {
        try {
            const detalle = await detallesVenta(id_venta, null, id_servicio, cantidad, servicio.precio_venta, subtotal);
           
            if (!detalle) {
                return res.status(500).json({ message: 'Error al registrar los detalles de la venta' });
            }
            res.status(201).json({ message: 'Detalles de la venta registrados correctamente', detalle });
        } catch (error) {
            res.status(500).json({ message: 'Error al registrar los detalles de la venta', error });
            console.error('Error al registrar los detalles de la venta:', error);
        }
    } else if(!id_servicio) {
        try {
            const detalle = await detallesVenta(id_venta, id_producto, null, cantidad, producto.precio_venta, subtotal);
            
            if (!detalle) {
                return res.status(500).json({ message: 'Error al registrar los detalles de la venta' });
            }
            res.status(201).json({ message: 'Detalles de la venta registrados correctamente', detalle });
        } catch (error) {
            res.status(500).json({ message: 'Error al registrar los detalles de la venta', error });
            console.error('Error al registrar los detalles de la venta:', error);
        }
    }
};

const listaVentas = async (req, res) => {
    try {
        const ventas = await obtenerListaVentas();
        res.status(200).json({ message: 'Lista de ventas obtenida correctamente', ventas: ventas.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la lista de ventas', error });
    }
};

const obtenerDetallesVentaController = async (req, res) => {
    const { id_venta } = req.params;
    try {
        const detalles = await obtenerDetallesVenta(id_venta);
        res.status(200).json({ message: 'Detalles de la venta obtenidos correctamente', detalles });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los detalles de la venta', error });
        console.error('Error al obtener los detalles de la venta:', error);
    }
};
    


const obtenerRegistroVentaPorCliente = async (req, res) => {
    const { id_cliente } = req.params;
    try {
        const registro = await obtenerRegistroVentaPorCliente(id_cliente);
        res.status(200).json({ message: 'Registro de ventas por cliente obtenido correctamente', registro });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el registro de ventas por cliente', error });
        console.error('Error al obtener el registro de ventas por cliente:', error);
    }
};

const reporteVentas = async (req, res) => {
    try {
        const reporte = await generarReporteVentas();
        res.status(200).json({ message: 'Reporte de ventas generado correctamente', reporte });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el reporte de ventas', error });
        console.error('Error al generar el reporte de ventas:', error);
    }
};

const reporteVentasPorDia = async (req, res) => {
    const { fecha } = req.query;
    try {
        const reporte = await generarReporteVentasPorDia(fecha);
        res.status(200).json({ message: 'Reporte de ventas por día generado correctamente', reporte });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el reporte de ventas por día', error });
        console.error('Error al generar el reporte de ventas por día:', error);
    }
};

const reporteVentasPorSemana = async (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;
    try {
        const reporte = await generarReporteVentasPorSemana(fecha_inicio, fecha_fin);
        res.status(200).json({ message: 'Reporte de ventas por semana generado correctamente', reporte });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el reporte de ventas por semana', error });
        console.error('Error al generar el reporte de ventas por semana:', error);
    }
};

const reporteVentasPorMes = async (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;
    try {
        const reporte = await generarReporteVentasPorMes(fecha_inicio, fecha_fin);
        res.status(200).json({ message: 'Reporte de ventas por mes generado correctamente', reporte });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el reporte de ventas por mes', error });
        console.error('Error al generar el reporte de ventas por mes:', error);
    }
};

const reporteProductoMasVendido = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;
        const reporte = await productoMasVendido(fecha_inicio, fecha_fin);

        res.status(200).json({ message: 'Producto más vendido obtenido correctamente', reporte });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto más vendido', error });
        console.error('Error al obtener el producto más vendido:', error);
    }
};

export { descontarStock, eliminarLoteVacio, registrarVenta, registrarVentaCompletaController, registrarDetallesVenta, listaVentas, obtenerDetallesVentaController, obtenerVentaPorFecha, obtenerRegistroVentaPorCliente, reporteVentas, reporteVentasPorDia, reporteVentasPorSemana, reporteVentasPorMes, reporteProductoMasVendido };