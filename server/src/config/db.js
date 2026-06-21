import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuración del Pool de conexiones
const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Validar la conexión al iniciar
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error de conexión a PostgreSQL:', err.stack);
    }
    console.log(`✨ Conexión exitosa a la base de datos: ${process.env.DB_NAME}`);
    release();
});

// Exportamos el método query (usando la sintaxis moderna de ESM)
export default {
    query: (text, params) => pool.query(text, params),
};