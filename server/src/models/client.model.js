import db from '../config/db.js';


const obtenerListaClientes = async () => {
    const {rows} = await db.query('SELECT * FROM clientes');
    return rows;
}

export default obtenerListaClientes;