CREATE TABLE IF NOT EXISTS horario_atencion (
    id SMALLINT PRIMARY KEY CHECK (id = 1),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    dia_inicio SMALLINT NOT NULL CHECK (dia_inicio BETWEEN 1 AND 7),
    dia_fin SMALLINT NOT NULL CHECK (dia_fin BETWEEN 1 AND 7),
    CHECK (hora_inicio < hora_fin)
);

INSERT INTO horario_atencion (id, hora_inicio, hora_fin, dia_inicio, dia_fin)
VALUES (1, '09:00', '17:00', 1, 6)
ON CONFLICT (id) DO NOTHING;
