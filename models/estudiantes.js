// models/estudiantes.js

export function buscarEstudiante(estudianteId, lista) {
  return lista.find(
    (e) => e.id.toLowerCase() === estudianteId.toLowerCase()
  ) || null;
}

export function validarIdentidad(estudianteId, celular, lista) {
  const estudiante = buscarEstudiante(estudianteId, lista);
  if (!estudiante) {
    return {
      valido: false,
      estudiante: null,
      error: `No se encontro ningun estudiante con ID "${estudianteId}".`,
    };
  }
  const celularIngresado = celular.replace(/\D/g, '');
  const celularRegistrado = estudiante.celular.replace(/\D/g, '');
  if (celularIngresado !== celularRegistrado) {
    return {
      valido: false,
      estudiante: null,
      error: 'Los datos no coinciden con el registro. Verifica tu ID y celular.',
    };
  }
  return { valido: true, estudiante, error: null };
}

export function perteneceAClase(estudiante, claseId) {
  return estudiante.claseIds.includes(claseId);
}

export const ESTUDIANTES_INICIALES = [
  { id: 'EST001', nombre: 'Ana Garcia',    celular: '3001234567', claseIds: ['clase_001', 'clase_002'] },
  { id: 'EST002', nombre: 'Carlos Lopez',  celular: '3109876543', claseIds: ['clase_001'] },
  { id: 'EST003', nombre: 'Maria Torres',  celular: '3154567890', claseIds: ['clase_001', 'clase_002'] },
  { id: 'EST004', nombre: 'Juan Perez',    celular: '3203216547', claseIds: ['clase_002'] },
  { id: 'EST005', nombre: 'Laura Sanchez', celular: '3007891234', claseIds: ['clase_001'] },
  { id: 'EST006', nombre: 'Diego Ramirez', celular: '3116543210', claseIds: ['clase_001', 'clase_002'] },
];