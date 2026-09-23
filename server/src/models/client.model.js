import db from '../config/db.js';


const obtenerListaClientes = async () => {
    const {rows} = await db.query('SELECT * FROM clientes WHERE activo = TRUE AND id > 2');
    return rows;
}

const añadirClienteADB = async (cliente) => {
    // AGREGADO: se suman email, telefono_alternativo, localidad y ciudad (antes solo estaba direccion)
    const {nombre, apellido, dni, email, telefono, telefono_alternativo, direccion, localidad, ciudad} = cliente;
    const {rows} = await db.query(
        // AGREGADO: columnas email, telefono_alternativo, localidad, ciudad en el INSERT (y sus $4, $6, $8, $9)
        'INSERT INTO clientes (nombre, apellido, dni, email, telefono, telefono_alternativo, direccion, localidad, ciudad, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *',
        // AGREGADO: email y telefono_alternativo van con "|| null" porque son opcionales (pueden no venir del form)
        [nombre, apellido, dni, email || null, telefono, telefono_alternativo || null, direccion || null, localidad, ciudad]
    );
    return rows[0];
}

const editarClienteADB = async (id, cliente) => {
    // AGREGADO: se suman email, telefono_alternativo, localidad y ciudad (antes solo estaba direccion)
    const {nombre, apellido, dni, email, telefono, telefono_alternativo, direccion, localidad, ciudad} = cliente;
    const {rows} = await db.query(
        'UPDATE clientes SET (nombre,apellido,dni,email,telefono,telefono_alternativo,direccion,localidad,ciudad) = ($1,$2,$3,$4,$5,$6,$7,$8,$9) WHERE id = $10 RETURNING *',
        [nombre, apellido, dni, email || null, telefono, telefono_alternativo || null, direccion || null, localidad, ciudad, id]
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
