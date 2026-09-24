
import db from '../config/db.js';

const userModel = async () => {
    const { rows } = await db.query('SELECT * FROM usuarios');
    return rows;
}

const obtenerUsuarioPorId = async (id) => {
    const { rows } = await db.query(`
        SELECT u.id, u.nombre, u.usuario, u.email, u.id_rol, u.activo,
               u.fecha_creacion, r.nombre AS rol
        FROM usuarios u
        INNER JOIN roles r ON r.id = u.id_rol
        WHERE u.id = $1
    `, [id]);
    return rows[0];
}

const obtenerUsuarios = async () => {
    const { rows } = await db.query(`
        SELECT u.id, u.nombre, u.usuario, u.email, u.activo,
               r.nombre AS rol
        FROM usuarios u
        INNER JOIN roles r ON r.id = u.id_rol
        ORDER BY u.nombre ASC
    `);
    return rows;
}

const añadirUsuarioADB = async (user) => {
    const {nombre, usuario,email,password_hash, id_rol,activo} = user;
    const {rows} = await db.query('INSERT INTO usuarios (nombre, usuario,email,password_hash, id_rol,activo, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *', [nombre, usuario,email,password_hash, id_rol,activo]);
    return rows[0];
}

const editarUsuarioADB = async (id, user) => {
    const {nombre, usuario,email,password_hash, id_rol,activo} = user;
    const {rows} = await db.query('UPDATE usuarios SET nombre = $1, usuario = $2,email = $3,password_hash = $4, id_rol = $5,activo = $6 WHERE id = $7 RETURNING *', [nombre, usuario,email,password_hash, id_rol,activo, id]);
    return rows[0];
}

const editarDatosUsuarioADB = async (id, user) => {
    const { usuario, email, password_hash } = user;
    const { rows } = await db.query(`
        UPDATE usuarios
        SET usuario = $1,
            email = $2,
            password_hash = COALESCE($3, password_hash)
        WHERE id = $4
        RETURNING id, nombre, usuario, email, id_rol, activo, fecha_creacion
    `, [usuario, email, password_hash, id]);
    return rows[0];
}

const eliminarUsuarioADB = async (id) => {
    const {rows} = await db.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    return rows[0];
}

const obtenerRoles = async () => {
    const { rows } = await db.query('SELECT id, nombre FROM roles ORDER BY id');
    return rows;
}

export default {
    userModel,
    obtenerUsuarioPorId,
    obtenerUsuarios,
    obtenerRoles,
    añadirUsuarioADB,
    editarUsuarioADB,
    editarDatosUsuarioADB,
    eliminarUsuarioADB
};