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

export { obtenerLotesVentas, actualizarStockLote, eliminarLoteVacio }