// controllers/asistenciaController.js
// Logica de negocio completa para registro de asistencia.
// Cubre HU3, HU4, HU5, HU6, HU7, HU8, HU9, HU12, HU13.

import { validarIdentidad, perteneceAClase } from '../models/estudiantes';
import { yaRegistrado, crearRegistroAsistencia, crearLog } from '../models/asistencia';
import { estaEnHorario } from '../utils/time';
import { validarQR } from '../utils/qrGenerator';

// Helper para construir respuesta de error y registrar log
function err(mensaje, detalle, estudianteId, claseId, logs, agregarLog) {
  const log = crearLog(estudianteId, claseId, `${mensaje}: ${detalle}`);
  agregarLog(log);
  return { exito: false, mensaje, detalle, nuevoRegistro: null };
}

// ============================================================
// HU3, HU4, HU5, HU6, HU7, HU8: Registro por QR
// ============================================================
export function registrarAsistencia(estudianteId, celular, codigoQR, claseId, estado, agregarLog) {
  const { clases, estudiantes, registros } = estado;

  // HU3: campos obligatorios
  if (!estudianteId || !estudianteId.trim())
    return err('Campo requerido', 'Ingresa tu ID de estudiante.', estudianteId, claseId, [], agregarLog);
  if (!celular || !celular.trim())
    return err('Campo requerido', 'Ingresa tu numero de celular.', estudianteId, claseId, [], agregarLog);
  if (!codigoQR || !codigoQR.trim())
    return err('Campo requerido', 'Pega el codigo QR del profesor.', estudianteId, claseId, [], agregarLog);
  if (!claseId)
    return err('Sin clase activa', 'Selecciona una clase primero.', estudianteId, claseId, [], agregarLog);

  // Buscar la clase
  const clase = clases.find((c) => c.id === claseId);
  if (!clase)
    return err('Clase no encontrada', `No existe la clase con ID "${claseId}".`, estudianteId, claseId, [], agregarLog);

  // HU7: validar identidad — ID + celular deben coincidir
  const identidad = validarIdentidad(estudianteId, celular, estudiantes);
  if (!identidad.valido)
    return err('Identidad no valida', identidad.error, estudianteId, claseId, [], agregarLog);
  const estudiante = identidad.estudiante;

  // HU4: el estudiante debe estar inscrito en la clase
  if (!perteneceAClase(estudiante.id, clase))
    return err('No perteneces a esta clase', `"${estudiante.nombre}" no esta inscrito en esta clase.`, estudianteId, claseId, [], agregarLog);

  // HU5: solo se puede registrar dentro del horario
  if (!estaEnHorario(clase.horaInicio, clase.horaFin))
    return err('Fuera del horario', `La clase es de ${clase.horaInicio} a ${clase.horaFin}.`, estudianteId, claseId, [], agregarLog);

  // HU6: no se puede registrar dos veces
  if (yaRegistrado(estudianteId, claseId, registros))
    return err('Ya registrado', `"${estudiante.nombre}" ya tiene asistencia en esta clase.`, estudianteId, claseId, [], agregarLog);

  // HU8: validar el QR — token, expiracion y clase
  const qr = validarQR(codigoQR, claseId);
  if (!qr.valido)
    return err('Codigo QR invalido', qr.error, estudianteId, claseId, [], agregarLog);

  // Todo correcto — crear registro
  const nuevoRegistro = crearRegistroAsistencia(estudianteId, claseId, 'qr');
  return {
    exito: true,
    mensaje: 'Asistencia registrada',
    detalle: `Estudiante: ${estudiante.nombre}\nClase: ${clase.nombre}\nHora: ${new Date().toLocaleTimeString('es-CO')}`,
    nuevoRegistro,
  };
}

// ============================================================
// HU9: Registro manual por el profesor
// ============================================================
export function registrarManual(estudianteId, claseId, estado, agregarLog) {
  const { clases, estudiantes, registros } = estado;

  const estudiante = estudiantes.find(
    (e) => e.id.toLowerCase() === estudianteId.toLowerCase()
  );
  if (!estudiante)
    return err('Estudiante no encontrado', `No existe el ID "${estudianteId}".`, estudianteId, claseId, [], agregarLog);

  const clase = clases.find((c) => c.id === claseId);
  if (!clase)
    return err('Clase no encontrada', '', estudianteId, claseId, [], agregarLog);

  // Verificar que pertenece a la clase
  if (!perteneceAClase(estudianteId, clase))
    return err('No pertenece a esta clase', `"${estudiante.nombre}" no esta inscrito aqui.`, estudianteId, claseId, [], agregarLog);

  // Verificar duplicado
  if (yaRegistrado(estudianteId, claseId, registros))
    return err('Ya registrado', `"${estudiante.nombre}" ya tiene asistencia en esta clase.`, estudianteId, claseId, [], agregarLog);

  const nuevoRegistro = crearRegistroAsistencia(estudianteId, claseId, 'manual');
  return {
    exito: true,
    mensaje: 'Asistencia manual registrada',
    detalle: `Estudiante: ${estudiante.nombre}\nRegistrado manualmente por el profesor.`,
    nuevoRegistro,
  };
}