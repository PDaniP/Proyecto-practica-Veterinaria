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
        `SELECT v.id, v.fecha_venta, v.total, c.nombre AS cliente_nombre, u.nombre AS usuario_nombre, metodo_pago
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

export { obtenerLotesVentas, actualizarStockLote, eliminarLoteVacio, añadirVenta, detallesVenta, filtrarProductoPorID, obtenerListaVentas, obtenerDetallesVenta, filtrarServiciosPorId, obtenerVentaPorFechaActual }