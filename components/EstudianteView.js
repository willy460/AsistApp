// components/EstudianteView.js
// Panel del estudiante. Cubre HU3, HU4, HU5, HU6, HU7, HU8.

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';

import { registrarAsistencia } from '../controllers/asistenciaController';

export default function EstudianteView({ estado, onActualizar, onAgregarLog, onVolver, onResultado }) {
  const { clases, registros } = estado;

  const [estudianteId, setEstudianteId] = useState('');
  const [celular, setCelular] = useState('');
  const [codigoQR, setCodigoQR] = useState('');
  const [claseSeleccionada, setClaseSeleccionada] = useState(
    clases.length > 0 ? clases[0].id : null
  );
  const [cargando, setCargando] = useState(false);

  const handleRegistrar = () => {
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      const resultado = registrarAsistencia(
        estudianteId,
        celular,
        codigoQR,
        claseSeleccionada || '',
        estado,
        onAgregarLog // HU12: logs de intentos fallidos
      );
      if (resultado.exito && resultado.nuevoRegistro) {
        onActualizar(resultado.nuevoRegistro);
      }
      onResultado(resultado);
    }, 500);
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={onVolver} style={styles.botonVolver}>
          <Text style={styles.botonVolverTexto}>Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Panel Estudiante</Text>
      </View>

      <ScrollView style={styles.cuerpo} keyboardShouldPersistTaps="handled">

        {/* SELECCIONAR CLASE */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Selecciona tu clase</Text>
          {clases.length === 0 ? (
            <View style={styles.alerta}>
              <Text style={styles.alertaTexto}>
                No hay clases disponibles. El profesor debe crear una primero.
              </Text>
            </View>
          ) : (
            clases.map((clase) => (
              <TouchableOpacity
                key={clase.id}
                style={[styles.itemClase, claseSeleccionada === clase.id && styles.itemClaseActiva]}
                onPress={() => setClaseSeleccionada(clase.id)}
              >
                <Text style={styles.itemClaseNombre}>{clase.nombre}</Text>
                <Text style={styles.itemClaseHora}>{clase.horaInicio} - {clase.horaFin}</Text>
                {claseSeleccionada === clase.id && (
                  <Text style={styles.itemClaseCheck}>Seleccionada</Text>
                )}
                {registros.some((r) => r.claseId === clase.id && r.estudianteId === estudianteId.toUpperCase()) && (
                  <Text style={styles.yaRegistrado}>Ya registraste aqui</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* DATOS */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Tus datos</Text>
          <Text style={styles.etiqueta}>ID de estudiante</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu ID"
            placeholderTextColor="#718096"
            value={estudianteId}
            onChangeText={setEstudianteId}
            autoCapitalize="characters"
          />
          <Text style={styles.etiqueta}>Numero de celular</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu celular"
            placeholderTextColor="#718096"
            value={celular}
            onChangeText={setCelular}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* CODIGO QR */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Codigo QR</Text>
          <Text style={styles.ayuda}>
            El profesor genera un codigo. Copialo y pegalo aqui antes de que expire.
          </Text>
          <TextInput
            style={[styles.input, styles.inputQR]}
            placeholder="Pega el codigo QR aqui..."
            placeholderTextColor="#718096"
            value={codigoQR}
            onChangeText={setCodigoQR}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* BOTON */}
        <TouchableOpacity
          style={[styles.botonRegistrar, (cargando || !claseSeleccionada) && styles.botonDesactivado]}
          onPress={handleRegistrar}
          disabled={cargando || !claseSeleccionada}
        >
          <Text style={styles.botonRegistrarTexto}>
            {cargando ? 'Validando...' : 'Registrar Asistencia'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0f0f1a' },
  encabezado: { backgroundColor: '#1a1a2e', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2d3748' },
  botonVolver: { marginRight: 16, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: '#2d3748', borderRadius: 6 },
  botonVolverTexto: { color: '#63b3ed', fontSize: 14 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  cuerpo: { flex: 1, padding: 20 },
  seccion: { marginBottom: 24 },
  seccionTitulo: { fontSize: 12, fontWeight: '600', color: '#718096', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  alerta: { backgroundColor: '#3b2a00', borderRadius: 10, padding: 14, borderLeftWidth: 3, borderLeftColor: '#f6ad55' },
  alertaTexto: { color: '#f6ad55', fontSize: 14 },
  itemClase: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2d3748' },
  itemClaseActiva: { borderColor: '#4299e1', backgroundColor: '#1a365d' },
  itemClaseNombre: { fontSize: 15, fontWeight: '600', color: '#ffffff', marginBottom: 4 },
  itemClaseHora: { fontSize: 13, color: '#a0aec0' },
  itemClaseCheck: { fontSize: 12, color: '#4299e1', marginTop: 4 },
  yaRegistrado: { fontSize: 12, color: '#68d391', marginTop: 4 },
  etiqueta: { fontSize: 13, color: '#a0aec0', marginBottom: 6, marginTop: 12 },
  ayuda: { fontSize: 12, color: '#718096', marginBottom: 8, lineHeight: 18 },
  input: { backgroundColor: '#2d3748', borderRadius: 8, padding: 12, color: '#ffffff', fontSize: 15, borderWidth: 1, borderColor: '#4a5568' },
  inputQR: { height: 90, paddingTop: 12, fontSize: 12 },
  botonRegistrar: { backgroundColor: '#3730a3', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 40 },
  botonDesactivado: { backgroundColor: '#374151' },
  botonRegistrarTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});