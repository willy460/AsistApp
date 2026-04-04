// utils/time.js

export function estaEnHorario(horaInicio, horaFin) {
  const ahora = new Date();
  const hh = ahora.getHours().toString().padStart(2, '0');
  const mm = ahora.getMinutes().toString().padStart(2, '0');
  const horaActual = `${hh}:${mm}`;
  return horaActual >= horaInicio && horaActual <= horaFin;
}

export function horaActualTexto() {
  const ahora = new Date();
  const hh = ahora.getHours().toString().padStart(2, '0');
  const mm = ahora.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatearFechaHora(isoString) {
  const fecha = new Date(isoString);
  const d = fecha.toLocaleDateString('es-CO');
  const h = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${d} ${h}`;
}