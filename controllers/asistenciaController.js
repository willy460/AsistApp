// controllers/asistenciaController.js
// Logica de negocio: HU3, HU4, HU5, HU6, HU7 (Semana 2) y HU8 (Semana 3)

import { validarIdentidad, perteneceAClase } from '../models/estudiantes';
import { yaRegistrado, crearRegistroAsistencia } from '../models/asistencia';
import { estaEnHorario } from '../utils/time';
import { validarQR } from '../utils/qrGenerator';

function err(mensaje, detalle) {
  return { exito: false, mensaje, detalle, nuevoRegistro: null };
}

export function registrarAsistencia(estudianteId, celular, codigoQR, claseId, estado) {
  const { clases, estudiantes, registros } = estado;

  // HU3: campos obligatorios
  if (!estudianteId || !estudianteId.trim()) return err('Campo requerido', 'Ingresa tu ID de estudiante.');
  if (!celular || !celular.trim())           return err('Campo requerido', 'Ingresa tu numero de celular.');
  if (!codigoQR || !codigoQR.trim())         return err('Campo requerido', 'Pega el codigo QR del profesor.');
  if (!claseId)                              return err('Sin clase activa', 'Selecciona una clase primero.');

  // HU7: identidad
  const identidad = validarIdentidad(estudianteId, celular, estudiantes);
  if (!identidad.valido) return err('Identidad no valida', identidad.error);
  const estudiante = identidad.estudiante;

  // HU4: pertenencia
  if (!perteneceAClase(estudiante, claseId)) {
    return err('No perteneces a esta clase', `"${estudiante.nombre}" no esta inscrito en esta clase.`);
  }

  // HU5: horario
  const clase = clases.find((c) => c.id === claseId);
  if (!clase) return err('Clase no encontrada', `No existe la clase con ID "${claseId}".`);
  if (!estaEnHorario(clase.horaInicio, clase.horaFin)) {
    return err('Fuera del horario', `La clase es de ${clase.horaInicio} a ${clase.horaFin}.`);
  }

  // HU6: duplicado
  if (yaRegistrado(estudianteId, claseId, registros)) {
    return err('Ya registrado', `"${estudiante.nombre}" ya tiene asistencia en esta clase.`);
  }

  // HU8: QR valido
  const qr = validarQR(codigoQR, claseId);
  if (!qr.valido) return err('Codigo QR invalido', qr.error);

  // Todo ok
  const nuevoRegistro = crearRegistroAsistencia(estudianteId, claseId, 'qr');
  return {
    exito: true,
    mensaje: 'Asistencia registrada',
    detalle: `Estudiante: ${estudiante.nombre}\nClase: ${clase.nombre}\nHora: ${new Date().toLocaleTimeString('es-CO')}`,
    nuevoRegistro,
  };
}

export function registrarManual(estudianteId, claseId, estado) {
  const { clases, estudiantes, registros } = estado;
  const estudiante = estudiantes.find((e) => e.id === estudianteId);
  if (!estudiante) return err('Estudiante no encontrado', `No existe el ID "${estudianteId}".`);
  if (yaRegistrado(estudianteId, claseId, registros)) {
    return err('Ya registrado', `"${estudiante.nombre}" ya tiene asistencia.`);
  }
  const clase = clases.find((c) => c.id === claseId);
  if (!clase) return err('Clase no encontrada', '');
  const nuevoRegistro = crearRegistroAsistencia(estudianteId, claseId, 'manual');
  return {
    exito: true,
    mensaje: 'Asistencia manual registrada',
    detalle: `Estudiante: ${estudiante.nombre}\nRegistrado por el profesor.`,
    nuevoRegistro,
  };
}