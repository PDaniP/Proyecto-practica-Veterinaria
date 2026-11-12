export const normalizarTexto = (texto = "") =>
  String(texto)
    .toLowerCase()
    .replace(/ñ/g, "\uE000")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\uE000/g, "ñ")
    .trim();
