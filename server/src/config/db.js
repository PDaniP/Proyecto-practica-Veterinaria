import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// El código 1114 es "timestamp without time zone".
// Esto le dice a Postgres: "devolveme la fecha como un texto literal, no la conviertas a UTC"
pg.types.setTypeParser(1114, str => str);

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool(
    isProduction ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 5
    } : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        max: 5,
        ssl: false
    }
);

// Verificar conexión
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error de conexión:', err.message);
        return;
    }

    console.log(`✅ Conexión exitosa a ${process.env.DB_NAME}`);
    release();
});

export default {
    query: (text, params) => pool.query(text, params),
    pool:pool
};