CREATE TABLE IF NOT EXISTS estudios_adjuntos (
    id SERIAL PRIMARY KEY,
    id_consulta INTEGER NOT NULL
        REFERENCES consultas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    url_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(50),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
