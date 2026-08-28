
import db from '../config/db.js';

const userModel = async () => {
    const { rows } = await db.query('SELECT * FROM usuarios');
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

const eliminarUsuarioADB = async (id) => {
    const {rows} = await db.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    return rows[0];
}

export default {
    userModel,
    añadirUsuarioADB,
    editarUsuarioADB,
    eliminarUsuarioADB
};