// utils/qrGenerator.js

// Genera un codigo QR (string JSON) para una clase con expiracion
export function generarQR(claseId, duracionSegundos = 60) {
  const token = Math.random().toString(36).substring(2, 10).toUpperCase();
  const exp = Date.now() + duracionSegundos * 1000;
  return JSON.stringify({ classId: claseId, token, exp });
}

// Valida que el QR sea correcto: formato, no expirado, clase correcta
export function validarQR(codigoQR, claseId) {
  let payload;
  try {
    payload = JSON.parse(codigoQR);
  } catch {
    return { valido: false, payload: null, error: 'El codigo QR no tiene un formato valido.' };
  }

  if (!payload.classId || !payload.token || !payload.exp) {
    return { valido: false, payload: null, error: 'El codigo QR esta incompleto o fue modificado.' };
  }

  if (Date.now() > payload.exp) {
    const seg = Math.round((Date.now() - payload.exp) / 1000);
    return { valido: false, payload: null, error: `El codigo QR expiro hace ${seg} segundos. Pide uno nuevo.` };
  }

  if (payload.classId !== claseId) {
    return { valido: false, payload: null, error: 'Este codigo QR pertenece a otra clase.' };
  }

  return { valido: true, payload, error: null };
}

// Segundos restantes antes de que expire
export function segundosRestantes(payload) {
  return Math.max(0, Math.round((payload.exp - Date.now()) / 1000));
}