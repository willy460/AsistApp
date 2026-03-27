// ============================================================
// models/clases.js — Modelo de datos para Clases
// ============================================================
// Define la estructura de una Clase y los datos de ejemplo
// (mock data) que usamos en el MVP mientras no hay backend.
// En semanas siguientes, aquí se aplicará el Repository Pattern.
// ============================================================

// ------------------------------------------------------------
// ESTRUCTURA DE UNA CLASE
// Así luce un objeto Clase en memoria:
//
// {
//   id: 'clase_001',          → identificador único
//   nombre: 'Móviles - Lunes', → nombre descriptivo
//   horaInicio: '08:00',       → hora de inicio (HH:MM)
//   horaFin: '10:00',          → hora de fin (HH:MM)
//   fecha: '2025-07-14',       → fecha de la clase (YYYY-MM-DD)
// }
// ------------------------------------------------------------

/**
 * crearClase - Crea un nuevo objeto Clase con los datos dados.
 * @param {string} nombre    - Nombre de la clase
 * @param {string} horaInicio - Ej: "08:00"
 * @param {string} horaFin    - Ej: "10:00"
 * @returns {Object} - Objeto Clase listo para guardar en memoria
 */
export function crearClase(nombre, horaInicio, horaFin) {
  return {
    // Generamos un ID único combinando timestamp + número aleatorio
    id: 'clase_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    nombre: nombre.trim(),
    horaInicio,
    horaFin,
    // Guardamos la fecha actual en formato YYYY-MM-DD
    fecha: new Date().toISOString().split('T')[0],
    creadaEn: new Date().toISOString(), // timestamp completo para logs
  };
}

/**
 * validarClase - Verifica que los datos de una clase sean correctos.
 * @param {string} nombre
 * @param {string} horaInicio
 * @param {string} horaFin
 * @returns {{ valido: boolean, error: string|null }}
 */
const validarClase = function(nombre, horaInicio, horaFin) {
  // Regla 1: el nombre no puede estar vacío
  if (!nombre || nombre.trim() === '') {
    return { valido: false, error: 'El nombre de la clase no puede estar vacío.' };
  }

  // Regla 2: deben existir ambas horas
  if (!horaInicio || !horaFin) {
    return { valido: false, error: 'Debes ingresar hora de inicio y hora de fin.' };
  }

  // Regla 3: la hora de inicio debe ser menor que la hora de fin
  // Comparamos como strings HH:MM (funciona si el formato es consistente)
  if (horaInicio >= horaFin) {
    return { valido: false, error: 'La hora de inicio debe ser antes que la hora de fin.' };
  }

  return { valido: true, error: null };
};

export { validarClase };

// ------------------------------------------------------------
// DATOS DE EJEMPLO (Mock Data)
// Estas clases ya existen al iniciar la app para poder probar
// sin tener que crear todo desde cero cada vez.
// En el MVP real, inicializarás el estado con este array.
// ------------------------------------------------------------
export const CLASES_INICIALES = [
  {
    id: 'clase_001',
    nombre: 'App Móviles - Grupo A',
    horaInicio: '08:00',
    horaFin: '10:00',
    fecha: new Date().toISOString().split('T')[0], // fecha de hoy
    creadaEn: new Date().toISOString(),
  },
  {
    id: 'clase_002',
    nombre: 'App Móviles - Grupo B',
    horaInicio: '14:00',
    horaFin: '16:00',
    fecha: new Date().toISOString().split('T')[0],
    creadaEn: new Date().toISOString(),
  },
];