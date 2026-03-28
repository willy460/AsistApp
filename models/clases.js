// models/clases.js
// Modelo de datos para Clases.
// El profesor crea cada clase desde cero (HU1).
// No hay clases predeterminadas.

export function crearClase(nombre, horaInicio, horaFin) {
  return {
    id: 'clase_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    nombre: nombre.trim(),
    horaInicio,
    horaFin,
    fecha: new Date().toISOString().split('T')[0],
    creadaEn: new Date().toISOString(),
    estudianteIds: [], // lista de IDs inscritos en esta clase
  };
}

export function validarClase(nombre, horaInicio, horaFin) {
  if (!nombre || nombre.trim() === '') {
    return { valido: false, error: 'El nombre de la clase no puede estar vacio.' };
  }
  if (!horaInicio || !horaFin) {
    return { valido: false, error: 'Debes seleccionar hora de inicio y hora de fin.' };
  }
  if (horaInicio >= horaFin) {
    return { valido: false, error: 'La hora de inicio debe ser antes que la hora de fin.' };
  }
  return { valido: true, error: null };
}

// Agrega un estudiante a la lista de inscritos de una clase
export function inscribirEstudiante(clase, estudianteId) {
  if (clase.estudianteIds.includes(estudianteId)) return clase;
  return { ...clase, estudianteIds: [...clase.estudianteIds, estudianteId] };
}