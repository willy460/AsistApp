// components/ResultadoView.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function ResultadoView({ resultado, onVolver, onInicio }) {
  if (!resultado) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.textoError}>No se recibio informacion del resultado.</Text>
        <TouchableOpacity style={styles.botonPrimario} onPress={onVolver}>
          <Text style={styles.botonPrimarioTexto}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const { exito, mensaje, detalle } = resultado;
  return (
    <View style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.cuerpo}>
        <View style={[styles.barra, exito ? styles.barraExito : styles.barraError]} />
        <Text style={[styles.mensaje, exito ? styles.mensajeExito : styles.mensajeError]}>{mensaje}</Text>
        {detalle ? (
          <View style={[styles.caja, exito ? styles.cajaExito : styles.cajaError]}>
            <Text style={styles.detalle}>{detalle}</Text>
          </View>
        ) : null}
        <View style={styles.botones}>
          <TouchableOpacity style={styles.botonSecundario} onPress={onVolver}>
            <Text style={styles.botonSecundarioTexto}>Nuevo intento</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonPrimario} onPress={onInicio}>
            <Text style={styles.botonPrimarioTexto}>Ir al inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0f0f1a' },
  cuerpo: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  barra: { width: 60, height: 6, borderRadius: 3, marginBottom: 32 },
  barraExito: { backgroundColor: '#48bb78' },
  barraError: { backgroundColor: '#f56565' },
  mensaje: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  mensajeExito: { color: '#68d391' },
  mensajeError: { color: '#fc8181' },
  caja: { borderRadius: 12, padding: 16, width: '100%', marginBottom: 32 },
  cajaExito: { backgroundColor: '#1c4532', borderLeftWidth: 3, borderLeftColor: '#48bb78' },
  cajaError: { backgroundColor: '#3b1c1c', borderLeftWidth: 3, borderLeftColor: '#f56565' },
  detalle: { color: '#e2e8f0', fontSize: 14, lineHeight: 22 },
  botones: { width: '100%', gap: 12 },
  botonPrimario: { backgroundColor: '#3730a3', borderRadius: 10, padding: 14, alignItems: 'center' },
  botonPrimarioTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  botonSecundario: { backgroundColor: '#2d3748', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#4a5568' },
  botonSecundarioTexto: { color: '#a0aec0', fontSize: 15 },
  textoError: { color: '#fc8181', textAlign: 'center', padding: 32 },
});