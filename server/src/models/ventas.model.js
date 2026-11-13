import db from '../config/db.js'

const obtenerLotesVentas = async (id_lote) => {
    const {rows} = await db.query(
        `SELECT * FROM lotes WHERE id = $1 ORDER BY fecha_vencimiento ASC`, [id_lote]
    )
    return rows
}

const actualizarStockLote = async (id_lote, cantidad) => {
    const {rows} = await db.query(
        `UPDATE lotes SET stock_actual = stock_actual - $1 WHERE id = $2 RETURNING *`, [cantidad, id_lote]
    )
    return rows[0]
}

const eliminarLoteVacio = async (id_lote) => {
    const {rows} = await db.query(
        `DELETE FROM lotes WHERE id = $1 AND stock_actual <= 0 RETURNING *`, [id_lote]
    )
    return rows[0]
}

const añadirVenta = async (id_usuario, id_cliente, metodoPago, fechaVenta, total) => {
    const {rows} = await db.query(
        `INSERT INTO ventas (id_usuario, id_cliente, metodo_pago, fecha_venta, total) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [id_usuario, id_cliente, metodoPago, fechaVenta, total]
    )
    return rows[0]
}   

const registrarVentaCompleta = async ({ id_usuario, id_cliente, metodoPago, items }) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        const lineasVenta = [];
        const detallesConsultaIncluidos = new Set();

        for (const item of items) {
            const idDetalleConsulta = item.id_detalle_consulta == null
                ? null
                : Number(item.id_detalle_consulta);

            if (idDetalleConsulta !== null) {
                if (!Number.isInteger(idDetalleConsulta) || idDetalleConsulta <= 0 ||
                    detallesConsultaIncluidos.has(idDetalleConsulta)) {
                    const error = new Error('Un insumo de consulta está repetido o no es válido.');
                    error.statusCode = 400;
                    throw error;
                }
                detallesConsultaIncluidos.add(idDetalleConsulta);

                const { rows } = await client.query(
                    `SELECT
                        dc.id,
                        dc.cantidad,
                        p.id AS id_producto,
                        p.precio_venta,
                        masc.id_cliente
                     FROM detalle_consulta dc
                     JOIN consultas c ON c.id = dc.id_consulta
                     JOIN mascotas masc ON masc.id = c.id_mascota
                     JOIN lotes l ON l.id = dc.id_lote
                     JOIN productos p ON p.id = l.id_producto
                     WHERE dc.id = $1
                     FOR UPDATE OF dc`,
                    [idDetalleConsulta]
                );

                const detalleConsulta = rows[0];
                if (!detalleConsulta || Number(detalleConsulta.id_cliente) !== Number(id_cliente)) {
                    const error = new Error('El insumo no pertenece a una consulta del cliente seleccionado.');
                    error.statusCode = 400;
                    throw error;
                }
                const { rows: ventasPrevias } = await client.query(
                    'SELECT id FROM detalle_ventas WHERE id_detalle_consulta = $1',
                    [idDetalleConsulta]
                );
                if (ventasPrevias.length > 0) {
                    const error = new Error('Este insumo de consulta ya fue incluido en una venta.');
                    error.statusCode = 400;
                    throw error;
                }

                const precioIngresado = Number(detalleConsulta.precio_venta);
                if (detalleConsulta.precio_venta == null ||
                    !Number.isFinite(precioIngresado) || precioIngresado <= 0) {
                    const error = new Error('Defina un precio de venta para cada producto de la consulta antes de facturarla.');
                    error.statusCode = 400;
                    throw error;
                }

                lineasVenta.push({
                    id_producto: detalleConsulta.id_producto,
                    id_detalle_consulta: idDetalleConsulta,
                    cantidad: Number(detalleConsulta.cantidad),
                    precio_unitario: Math.round(Number(precioIngresado) * 100) / 100
                });
                continue;
            }

            const idProducto = Number(item.id_producto);
            const cantidad = Number(item.cantidad);
            if (!Number.isInteger(idProducto) || idProducto <= 0 ||
                !Number.isInteger(cantidad) || cantidad <= 0) {
                const error = new Error('La lista de productos no es válida.');
                error.statusCode = 400;
                throw error;
            }

            const { rows: productos } = await client.query(
                `SELECT id, nombre, precio_venta, venta_al_publico
                 FROM productos
                 WHERE id = $1`,
                [idProducto]
            );
            const producto = productos[0];
            if (!producto || !producto.venta_al_publico || producto.precio_venta == null) {
                const error = new Error('El producto no tiene un precio válido o no está habilitado para la venta al público.');
                error.statusCode = 400;
                throw error;
            }

            let restante = cantidad;
            const { rows: lotes } = await client.query(
                `SELECT id, stock_actual
                 FROM lotes
                 WHERE id_producto = $1
                   AND activo = TRUE
                   AND stock_actual > 0
                   AND fecha_vencimiento >= CURRENT_DATE
                 ORDER BY fecha_vencimiento, fecha_ingreso, id
                 FOR UPDATE`,
                [idProducto]
            );

            for (const lote of lotes) {
                if (restante === 0) break;
                const cantidadLote = Math.min(restante, Number(lote.stock_actual));
                const actualizado = await client.query(
                    `UPDATE lotes
                     SET stock_actual = stock_actual - $1
                     WHERE id = $2 AND stock_actual >= $1`,
                    [cantidadLote, lote.id]
                );
                if (actualizado.rowCount !== 1) {
                    throw new Error('El stock del producto cambió durante el registro de la venta.');
                }
                restante -= cantidadLote;
            }

            if (restante > 0) {
                const error = new Error(`Stock insuficiente para el producto "${producto.nombre}".`);
                error.statusCode = 400;
                throw error;
            }

            lineasVenta.push({
                id_producto: idProducto,
                id_detalle_consulta: null,
                cantidad,
                precio_unitario: Math.round(Number(producto.precio_venta) * 100) / 100
            });
        }

        const total = lineasVenta.reduce(
            (suma, linea) => suma + linea.cantidad * linea.precio_unitario,
            0
        );
        const { rows: ventas } = await client.query(
            `INSERT INTO ventas (id_usuario, id_cliente, metodo_pago, fecha_venta, total)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
             RETURNING id`,
            [id_usuario, id_cliente, metodoPago, Math.round(total * 100) / 100]
        );
        const idVenta = ventas[0].id;

        for (const linea of lineasVenta) {
            await client.query(
                `INSERT INTO detalle_ventas
                    (id_venta, id_producto, cantidad, precio_unitario, subtotal, id_detalle_consulta)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    idVenta,
                    linea.id_producto,
                    linea.cantidad,
                    linea.precio_unitario,
                    Math.round(linea.cantidad * linea.precio_unitario * 100) / 100,
                    linea.id_detalle_consulta
                ]
            );
        }

        await client.query('COMMIT');
        return { id_venta: idVenta, total: Math.round(total * 100) / 100 };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const detallesVenta = async (id_venta, id_producto, id_servicio, cantidad, precio_unitario, subtotal) => {
    if(!id_servicio){
        const {rows} = await db.query(
            `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [id_venta, id_producto, cantidad, precio_unitario, subtotal]
        )
        return rows[0]
    }else if(!id_producto){
        const {rows} = await db.query(
            `INSERT INTO detalle_ventas (id_venta, id_servicio, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [id_venta, id_servicio, cantidad, precio_unitario, subtotal]
        )
        return rows[0]
    }
}

const filtrarProductoPorID = async (id_producto) => {
    const {rows} = await db.query(
        `SELECT * FROM productos WHERE id = $1`, [id_producto]
    )
    return rows[0]
}

const obtenerListaVentas = () => {
    return db.query(
        // Se incluyen los datos del cliente para mostrar su nombre completo en el detalle de ventas.
        `SELECT v.id, v.id_cliente, v.fecha_venta, v.total, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, u.nombre AS usuario_nombre, metodo_pago
        FROM ventas v
        JOIN clientes c ON v.id_cliente = c.id
        JOIN usuarios u ON v.id_usuario = u.id
        ORDER BY v.fecha_venta DESC`
    )
}

const obtenerVentaPorFechaActual = async () => {
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const {rows} = await db.query(
        `SELECT * FROM ventas WHERE fecha_venta = $1`, [fechaFormateada]
    )
    return rows[0]
}

const filtrarServiciosPorId = async (id_servicio) => {
    const {rows} = await db.query(
        `SELECT * FROM servicios WHERE id = $1`, [id_servicio]
    )
    return rows[0]
}

const obtenerDetallesVenta = async (id_venta) => {
    const {rows} = await db.query(
        `SELECT dv.id, dv.cantidad, dv.precio_unitario, dv.subtotal, p.nombre AS producto_nombre, s.nombre AS servicio_nombre, metodo_pago
        FROM detalle_ventas dv
        LEFT JOIN productos p ON dv.id_producto = p.id
        LEFT JOIN servicios s ON dv.id_servicio = s.id
        LEFT JOIN ventas v ON dv.id_venta = v.id
        WHERE dv.id_venta = $1`, [id_venta]
    )
    
    return rows
}
const obtenerRegistroVentaPorCliente = async (id_cliente) => {
    const {rows} = await db.query(
        `SELECT v.id, v.id_cliente, v.fecha_venta, v.total, c.nombre AS cliente_nombre, u.nombre AS usuario_nombre, metodo_pago
        FROM ventas v
        JOIN clientes c ON v.id_cliente = c.id
        JOIN usuarios u ON v.id_usuario = u.id
        WHERE v.id_cliente = $1
        ORDER BY v.fecha_venta DESC`, [id_cliente]
    )
    return rows
}

const generarReporteVentas = async () => {
    const {rows} = await db.query(
        `SELECT v.id, v.id_cliente, v.fecha_venta, v.total, c.nombre AS cliente_nombre, u.nombre AS usuario_nombre, metodo_pago
        FROM ventas v
        JOIN clientes c ON v.id_cliente = c.id
        JOIN usuarios u ON v.id_usuario = u.id
        ORDER BY v.fecha_venta DESC`
    )
    return rows
}

const generarReporteVentasPorDia = async (fecha) => {
    const {rows} = await db.query(
        `SELECT
            DATE_TRUNC('HOUR', v.fecha_venta) AS fecha,
            COUNT(*) AS total_ventas,
            SUM(CASE WHEN v.metodo_pago = 'efectivo' THEN v.total ELSE 0 END) AS efectivo,
            SUM(CASE WHEN v.metodo_pago = 'tarjeta' THEN v.total ELSE 0 END) AS tarjeta,
            SUM(CASE WHEN v.metodo_pago = 'transferencia' THEN v.total ELSE 0 END) AS transferencia,
            SUM(CASE WHEN v.metodo_pago = 'efectivo' THEN 1 ELSE 0 END) AS total_efectivo,
            SUM(CASE WHEN v.metodo_pago = 'tarjeta' THEN 1 ELSE 0 END) AS total_tarjeta,
            SUM(CASE WHEN v.metodo_pago = 'transferencia' THEN 1 ELSE 0 END) AS total_transferencia
        FROM ventas v
        WHERE DATE(v.fecha_venta) = $1
        GROUP BY fecha
        ORDER BY fecha ASC
    `, [fecha]
    )
    return rows
}

const generarReporteVentasPorSemana = async (fecha_inicio, fecha_fin) => {
    const {rows} = await db.query(
        `SELECT
            DATE_TRUNC('DAY', v.fecha_venta) AS fecha,
            COUNT(*) AS total_ventas,
            SUM(CASE WHEN v.metodo_pago = 'efectivo' THEN v.total ELSE 0 END) AS efectivo,
            SUM(CASE WHEN v.metodo_pago = 'tarjeta' THEN v.total ELSE 0 END) AS tarjeta,
            SUM(CASE WHEN v.metodo_pago = 'transferencia' THEN v.total ELSE 0 END) AS transferencia,
            SUM(CASE WHEN v.metodo_pago = 'efectivo' THEN 1 ELSE 0 END) AS total_efectivo,
            SUM(CASE WHEN v.metodo_pago = 'tarjeta' THEN 1 ELSE 0 END) AS total_tarjeta,
            SUM(CASE WHEN v.metodo_pago = 'transferencia' THEN 1 ELSE 0 END) AS total_transferencia
        FROM ventas v
        WHERE DATE(v.fecha_venta) BETWEEN $1 AND $2
        GROUP BY fecha
        ORDER BY fecha ASC
    `, [fecha_inicio, fecha_fin]
    )
    return rows
}

const generarReporteVentasPorMes = async (fecha_inicio, fecha_fin) => {
    const {rows} = await db.query(
        `SELECT
            DATE_TRUNC('WEEK', v.fecha_venta) AS fecha,
            COUNT(*) AS total_ventas,
            SUM(CASE WHEN v.metodo_pago = 'efectivo' THEN v.total ELSE 0 END) AS efectivo,
            SUM(CASE WHEN v.metodo_pago = 'tarjeta' THEN v.total ELSE 0 END) AS tarjeta,
            SUM(CASE WHEN v.metodo_pago = 'transferencia' THEN v.total ELSE 0 END) AS transferencia,
            SUM(CASE WHEN v.metodo_pago = 'efectivo' THEN 1 ELSE 0 END) AS total_efectivo,
            SUM(CASE WHEN v.metodo_pago = 'tarjeta' THEN 1 ELSE 0 END) AS total_tarjeta,
            SUM(CASE WHEN v.metodo_pago = 'transferencia' THEN 1 ELSE 0 END) AS total_transferencia
        FROM ventas v
        WHERE DATE(v.fecha_venta) BETWEEN $1 AND $2
        GROUP BY fecha
        ORDER BY fecha ASC
    `, [fecha_inicio, fecha_fin]
    )
    return rows
}

const productoMasVendido = async (fecha_inicio, fecha_fin) => {
    const query = `
        SELECT
            p.id AS producto_id,
            p.nombre AS producto_nombre,
            SUM(dv.cantidad) AS total_vendido
        FROM detalle_ventas AS dv
        JOIN productos p ON dv.id_producto = p.id
        JOIN ventas v ON dv.id_venta = v.id
        WHERE v.fecha_venta >= $1::date
        AND v.fecha_venta <= $2::date
        GROUP BY p.id, p.nombre
        ORDER BY total_vendido DESC
        
        LIMIT 10
    `;
    const {rows} = await db.query(query, [fecha_inicio, fecha_fin]);
    return rows;
}

export { obtenerLotesVentas, actualizarStockLote, eliminarLoteVacio, añadirVenta, registrarVentaCompleta, detallesVenta, filtrarProductoPorID, obtenerListaVentas, obtenerDetallesVenta, filtrarServiciosPorId, obtenerVentaPorFechaActual, obtenerRegistroVentaPorCliente, generarReporteVentas, generarReporteVentasPorDia, generarReporteVentasPorSemana, generarReporteVentasPorMes, productoMasVendido }