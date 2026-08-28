import db from '../config/db.js';

const añadirMascotaADB = async (mascota) => {
    const {id_cliente,nombre,especie,raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo} = mascota;
    const {rows} = await db.query('INSERT INTO mascotas (id_cliente,nombre,especie,raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *', [id_cliente,nombre,especie,raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo]);
    return rows[0];
}

const obtenerListaMascotas = async () => {
    const {rows} = await db.query('SELECT * FROM mascotas');
    return rows;
}

const editarMascotaADB = async (id, mascota) => {
    const {id_cliente,nombre,especie,raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo} = mascota;
    const {rows} = await db.query('UPDATE mascotas SET id_cliente = $1, nombre = $2, especie = $3, raza = $4, fecha_nacimiento = $5, peso = $6, genero = $7, alergias = $8, observaciones = $9, numero_chip = $10, activo = $11 WHERE id = $12 RETURNING *', [id_cliente,nombre,especie,raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo,id]);
    return rows[0];
}

const eliminarMascotaADB = async (id) => {
    const {rows} = await db.query('UPDATE mascotas SET activo = false WHERE id = $1 RETURNING *', [id]);
    return rows[0];
}
export default {
    añadirMascotaADB,
    obtenerListaMascotas,
    editarMascotaADB,
    eliminarMascotaADB
};