// models/asistencia.js
// Modelo de registros de asistencia.
// Cada registro se crea cuando un estudiante marca asistencia exitosamente.

export function crearRegistroAsistencia(estudianteId, claseId, metodo = 'qr') {
  return {
    id: 'asist_' + Date.now(),
    estudianteId: estudianteId.toUpperCase(),
    claseId,
    timestamp: new Date().toISOString(),
    metodo, // 'qr' o 'manual'
  };
}

// Verifica si un estudiante ya registro asistencia en una clase (HU6)
export function yaRegistrado(estudianteId, claseId, registros) {
  return registros.some(
    (r) => r.estudianteId === estudianteId.toUpperCase() && r.claseId === claseId
  );
}

// Calcula porcentaje de asistencia de un estudiante (HU10)
export function calcularPorcentaje(estudianteId, registros, totalClases) {
  if (totalClases === 0) return 0;
  const asistencias = registros.filter(
    (r) => r.estudianteId === estudianteId.toUpperCase()
  ).length;
  return Math.round((asistencias / totalClases) * 100);
}

// Crea un log de intento fallido (HU12)
export function crearLog(estudianteId, claseId, motivo) {
  return {
    id: 'log_' + Date.now(),
    estudianteId: estudianteId || 'desconocido',
    claseId: claseId || 'desconocida',
    motivo,
    timestamp: new Date().toISOString(),
  };
}