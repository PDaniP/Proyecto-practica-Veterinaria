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

export { obtenerLotesVentas, actualizarStockLote, eliminarLoteVacio, añadirVenta, detallesVenta, filtrarProductoPorID }