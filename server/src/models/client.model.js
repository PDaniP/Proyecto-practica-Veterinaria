import db from '../config/db.js';


const obtenerListaClientes = async () => {
    const {rows} = await db.query('SELECT * FROM clientes WHERE activo = TRUE AND id > 2');
    return rows;
}

const añadirClienteADB = async (cliente) => {
    // Sumamos recibe_notificaciones a la desestructuración
    const {nombre, apellido, dni, email, telefono, telefono_alternativo, direccion, localidad, ciudad, recibe_notificaciones} = cliente;
    const {rows} = await db.query(
        // Agregamos recibe_notificaciones y su respectivo $10
        'INSERT INTO clientes (nombre, apellido, dni, email, telefono, telefono_alternativo, direccion, localidad, ciudad, recibe_notificaciones, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *',
        // Pasamos el valor con un fallback a false por las dudas
        [nombre, apellido, dni, email || null, telefono, telefono_alternativo || null, direccion || null, localidad, ciudad, recibe_notificaciones || false]
    );
    return rows[0];
}

const editarClienteADB = async (id, cliente) => {
    // Sumamos recibe_notificaciones a la desestructuración
    const {nombre, apellido, dni, email, telefono, telefono_alternativo, direccion, localidad, ciudad, recibe_notificaciones} = cliente;
    const {rows} = await db.query(
        // Agregamos recibe_notificaciones, el $10, y corremos el id al $11
        'UPDATE clientes SET (nombre,apellido,dni,email,telefono,telefono_alternativo,direccion,localidad,ciudad,recibe_notificaciones) = ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) WHERE id = $11 RETURNING *',
        // Ubicamos recibe_notificaciones antes del id
        [nombre, apellido, dni, email || null, telefono, telefono_alternativo || null, direccion || null, localidad, ciudad, recibe_notificaciones || false, id]
    );
    return rows[0];
}

const objeterRegistroVentaPorCliente = async (id_cliente) => {
    const {rows} = await db.query('SELECT * FROM ventas WHERE id_cliente = $1', [id_cliente]);
    return rows;
}

const eliminarClienteADB = async (id) => {
    const {rows} = await db.query('UPDATE clientes SET activo = FALSE WHERE id = $1 RETURNING *', [id]);
    return rows[0];
}



export default {
    obtenerListaClientes,
    añadirClienteADB,
    editarClienteADB,
    eliminarClienteADB,
    objeterRegistroVentaPorCliente
  
};
