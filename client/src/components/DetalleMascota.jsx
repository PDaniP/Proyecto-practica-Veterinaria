const formatearFecha = (fecha) => {
  if (!fecha) return "-";

  const [fechaParte] = String(fecha).split("T");
  const [anio, mes, dia] = fechaParte.split("-");

  if (!anio || !mes || !dia) return "-";

  return `${dia}/${mes}/${anio}`;
};

export default function DetalleMascota({ mascota, dueño }) {
  if (!mascota) return null;

  return (
    <div className="mascota-detalle">
      <h2>Detalle de {mascota.nombre}</h2>
      <dl>
        <div><dt>ID</dt><dd>{mascota.id}</dd></div>
        <div><dt>Nombre</dt><dd>{mascota.nombre}</dd></div>
        <div><dt>Especie</dt><dd>{mascota.especie}</dd></div>
        <div><dt>Raza</dt><dd>{mascota.raza || "-"}</dd></div>
        <div><dt>Fecha de nacimiento</dt><dd>{formatearFecha(mascota.fecha_nacimiento)}</dd></div>
        <div><dt>Peso</dt><dd>{mascota.peso ? `${mascota.peso} kg` : "-"}</dd></div>
        <div><dt>Género</dt><dd>{mascota.genero || "-"}</dd></div>
        <div><dt>Dueño</dt><dd>{dueño}</dd></div>
        <div><dt>Número de chip</dt><dd>{mascota.numero_chip || "-"}</dd></div>
        <div><dt>Alergias</dt><dd>{mascota.alergias || "-"}</dd></div>
        <div><dt>Observaciones</dt><dd>{mascota.observaciones || "-"}</dd></div>
        <div><dt>Estado</dt><dd>{mascota.activo ? "Activo" : "Inactivo"}</dd></div>
        <div><dt>Fecha de registro</dt><dd>{formatearFecha(mascota.fecha_registro)}</dd></div>
      </dl>
    </div>
  );
}
