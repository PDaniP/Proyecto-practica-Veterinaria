import db from '../config/db.js'

const obtenerProductos = async () => {
    const {rows} = await db.query('SELECT * FROM productos ORDER BY id ASC')
    return rows
}

const obtenerProductoPorId = async (id) => {
    const {rows} = await db.query(`SELECT * FROM productos WHERE id = ${id}`)
    return rows
}

const añadirProductoADB = async (categoria,nombre,marca,descripcion,codigo_barra,costo,venta,stockMinimo,ventaAlPublico) => {
    const query = `
        INSERT INTO productos (
            id_categoria,
            nombre,
            marca,
            descripcion,
            codigo_barras,
            precio_costo,
            precio_venta,
            stock_minimo,
            venta_al_publico
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)
        RETURNING *
    `;

    const result = await db.query(query, [
        categoria,
        nombre,
        marca,
        descripcion,
        codigo_barra,
        costo,
        venta,
        stockMinimo,
        ventaAlPublico,
    ]);

    return result.rows[0];

}

const eliminarProductoEnDB = async (id) => {
        const result = await db.query(
        'DELETE FROM productos WHERE id = $1 RETURNING *',
        [id]
    );

}

const editarProductoEnDB = async (precio_costo,precio_venta,stock_actual,fecha_de_vencimiento) =>{

}

export default {obtenerProductoPorId, obtenerProductos, añadirProductoADB, eliminarProductoEnDB}

