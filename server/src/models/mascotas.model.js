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
                    'id_producto', p.id,
                    'id_categoria', p.id_categoria,
                    'nombre', p.nombre,
                    'marca', p.marca,
                    'cantidad', dc.cantidad,
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

const guardarInsumosConsulta = async (client, idConsulta, insumos) => {
    const insumosPorProducto = new Map();
    for (const insumo of insumos) {
        const idProducto = Number(insumo.id_producto);
        const cantidad = Number(insumo.cantidad);
        if (!Number.isInteger(idProducto) || idProducto <= 0 ||
            !Number.isInteger(cantidad) || cantidad <= 0) {
            const error = new Error('La lista de insumos no es válida');
            error.statusCode = 400;
            throw error;
        }

        insumosPorProducto.set(
            idProducto,
            (insumosPorProducto.get(idProducto) || 0) + cantidad
        );
    }

    for (const [idProducto, cantidadSolicitada] of [...insumosPorProducto].sort(
        ([idA], [idB]) => idA - idB
    )) {
        const { rows: lotes } = await client.query(
            `SELECT id, stock_actual
             FROM lotes
             WHERE id_producto = $1
               AND activo = TRUE
               AND stock_actual > 0
               AND fecha_vencimiento >= CURRENT_DATE
             ORDER BY fecha_vencimiento, fecha_ingreso, id
             FOR UPDATE`,
            [idProducto]
        );

        let restante = cantidadSolicitada;
        const proximaDosis = insumos.find(
            (insumo) => Number(insumo.id_producto) === idProducto
        )?.proxima_dosis || null;

        for (const lote of lotes) {
            if (restante === 0) break;

            const cantidadLote = Math.min(restante, Number(lote.stock_actual));
            const actualizado = await client.query(
                `UPDATE lotes
                 SET stock_actual = stock_actual - $1
                 WHERE id = $2 AND stock_actual >= $1`,
                [cantidadLote, lote.id]
            );
            if (actualizado.rowCount !== 1) {
                throw new Error('El stock del insumo cambió durante el guardado.');
            }

            await client.query(
                `INSERT INTO detalle_consulta
                    (id_consulta, id_lote, cantidad, proxima_dosis)
                 VALUES ($1, $2, $3, $4)`,
                [idConsulta, lote.id, cantidadLote, proximaDosis]
            );
            restante -= cantidadLote;
        }

        if (restante > 0) {
            const error = new Error(
                `Stock insuficiente para el producto ${idProducto}.`
            );
            error.statusCode = 400;
            throw error;
        }
    }
};

const añadirConsulta = async (consulta, insumos = []) => {
    const {id_mascota,id_veterinario,motivo_id,fecha_consulta,peso_actual,temperatura,tratamiento,observaciones} = consulta;
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        const {rows} = await client.query(
            'INSERT INTO consultas (id_mascota,id_veterinario,fecha_consulta,peso_actual,temperatura,motivo_id,tratamiento,observaciones) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
            [id_mascota,id_veterinario,fecha_consulta,peso_actual,temperatura,motivo_id,tratamiento,observaciones]
        );
        await guardarInsumosConsulta(client, rows[0].id, insumos);
        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
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
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        const { rows: existentes } = await client.query(
            'SELECT id FROM consultas WHERE id = $1 FOR UPDATE',
            [id]
        );
        if (!existentes.length) {
            await client.query('ROLLBACK');
            return null;
        }

        if (Array.isArray(consulta.insumos)) {
            const { rows: insumosAnteriores } = await client.query(
                `SELECT id_lote, cantidad
                 FROM detalle_consulta
                 WHERE id_consulta = $1
                 FOR UPDATE`,
                [id]
            );
            for (const insumo of insumosAnteriores) {
                if (insumo.id_lote == null) continue;
                await client.query(
                    'UPDATE lotes SET stock_actual = stock_actual + $1 WHERE id = $2',
                    [insumo.cantidad, insumo.id_lote]
                );
            }
            await client.query(
                'DELETE FROM detalle_consulta WHERE id_consulta = $1',
                [id]
            );
        }

        const {
            motivo_id,
            peso_actual,
            temperatura,
            tratamiento,
            observaciones
        } = consulta;
        const {rows} = await client.query(
            'UPDATE consultas SET motivo_id=$1, peso_actual=CASE WHEN $2 THEN $3 ELSE peso_actual END, temperatura=CASE WHEN $4 THEN $5 ELSE temperatura END, tratamiento=$6, observaciones=$7 WHERE id=$8 RETURNING *',
            [
                motivo_id,
                peso_actual !== undefined,
                peso_actual ?? null,
                temperatura !== undefined,
                temperatura ?? null,
                tratamiento,
                observaciones,
                id
            ]
        );

        if (Array.isArray(consulta.insumos)) {
            await guardarInsumosConsulta(client, id, consulta.insumos);
        }

        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
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
