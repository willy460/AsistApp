// ============================================================
// models/asistencia.js — Modelo de datos para Asistencia
// ============================================================
// Define la estructura de un registro de asistencia.
// Cada vez que un estudiante marca asistencia (exitosa),
// se crea un objeto de este tipo y se guarda en memoria.
// ============================================================

// ------------------------------------------------------------
// ESTRUCTURA DE UN REGISTRO DE ASISTENCIA
//
// {
//   id: 'asist_1720000000000',  → ID único del registro
//   estudianteId: 'EST001',     → quién asistió
//   claseId: 'clase_001',       → a qué clase
//   timestamp: '2025-07-14T...',→ cuándo se registró (ISO 8601)
//   metodo: 'qr' | 'manual',    → cómo se registró
// }
// ------------------------------------------------------------

/**
 * crearRegistroAsistencia - Crea un nuevo registro de asistencia.
 * @param {string} estudianteId
 * @param {string} claseId
 * @param {string} metodo - 'qr' o 'manual'
 * @returns {Object} - Registro de asistencia listo para guardar
 */
export function crearRegistroAsistencia(estudianteId, claseId, metodo = 'qr') {
  return {
    id: 'asist_' + Date.now(),
    estudianteId,
    claseId,
    timestamp: new Date().toISOString(),
    metodo, // saber si fue por QR o registro manual del profesor
  };
}

/**
 * yaRegistrado - Verifica si un estudiante ya tiene asistencia en una clase.
 * Esto previene registros duplicados (HU6).
 * @param {string} estudianteId
 * @param {string} claseId
 * @param {Array}  registros - Lista actual de asistencias en memoria
 * @returns {boolean} - true si ya existe un registro para ese par estudiante+clase
 */
export function yaRegistrado(estudianteId, claseId, registros) {
  return registros.some(
    (r) => r.estudianteId === estudianteId && r.claseId === claseId
  );
}

/**
 * calcularPorcentaje - Calcula el % de asistencia de un estudiante.
 * @param {string} estudianteId
 * @param {Array}  registros   - Todos los registros de asistencia
 * @param {number} totalClases - Total de clases que debería haber asistido
 * @returns {number} - Porcentaje entre 0 y 100
 */
export function calcularPorcentaje(estudianteId, registros, totalClases) {
  if (totalClases === 0) return 0;

  // Contamos cuántas veces aparece este estudiante en los registros
  const asistencias = registros.filter(
    (r) => r.estudianteId === estudianteId
  ).length;

  return Math.round((asistencias / totalClases) * 100);
}