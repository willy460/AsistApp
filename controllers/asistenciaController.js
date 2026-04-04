// controllers/asistenciaController.js
// HU3, HU4, HU5, HU6, HU7, HU8, HU9

import { validarIdentidad, perteneceAClase } from '../models/estudiantes';
import { yaRegistrado, crearRegistroAsistencia, crearLog } from '../models/asistencia';
import { estaEnHorario } from '../utils/time';
import { validarQR } from '../utils/qrGenerator';

function err(mensaje, detalle, estudianteId, claseId, agregarLog) {
  if (agregarLog) {
    agregarLog(crearLog(estudianteId, claseId, `${mensaje}: ${detalle}`));
  }
  return { exito: false, mensaje, detalle, nuevoRegistro: null };
}

// HU3-HU8: registro por QR
export function registrarAsistencia(estudianteId, celular, codigoQR, claseId, estado, agregarLog) {
  const { clases, estudiantes, registros } = estado;

  if (!estudianteId || !estudianteId.trim())
    return err('Campo requerido', 'Ingresa tu ID de estudiante.', estudianteId, claseId, agregarLog);
  if (!celular || !celular.trim())
    return err('Campo requerido', 'Ingresa tu numero de celular.', estudianteId, claseId, agregarLog);
  if (!codigoQR || !codigoQR.trim())
    return err('Campo requerido', 'Pega el codigo QR del profesor.', estudianteId, claseId, agregarLog);
  if (!claseId)
    return err('Sin clase activa', 'Selecciona una clase primero.', estudianteId, claseId, agregarLog);

  const clase = clases.find((c) => c.id === claseId);
  if (!clase)
    return err('Clase no encontrada', `No existe la clase "${claseId}".`, estudianteId, claseId, agregarLog);

  // HU7: identidad
  const identidad = validarIdentidad(estudianteId, celular, estudiantes);
  if (!identidad.valido)
    return err('Identidad no valida', identidad.error, estudianteId, claseId, agregarLog);
  const estudiante = identidad.estudiante;

  // HU4: pertenencia
  if (!perteneceAClase(estudiante.id, clase))
    return err('No perteneces a esta clase', `"${estudiante.nombre}" no esta inscrito aqui.`, estudianteId, claseId, agregarLog);

  // HU5: horario
  if (!estaEnHorario(clase.horaInicio, clase.horaFin))
    return err('Fuera del horario', `La clase es de ${clase.horaInicio} a ${clase.horaFin}.`, estudianteId, claseId, agregarLog);

  // HU6: duplicado
  if (yaRegistrado(estudianteId, claseId, registros))
    return err('Ya registrado', `"${estudiante.nombre}" ya tiene asistencia en esta clase.`, estudianteId, claseId, agregarLog);

  // HU8: QR valido
  const qr = validarQR(codigoQR, claseId);
  if (!qr.valido)
    return err('Codigo QR invalido', qr.error, estudianteId, claseId, agregarLog);

  const nuevoRegistro = crearRegistroAsistencia(estudianteId, claseId, 'qr');
  return {
    exito: true,
    mensaje: 'Asistencia registrada',
    detalle: `Estudiante: ${estudiante.nombre}\nClase: ${clase.nombre}\nHora: ${new Date().toLocaleTimeString('es-CO')}`,
    nuevoRegistro,
  };
}

// HU9: registro manual
export function registrarManual(estudianteId, claseId, estado, agregarLog) {
  const { clases, estudiantes, registros } = estado;

  const estudiante = estudiantes.find(
    (e) => e.id.toLowerCase() === estudianteId.toLowerCase()
  );
  if (!estudiante)
    return err('Estudiante no encontrado', `No existe el ID "${estudianteId}".`, estudianteId, claseId, agregarLog);

  const clase = clases.find((c) => c.id === claseId);
  if (!clase)
    return err('Clase no encontrada', '', estudianteId, claseId, agregarLog);

  if (!perteneceAClase(estudianteId, clase))
    return err('No pertenece a esta clase', `"${estudiante.nombre}" no esta inscrito aqui.`, estudianteId, claseId, agregarLog);

  if (yaRegistrado(estudianteId, claseId, registros))
    return err('Ya registrado', `"${estudiante.nombre}" ya tiene asistencia.`, estudianteId, claseId, agregarLog);

  const nuevoRegistro = crearRegistroAsistencia(estudianteId, claseId, 'manual');
  return {
    exito: true,
    mensaje: 'Asistencia manual registrada',
    detalle: `Estudiante: ${estudiante.nombre}\nRegistrado manualmente por el profesor.`,
    nuevoRegistro,
  };
}