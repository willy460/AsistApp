// models/asistencia.js

export function crearRegistroAsistencia(estudianteId, claseId, metodo = 'qr') {
  return {
    id: 'asist_' + Date.now(),
    estudianteId: estudianteId.toUpperCase(),
    claseId,
    timestamp: new Date().toISOString(),
    metodo,
  };
}

export function yaRegistrado(estudianteId, claseId, registros) {
  return registros.some(
    (r) => r.estudianteId === estudianteId.toUpperCase() && r.claseId === claseId
  );
}

export function calcularPorcentaje(estudianteId, registros, claseId, totalSesiones) {
  if (totalSesiones === 0) return 0;
  const asistencias = registros.filter(
    (r) => r.estudianteId === estudianteId.toUpperCase() && r.claseId === claseId
  ).length;
  return Math.round((asistencias / totalSesiones) * 100);
}

export function crearLog(estudianteId, claseId, motivo) {
  return {
    id: 'log_' + Date.now(),
    estudianteId: estudianteId || 'desconocido',
    claseId: claseId || 'desconocida',
    motivo,
    timestamp: new Date().toISOString(),
  };
}