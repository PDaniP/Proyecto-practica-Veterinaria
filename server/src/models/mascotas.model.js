import db from '../config/db.js';

const añadirMascotaADB = async (mascota) => {
    const {id_cliente,nombre,especie,raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo} = mascota;
    const {rows} = await db.query('INSERT INTO mascotas (id_cliente,nombre,especie,raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *', [id_cliente,nombre,especie,raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo]);
    return rows[0];
}

const obtenerListaMascotas = async () => {
    const {rows} = await db.query('SELECT * FROM mascotas WHERE activo = TRUE');
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

const obtenerVacunas = async (id_mascota) => {
    const {rows} = await db.query('SELECT nombre_vacuna,fecha_aplicacion,proxima_dosis,usuarios.nombre AS nombre_veterinario FROM vacunas LEFT JOIN usuarios ON vacunas.id_veterinario = usuarios.id WHERE id_mascota = $1', [id_mascota]);
    return rows;
}
const obtenerConsultas = async (id_mascota) => {
    const {rows} = await db.query('SELECT fecha_consulta, motivo, diagnostico, tratamiento, observaciones FROM consultas WHERE id_mascota = $1', [id_mascota]);
    return rows;
}

const obtenerAntecedentes = async (id_mascota) => {
    const {rows} = await db.query('SELECT tipo,descripcion,fecha_diagnostico FROM antecedentes WHERE id_mascota = $1', [id_mascota]);
    return rows;
}

const datosMascota = async (id_mascota) => {
    const {rows} = await db.query('SELECT * FROM mascotas WHERE id = $1', [id_mascota]);
    return rows[0];
}

const añadirAntecedente = async (antecedente) => {
    const {id_mascota,tipo,descripcion,fecha_diagnostico} = antecedente;
    const {rows} = await db.query('INSERT INTO antecedentes (id_mascota,tipo,descripcion,fecha_diagnostico) VALUES ($1,$2,$3,$4) RETURNING *', [id_mascota,tipo,descripcion,fecha_diagnostico]);
    return rows[0];
}

const añadirVacuna = async (vacuna) => {
    const {id_mascota,nombre_vacuna,fecha_aplicacion,proxima_dosis,id_veterinario} = vacuna;
    const {rows} = await db.query('INSERT INTO vacunas (id_mascota,nombre_vacuna,fecha_aplicacion,proxima_dosis,id_veterinario) VALUES ($1,$2,$3,$4,$5) RETURNING *', [id_mascota,nombre_vacuna,fecha_aplicacion,proxima_dosis,id_veterinario]);
    return rows[0];
}

const añadirConsulta = async (consulta) => {
    const {id_mascota,fecha_consulta,motivo,diagnostico,tratamiento,observaciones} = consulta;
    const {rows} = await db.query('INSERT INTO consultas (id_mascota,fecha_consulta,motivo,diagnostico,tratamiento,observaciones) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [id_mascota,fecha_consulta,motivo,diagnostico,tratamiento,observaciones]);
    return rows[0];
}

export default {
    añadirMascotaADB,
    obtenerListaMascotas,
    editarMascotaADB,
    eliminarMascotaADB,
    obtenerVacunas,
    obtenerConsultas,
    obtenerAntecedentes,
    datosMascota,
    añadirAntecedente,
    añadirVacuna,
    añadirConsulta
};