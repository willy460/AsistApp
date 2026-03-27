// ============================================================
// utils/exportExcel.js — Exportación a Excel/CSV (Semana 4)
// ============================================================
// Usa la librería 'xlsx' para generar archivos .xlsx.
// Instalación (Semana 4): npm install xlsx
// ============================================================

/**
 * exportarAsistencia — Exporta la lista de asistencia a Excel o CSV.
 *
 * @param {Array} resumen - [{ estudiante, asistencias, porcentaje }]
 * @param {string} nombreClase
 */
export function exportarAsistencia(resumen, nombreClase) {
  // TODO (Semana 4): implementar con la librería xlsx
  // Pista:
  //   import * as XLSX from 'xlsx';
  //   const datos = resumen.map(r => ({
  //     'ID': r.estudiante.id,
  //     'Nombre': r.estudiante.nombre,
  //     'Asistencias': r.asistencias,
  //     '% Asistencia': r.porcentaje + '%',
  //   }));
  //   const ws = XLSX.utils.json_to_sheet(datos);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
  //   XLSX.writeFile(wb, `asistencia_${nombreClase}.xlsx`);
  console.log('Exportación disponible en Semana 4');
}