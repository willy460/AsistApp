// utils/exportar.js
// Genera un archivo Excel (.xlsx) con la lista de asistencia
// y lo comparte/descarga directamente al presionar el boton (HU11).
// Requiere: npm install xlsx && npx expo install expo-file-system expo-sharing

// utils/exportExcel.js
// HU11: Exportar asistencia a Excel (.xlsx) con fallback a CSV
// HU10: generarResumen() calcula % de asistencia por estudiante

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────────────────────────
// HU10: Calcula estadísticas de asistencia por estudiante
// ─────────────────────────────────────────────────────────────────────────────
export function generarResumen(estudiantes, registros, claseId, totalSesiones) {
  return estudiantes.map((est) => {
    const asistencias = registros.filter(
      (r) => r.estudianteId === est.id && r.claseId === claseId
    ).length;
    const porcentaje =
      totalSesiones > 0 ? Math.round((asistencias / totalSesiones) * 100) : 0;
    return {
      id: est.id,
      nombre: est.nombre,
      asistencias,
      totalClases: totalSesiones,
      porcentaje,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HU11: Exporta asistencia a Excel (.xlsx) o CSV como fallback
// ─────────────────────────────────────────────────────────────────────────────
export async function exportarAsistencia(filas, registros, nombreClase) {
  try {
    if (filas.length === 0) {
      return { exito: false, error: 'No hay estudiantes para exportar.' };
    }

    // ── Hoja 1: Resumen ───────────────────────────────────────
    const resumenData = [
      ['ID', 'Nombre', 'Asistencias', 'Total Sesiones', '% Asistencia', 'Estado'],
      ...filas.map((f) => [
        f.id,
        f.nombre,
        f.asistencias,
        f.totalClases,
        `${f.porcentaje}%`,
        f.porcentaje >= 70 ? 'Aprobado' : 'En riesgo',
      ]),
    ];

    // ── Hoja 2: Detalle de registros ──────────────────────────
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

    // ── Construir workbook ────────────────────────────────────
    const wb = XLSX.utils.book_new();

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    wsResumen['!cols'] = [
      { wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 14 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);
    wsDetalle['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

    // ── Web: writeFile descarga directo en el browser ─────────
    if (Platform.OS === 'web') {
      XLSX.writeFile(wb, `asistencia_${nombreClase.replace(/\s+/g, '_')}.xlsx`);
      return { exito: true, formato: 'xlsx' };
    }

    // ── Native: intentar xlsx, fallback a CSV ─────────────────
    const ts = new Date().toISOString().split('T')[0];
    const nombreArchivo = `asistencia_${nombreClase.replace(/\s+/g, '_')}_${ts}`;

    try {
      const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const rutaXlsx = FileSystem.documentDirectory + nombreArchivo + '.xlsx';
      await FileSystem.writeAsStringAsync(rutaXlsx, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Sharing.shareAsync(rutaXlsx, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: `Asistencia - ${nombreClase}`,
        UTI: 'com.microsoft.excel.xlsx',
      });
      return { exito: true, formato: 'xlsx' };
    } catch (_xlsxErr) {
      // Fallback CSV — siempre funciona en React Native
      const csvData = resumenData.map((row) => row.join(',')).join('\n');
      const rutaCsv = FileSystem.documentDirectory + nombreArchivo + '.csv';
      await FileSystem.writeAsStringAsync(rutaCsv, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(rutaCsv, {
        mimeType: 'text/csv',
        dialogTitle: `Asistencia - ${nombreClase} (CSV)`,
      });
      return { exito: true, formato: 'csv' };
    }
  } catch (e) {
    return { exito: false, error: e.message };
  }
}