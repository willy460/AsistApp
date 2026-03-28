// models/estudiantes.js
// Modelo de datos para Estudiantes.
// El profesor registra cada estudiante con ID, nombre y celular.
// No hay estudiantes predeterminados.

export function crearEstudiante(id, nombre, celular) {
  return {
    id: id.trim().toUpperCase(),
    nombre: nombre.trim(),
    celular: celular.trim(),
  };
}

export function validarEstudiante(id, nombre, celular) {
  if (!id || id.trim() === '') {
    return { valido: false, error: 'El ID del estudiante no puede estar vacio.' };
  }
  if (!nombre || nombre.trim() === '') {
    return { valido: false, error: 'El nombre no puede estar vacio.' };
  }
  if (!celular || celular.trim().length < 10) {
    return { valido: false, error: 'El celular debe tener al menos 10 digitos.' };
  }
  return { valido: true, error: null };
}

// Busca un estudiante por ID (sin distinguir mayusculas)
export function buscarEstudiante(estudianteId, lista) {
  return lista.find(
    (e) => e.id.toLowerCase() === estudianteId.toLowerCase()
  ) || null;
}

// Valida que ID + celular coincidan (HU7 - anti suplantacion)
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

// Verifica si el estudiante esta inscrito en la clase (HU4)
export function perteneceAClase(estudianteId, clase) {
  return clase.estudianteIds.includes(estudianteId.toUpperCase());
}