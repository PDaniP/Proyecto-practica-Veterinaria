import db from '../config/db.js'

const obtenerProductos = async () => {
    const {rows} = await db.query('SELECT * FROM productos ORDER BY id ASC')
    return rows
}

const obtenerCategorias = async () => {
    const {rows} = await db.query(
        `
        SELECT * FROM categorias ORDER BY id ASC
        `
    )
    return rows
}

const obtenerLotes = async () => {
    const {rows} = await db.query(
        `SELECT * FROM lotes ORDER BY id ASC`
    )
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

const añadirCategoriaADB = async (nombre,descripcion) => {
    const query = `
    INSERT INTO categorias (
    nombre,
    descripcion)
    VALUES (
    $1,$2)
    RETURNING *
    `;
    const result = await db.query(query,[
        nombre,
        descripcion
    ])

    return result.rows[0]
}

const añadirLoteADB = async (producto, codigo, stock_inicial, stock_actual,fecha_vencimiento,activo) => {
    const query = `
    INSERT INTO lotes (
    id_producto,
    codigo_lote,
    stock_inicial,
    stock_actual,
    fecha_vencimiento,
    activo
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
    `;
    const result = await db.query(query,[
        producto,
        codigo,
        stock_inicial,
        stock_actual,
        fecha_vencimiento,
        activo
    ])
    
    return result.rows[0]

}


const eliminarProductoEnDB = async (id) => {
        const result = await db.query(
        'DELETE FROM productos WHERE id = $1 RETURNING *',
        [id]
    );

}

const obtenerLoteConProducto = async () => {
    const query = `
    SELECT * FROM lotes
    JOIN productos ON lotes.id_producto = productos.id
    ORDER BY lotes.id ASC
    `;
    const {rows} = await db.query(query);
    return rows;
}

const editarProductoEnDB = async (precio_costo, precio_venta,stock_minimo, id,) =>{
    const query = `
    UPDATE productos
    SET
    precio_costo = $1,
    precio_venta = $2,
    stock_minimo = $3
    WHERE id = $4
    RETURNING *
    `;
    const result = await db.query(query,[
        precio_costo,
        precio_venta,
        stock_minimo,
        id
    ])

    return result.rows[0]
}
const productosConStockSumado = async () => {
    const query = `
    Select * from productos
    LEFT JOIN (
        SELECT id_producto, SUM(stock_actual) as stock_actual
        FROM lotes
        GROUP BY id_producto
    ) as lotes_sumados ON productos.id = lotes_sumados.id_producto`

    const {rows} = await db.query(query)
    return rows
}

const obtenerLotePorIdDeProducto = async (id_producto) => {
    const query = `
    SELECT * FROM lotes
    WHERE id_producto = $1
    ORDER BY fecha_vencimiento ASC
    `;
    const {rows} = await db.query(query, [id_producto]);
    return rows;
}

export default {obtenerProductoPorId,
    obtenerCategorias,
    obtenerProductos, 
    obtenerLotes, 
    añadirProductoADB, 
    eliminarProductoEnDB, 
    añadirLoteADB, 
    añadirCategoriaADB, 
    editarProductoEnDB, 
    obtenerLoteConProducto,
    productosConStockSumado,
    obtenerLotePorIdDeProducto}

