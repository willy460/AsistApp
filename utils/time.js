// utils/time.js
// Utilidades de tiempo para validacion de horario (HU5).

// Verifica si la hora actual esta dentro del rango de la clase
export function estaEnHorario(horaInicio, horaFin) {
  const ahora = new Date();
  const hh = ahora.getHours().toString().padStart(2, '0');
  const mm = ahora.getMinutes().toString().padStart(2, '0');
  const horaActual = `${hh}:${mm}`;
  return horaActual >= horaInicio && horaActual <= horaFin;
}

// Retorna la hora actual en formato HH:MM
export function horaActualTexto() {
  const ahora = new Date();
  const hh = ahora.getHours().toString().padStart(2, '0');
  const mm = ahora.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

// Formatea un timestamp ISO a texto legible
export function formatearFechaHora(isoString) {
  const fecha = new Date(isoString);
  const d = fecha.toLocaleDateString('es-CO');
  const h = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${d} ${h}`;
}