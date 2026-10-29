import db from '../config/db.js';

const añadirMascotaADB = async (mascota) => {
    const {id_cliente,nombre,id_especie,id_raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo} = mascota;
    const {rows} = await db.query('INSERT INTO mascotas (id_cliente,nombre,id_especie,id_raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *', [id_cliente,nombre,id_especie,id_raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo]);
    return rows[0];
}

const obtenerListaMascotas = async () => {
    const {rows} = await db.query('SELECT * FROM mascotas WHERE activo = TRUE');
    return rows;
}

const editarMascotaADB = async (id, mascota) => {
    const {id_cliente,nombre,id_especie,id_raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo} = mascota;
    const {rows} = await db.query('UPDATE mascotas SET id_cliente = $1, nombre = $2, id_especie = $3, id_raza = $4, fecha_nacimiento = $5, peso = $6, genero = $7, alergias = $8, observaciones = $9, numero_chip = $10, activo = $11 WHERE id = $12 RETURNING *', [id_cliente,nombre,id_especie,id_raza,fecha_nacimiento,peso,genero,alergias,observaciones,numero_chip,activo,id]);
    return rows[0];
}

const eliminarMascotaADB = async (id) => {
    const {rows} = await db.query('UPDATE mascotas SET activo = false WHERE id = $1 RETURNING *', [id]);
    return rows[0];
}

const obtenerDetalleConsulta = async (idMascota) => {
    const { rows } = await db.query(
        `SELECT
            c.id,
            c.fecha_consulta,
            c.peso_actual,
            c.temperatura,
            c.tratamiento,
            c.observaciones,
            c.motivo_id,
            m.motivo,
            d.diagnostico,
            u.nombre AS nombre_veterinario
         FROM consultas c
         LEFT JOIN motivos m ON m.id = c.motivo_id
         LEFT JOIN diagnosticos d ON d.id = m.id_diagnostico
         LEFT JOIN usuarios u ON u.id = c.id_veterinario
         WHERE c.id_mascota = $1
         ORDER BY c.fecha_consulta DESC`,
        [idMascota]
    );

    return rows;
};

const obtenerConsultaPorID = async (idConsulta) => {
    const { rows } = await db.query(
        `SELECT
            c.id,
            c.fecha_consulta,
            c.peso_actual,
            c.temperatura,
            c.tratamiento,
            c.observaciones,
            m.motivo,
            d.diagnostico,
            u.nombre AS nombre_veterinario,
            COALESCE(detalles.insumos, '[]'::json) AS insumos
         FROM consultas c
         LEFT JOIN motivos m ON m.id = c.motivo_id
         LEFT JOIN diagnosticos d ON d.id = m.id_diagnostico
         LEFT JOIN usuarios u ON u.id = c.id_veterinario
         LEFT JOIN LATERAL (
            SELECT json_agg(
                json_build_object(
                    'id', dc.id,
                    'nombre', p.nombre,
                    'marca', p.marca,
                    'codigo_lote', l.codigo_lote,
                    'proxima_dosis', dc.proxima_dosis,
                    'observaciones', dc.observaciones
                )
                ORDER BY dc.id
            ) AS insumos
            FROM detalle_consulta dc
            LEFT JOIN lotes l ON l.id = dc.id_lote
            LEFT JOIN productos p ON p.id = l.id_producto
            WHERE dc.id_consulta = c.id
         ) detalles ON true
         WHERE c.id = $1`,
        [idConsulta]
    );

    return rows[0];
};

const obtenerMotivos = async () => {
    const {rows} = await db.query('SELECT * FROM motivos');
    console.log(rows); 
    return rows;
}

const datosMascota = async (id) => {
    const {rows} = await db.query('SELECT * FROM mascotas WHERE id = $1', [id]);
    return rows[0];
}

const obtenerAntecedentes = async (id_mascota) => {
    const {rows} = await db.query('SELECT * FROM antecedentes WHERE id_mascota = $1', [id_mascota]);
    return rows;
}

const obtenerVacunasAplicadas = async (idMascota) => {
    const { rows } = await db.query(
        `SELECT
            dc.id,
            p.nombre AS nombre_vacuna,
            c.fecha_consulta AS fecha_aplicacion,
            dc.proxima_dosis
         FROM detalle_consulta dc
         JOIN consultas c ON c.id = dc.id_consulta
         JOIN lotes l ON l.id = dc.id_lote
         JOIN productos p ON p.id = l.id_producto
         JOIN categorias cat ON cat.id = p.id_categoria
         WHERE c.id_mascota = $1
           AND LOWER(cat.nombre) = LOWER('Vacunas')
         ORDER BY c.fecha_consulta DESC, dc.id DESC`,
        [idMascota]
    );

    return rows;
};

const añadirConsulta = async (consulta) => {
    const {id_mascota,id_veterinario,motivo_id,fecha_consulta,peso_actual,temperatura,tratamiento,observaciones} = consulta;
    const {rows} = await db.query('INSERT INTO consultas (id_mascota,id_veterinario,fecha_consulta,peso_actual,temperatura,motivo_id,tratamiento,observaciones) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [id_mascota,id_veterinario,fecha_consulta,peso_actual,temperatura,motivo_id,tratamiento,observaciones]);
    return rows[0];
}

const añadirDetalleConsulta = async (detalle) => {
    const {id_consulta,id_lote,proxima_dosis,observaciones} = detalle;
    const {rows} = await db.query('INSERT INTO detalle_consulta (id_consulta,id_lote,proxima_dosis,observaciones) VALUES ($1,$2,$3,$4) RETURNING *', [id_consulta,id_lote,proxima_dosis,observaciones]);
    return rows[0];
}


//agregue esto:
const obtenerDiagnosticosPorMotivo = async (motivoId) => {
    const { rows } = await db.query(
        `SELECT d.id, d.diagnostico
         FROM diagnosticos d
         WHERE d.id_motivo = $1
         ORDER BY d.diagnostico`,
        [motivoId]
    );

    return rows;
};

const editarConsulta = async (id, consulta) => {
    const {motivo_id,tratamiento,observaciones} = consulta;
    const {rows} = await db.query('UPDATE consultas SET motivo_id=$1, tratamiento=$2, observaciones=$3 WHERE id=$4 RETURNING *', [motivo_id, tratamiento, observaciones, id]);
    return rows[0];
};

export default {
    añadirMascotaADB,
    obtenerListaMascotas,
    editarMascotaADB,
    eliminarMascotaADB,
    obtenerDetalleConsulta,
    obtenerConsultaPorID,
    obtenerMotivos,
    datosMascota,
    obtenerAntecedentes,
    obtenerVacunasAplicadas,
    añadirConsulta,
    añadirDetalleConsulta,
    obtenerDiagnosticosPorMotivo,
    editarConsulta
};
