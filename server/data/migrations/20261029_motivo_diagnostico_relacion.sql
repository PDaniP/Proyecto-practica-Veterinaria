ALTER TABLE diagnosticos
ADD COLUMN IF NOT EXISTS id_motivo INTEGER
REFERENCES motivos(id) ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE diagnosticos d
SET id_motivo = m.id
FROM motivos m
WHERE m.id_diagnostico = d.id
  AND d.id_motivo IS NULL;
