// utils/qrGenerator.js
// Generacion y validacion de QR dinamico (HU2, HU8, HU13).
// El QR es un string JSON con classId, token aleatorio y expiracion.

// Genera un nuevo QR para una clase con expiracion en segundos
export function generarQR(claseId, duracionSegundos = 60) {
  const token = Math.random().toString(36).substring(2, 10).toUpperCase();
  const exp = Date.now() + duracionSegundos * 1000;
  return JSON.stringify({ classId: claseId, token, exp });
}

// Valida que el QR sea correcto: formato, no expirado, clase correcta (HU8)
export function validarQR(codigoQR, claseId) {
  let payload;

  // Paso 1: verificar que sea JSON valido
  try {
    payload = JSON.parse(codigoQR);
  } catch {
    return { valido: false, payload: null, error: 'El codigo QR no tiene un formato valido. Posiblemente fue modificado.' };
  }

  // Paso 2: verificar que tenga todos los campos requeridos
  if (!payload.classId || !payload.token || !payload.exp) {
    return { valido: false, payload: null, error: 'El codigo QR esta incompleto o fue modificado.' };
  }

  // Paso 3: verificar que no haya expirado (HU2, HU13)
  if (Date.now() > payload.exp) {
    const seg = Math.round((Date.now() - payload.exp) / 1000);
    return {
      valido: false,
      payload: null,
      error: `El codigo QR expiro hace ${seg} segundos. Pide uno nuevo al profesor.`,
    };
  }

  // Paso 4: verificar que pertenezca a la clase correcta
  if (payload.classId !== claseId) {
    return { valido: false, payload: null, error: 'Este codigo QR pertenece a otra clase.' };
  }

  return { valido: true, payload, error: null };
}