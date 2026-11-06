ALTER TABLE detalle_ventas
    ADD COLUMN IF NOT EXISTS id_detalle_consulta INTEGER
    REFERENCES detalle_consulta(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_detalle_ventas_consulta
    ON detalle_ventas (id_detalle_consulta)
    WHERE id_detalle_consulta IS NOT NULL;
