import db from '../config/db.js';


const obtenerListaClientes = async () => {
    const {rows} = await db.query('SELECT * FROM clientes');
    return rows;
}

const añadirClienteADB = async (cliente) => {
    const {nombre,apellido, dni, telefono, direccion} = cliente;
    const {rows} = await db.query('INSERT INTO clientes (nombre,apellido, dni, telefono, direccion, fecha_creacion) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *', [nombre, apellido, dni, telefono, direccion]);
    return rows[0];
}

const editarClienteADB = async (id, cliente) => {
    const {nombre,apellido, dni, telefono, direccion} = cliente;
    const {rows} = await db.query('UPDATE clientes SET nombre = $1, apellido = $2, dni = $3, telefono = $4, direccion = $5 WHERE id = $6 RETURNING *', [nombre, apellido, dni, telefono, direccion, id]);
    return rows[0];
}

const eliminarClienteADB = async (id) => {
    const {rows} = await db.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    return rows[0];
}

export default {
    obtenerListaClientes,
    añadirClienteADB,
    editarClienteADB,
    eliminarClienteADB
};
