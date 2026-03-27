// ============================================================
// components/ResultadoView.js — Pantalla de Resultado
// ============================================================
// Muestra el resultado del intento de registro de asistencia:
//   ✅ Éxito: confirmación visual con detalles
//   ❌ Error: motivo del rechazo claro para el estudiante
// Esta pantalla recibirá datos reales en la Semana 2.
// ============================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

/**
 * ResultadoView — Muestra el resultado de un intento de registro.
 * Props:
 *   resultado  {Object}   — { exito, mensaje, detalle, nota? }
 *   onVolver   {Function} — regresar al panel del estudiante
 *   onInicio   {Function} — ir a la pantalla de inicio
 */
export default function ResultadoView({ resultado, onVolver, onInicio }) {
  // Si por alguna razón no llegó resultado, mostrar mensaje genérico
  if (!resultado) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.textoError}>No se recibió información del resultado.</Text>
        <TouchableOpacity style={styles.boton} onPress={onVolver}>
          <Text style={styles.botonTexto}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { exito, mensaje, detalle, nota } = resultado;

  return (
    <View style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.cuerpo}>

        {/* ── ÍCONO GRANDE DE RESULTADO ── */}
        <Text style={styles.icono}>{exito ? '✅' : '❌'}</Text>

        {/* ── MENSAJE PRINCIPAL ── */}
        <Text style={[styles.mensaje, exito ? styles.mensajeExito : styles.mensajeError]}>
          {mensaje}
        </Text>

        {/* ── DETALLE (timestamp, nombre, etc.) ── */}
        {detalle && (
          <View style={[styles.caja, exito ? styles.cajaExito : styles.cajaError]}>
            <Text style={styles.detalleTexto}>{detalle}</Text>
          </View>
        )}

        {/* ── NOTA DE DESARROLLO (solo en MVP) ── */}
        {nota && (
          <Text style={styles.notaMVP}>{nota}</Text>
        )}

        {/* ── BOTONES DE NAVEGACIÓN ── */}
        <View style={styles.botones}>
          {/* Intentar de nuevo → vuelve al panel estudiante */}
          <TouchableOpacity style={styles.botonSecundario} onPress={onVolver}>
            <Text style={styles.botonSecundarioTexto}>🔄 Nuevo intento</Text>
          </TouchableOpacity>

          {/* Ir al inicio */}
          <TouchableOpacity style={styles.botonPrimario} onPress={onInicio}>
            <Text style={styles.botonPrimarioTexto}>🏠 Ir al inicio</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

// ------------------------------------------------------------
// ESTILOS
// ------------------------------------------------------------
const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  cuerpo: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icono: {
    fontSize: 80,
    marginBottom: 24,
  },
  mensaje: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  mensajeExito: {
    color: '#68d391', // verde
  },
  mensajeError: {
    color: '#fc8181', // rojo
  },
  caja: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  cajaExito: {
    backgroundColor: '#1c4532',
    borderLeftWidth: 4,
    borderLeftColor: '#68d391',
  },
  cajaError: {
    backgroundColor: '#3b1c1c',
    borderLeftWidth: 4,
    borderLeftColor: '#fc8181',
  },
  detalleTexto: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 22,
  },
  notaMVP: {
    color: '#718096',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
  },
  botones: {
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  botonPrimario: {
    backgroundColor: '#4299e1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botonSecundario: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  botonSecundarioTexto: {
    color: '#a0aec0',
    fontWeight: '600',
    fontSize: 16,
  },
  textoError: {
    color: '#fc8181',
    textAlign: 'center',
    padding: 32,
  },
});