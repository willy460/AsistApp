// ============================================================
// utils/time.js — SEMANA 2
// ============================================================
// Implementa la validación de horario (HU5).
// En Semana 1 esta función siempre retornaba true.
// Ahora compara la hora actual contra la ventana de la clase.
// ============================================================

/**
 * estaEnHorario — Verifica si AHORA está dentro del horario de la clase.
 *
 * Ejemplo:
 *   clase.horaInicio = "08:00"
 *   clase.horaFin    = "10:00"
 *   hora actual      = "09:30" → true  ✅
 *   hora actual      = "10:30" → false ❌
 *
 * @param {string} horaInicio - formato "HH:MM"
 * @param {string} horaFin    - formato "HH:MM"
 * @returns {boolean}
 */
export function estaEnHorario(horaInicio, horaFin) {
  const ahora = new Date();

  // Construimos "HH:MM" de la hora actual
  const hh = ahora.getHours().toString().padStart(2, '0');
  const mm = ahora.getMinutes().toString().padStart(2, '0');
  const horaActual = `${hh}:${mm}`; // ej: "09:30"

  // Comparación de strings funciona correctamente para formato HH:MM
  // porque los strings se comparan lexicográficamente y el formato es fijo
  return horaActual >= horaInicio && horaActual <= horaFin;
}

/**
 * horaActualTexto — Retorna la hora actual como texto legible.
 * Útil para mostrar en logs y mensajes de error.
 * @returns {string} - ej: "09:30"
 */
export function horaActualTexto() {
  const ahora = new Date();
  const hh = ahora.getHours().toString().padStart(2, '0');
  const mm = ahora.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * formatearFechaHora — Formatea un timestamp ISO a texto legible.
 * @param {string} isoString
 * @returns {string} - ej: "14/07/2025 09:30"
 */
export function formatearFechaHora(isoString) {
  const fecha = new Date(isoString);
  const d = fecha.toLocaleDateString('es-CO');
  const h = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${d} ${h}`;
}