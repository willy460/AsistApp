// utils/exportar.js
// Genera un archivo Excel (.xlsx) con la lista de asistencia
// y lo comparte/descarga directamente al presionar el boton (HU11).
// Requiere: npm install xlsx && npx expo install expo-file-system expo-sharing

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { utils, write } from 'xlsx';

/**
 * exportarAsistencia
 * Crea un .xlsx con la asistencia de los estudiantes y lo descarga.
 *
 * @param {Array}  filas        - [{ id, nombre, asistencias, totalClases, porcentaje }]
 * @param {Array}  registros    - lista completa de registros para incluir detalle
 * @param {string} nombreClase
 */
export async function exportarAsistencia(filas, registros, nombreClase) {
  try {
    if (filas.length === 0) {
      return { exito: false, error: 'No hay estudiantes para exportar.' };
    }

    // ── Hoja 1: Resumen de asistencia ──────────────────────
    const resumenData = [
      // Encabezados de la tabla
      ['ID', 'Nombre', 'Asistencias', 'Total Sesiones', '% Asistencia', 'Estado'],
      // Filas de datos
      ...filas.map((f) => [
        f.id,
        f.nombre,
        f.asistencias,
        f.totalClases,
        `${f.porcentaje}%`,
        f.porcentaje >= 70 ? 'Aprobado' : 'En riesgo',
      ]),
    ];

    // ── Hoja 2: Detalle de registros ───────────────────────
    const registrosDeLaClase = registros.filter((r) =>
      filas.some((f) => f.id === r.estudianteId)
    );

    const detalleData = [
      ['ID Estudiante', 'Nombre', 'Fecha', 'Hora', 'Metodo'],
      ...registrosDeLaClase.map((r) => {
        const estudiante = filas.find((f) => f.id === r.estudianteId);
        const fecha = new Date(r.timestamp);
        return [
          r.estudianteId,
          estudiante?.nombre ?? r.estudianteId,
          fecha.toLocaleDateString('es-CO'),
          fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          r.metodo === 'manual' ? 'Manual' : 'QR',
        ];
      }),
    ];

    // ── Crear el libro Excel ───────────────────────────────
    const wb = utils.book_new();

    // Hoja 1 — Resumen
    const wsResumen = utils.aoa_to_sheet(resumenData);
    // Ancho de columnas
    wsResumen['!cols'] = [
      { wch: 10 }, // ID
      { wch: 25 }, // Nombre
      { wch: 12 }, // Asistencias
      { wch: 15 }, // Total sesiones
      { wch: 14 }, // Porcentaje
      { wch: 12 }, // Estado
    ];
    utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // Hoja 2 — Detalle
    const wsDetalle = utils.aoa_to_sheet(detalleData);
    wsDetalle['!cols'] = [
      { wch: 12 }, // ID
      { wch: 25 }, // Nombre
      { wch: 14 }, // Fecha
      { wch: 10 }, // Hora
      { wch: 10 }, // Metodo
    ];
    utils.book_append_sheet(wb, wsDetalle, 'Detalle');

    // ── Convertir a buffer binario ─────────────────────────
    const xlsxBinario = write(wb, { type: 'base64', bookType: 'xlsx' });

    // ── Guardar en el dispositivo ──────────────────────────
    const ahora = new Date();
    const timestamp = `${ahora.getDate()}-${ahora.getMonth() + 1}-${ahora.getFullYear()}`;
    const nombreArchivo = `asistencia_${nombreClase.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
    const ruta = FileSystem.documentDirectory + nombreArchivo;

    await FileSystem.writeAsStringAsync(ruta, xlsxBinario, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // ── Compartir/descargar el archivo ─────────────────────
    const puedeCompartir = await Sharing.isAvailableAsync();
    if (!puedeCompartir) {
      return { exito: false, error: 'Este dispositivo no soporta compartir archivos.' };
    }

    await Sharing.shareAsync(ruta, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: `Asistencia - ${nombreClase}`,
      UTI: 'com.microsoft.excel.xlsx',
    });

    return { exito: true, nombreArchivo };
  } catch (e) {
    return { exito: false, error: e.message };
  }
}

/**
 * generarResumen — Calcula estadisticas de asistencia por estudiante (HU10).
 */
export function generarResumen(estudiantes, registros, claseId, totalSesiones) {
  return estudiantes.map((est) => {
    const asistencias = registros.filter(
      (r) => r.estudianteId === est.id && r.claseId === claseId
    ).length;
    const porcentaje = totalSesiones > 0
      ? Math.round((asistencias / totalSesiones) * 100)
      : 0;
    return {
      id: est.id,
      nombre: est.nombre,
      asistencias,
      totalClases: totalSesiones,
      porcentaje,
    };
  });
}