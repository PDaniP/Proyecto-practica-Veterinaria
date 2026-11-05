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
        // AGREGADO: se suma v.id_cliente al SELECT (antes no venía) para poder filtrar las ventas de cada cliente en el frontend (historial de compra)
        `SELECT v.id, v.id_cliente, v.fecha_venta, v.total, c.nombre AS cliente_nombre, u.nombre AS usuario_nombre, metodo_pago
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
    console.log(rows)
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

const productoMasVendido = async () => {
    const query = `
        SELECT
            p.nombre AS producto_nombre,
            v.fecha_venta,
            SUM(dv.cantidad) AS total_vendido
        FROM detalle_ventas AS dv
        JOIN productos p ON dv.id_producto = p.id
        JOIN ventas v ON dv.id_venta = v.id

        GROUP BY p.nombre, v.fecha_venta
        ORDER BY total_vendido DESC
        LIMIT 10
    `;
    const {rows} = await db.query(query);
    return rows;
}

export { obtenerLotesVentas, actualizarStockLote, eliminarLoteVacio, añadirVenta, detallesVenta, filtrarProductoPorID, obtenerListaVentas, obtenerDetallesVenta, filtrarServiciosPorId, obtenerVentaPorFechaActual, obtenerRegistroVentaPorCliente, generarReporteVentas, generarReporteVentasPorDia, generarReporteVentasPorSemana, generarReporteVentasPorMes, productoMasVendido }