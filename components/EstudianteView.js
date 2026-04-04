// components/EstudianteView.js
// Panel del estudiante.
// El estudiante ingresa su ID y celular (que el profesor registró),
// selecciona la clase, pega el QR y registra asistencia.

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet,
} from 'react-native';

import { registrarAsistencia } from '../controllers/asistenciaController';
import { horaActualTexto } from '../utils/time';

export default function EstudianteView({ estado, onActualizar, onAgregarLog, onVolver, onResultado }) {
  const { clases, registros } = estado;

  const [estudianteId, setEstudianteId]           = useState('');
  const [celular, setCelular]                     = useState('');
  const [codigoQR, setCodigoQR]                   = useState('');
  const [claseSeleccionada, setClaseSeleccionada] = useState(
    clases.length > 0 ? clases[0].id : null
  );
  const [cargando, setCargando] = useState(false);

  const handleRegistrar = () => {
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      const resultado = registrarAsistencia(
        estudianteId, celular, codigoQR,
        claseSeleccionada || '', estado, onAgregarLog
      );
      if (resultado.exito && resultado.nuevoRegistro) {
        onActualizar(resultado.nuevoRegistro);
      }
      onResultado(resultado);
    }, 500);
  };

  const horaAhora = horaActualTexto();

  return (
    <View style={styles.contenedor}>

      {/* ENCABEZADO */}
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={onVolver} style={styles.botonVolver}>
          <Text style={styles.botonVolverTexto}>Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Panel Estudiante</Text>
        {/* Hora actual visible siempre */}
        <Text style={styles.horaEncabezado}>{horaAhora}</Text>
      </View>

      <ScrollView style={styles.cuerpo} keyboardShouldPersistTaps="handled">

        {/* SELECCIONAR CLASE */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Selecciona tu clase</Text>
          {clases.length === 0 ? (
            <View style={styles.alerta}>
              <Text style={styles.alertaTexto}>
                No hay clases disponibles.{'\n'}
                El profesor debe crear una clase y registrarte en ella primero.
              </Text>
            </View>
          ) : (
            clases.map((clase) => {
              const dentroDeHorario = horaAhora >= clase.horaInicio && horaAhora <= clase.horaFin;
              const yaRegistro = registros.some(
                (r) => r.claseId === clase.id && r.estudianteId === estudianteId.toUpperCase()
              );
              return (
                <TouchableOpacity
                  key={clase.id}
                  style={[
                    styles.itemClase,
                    claseSeleccionada === clase.id && styles.itemClaseActiva,
                  ]}
                  onPress={() => setClaseSeleccionada(clase.id)}
                >
                  <Text style={styles.itemClaseNombre}>{clase.nombre}</Text>
                  <Text style={styles.itemClaseHora}>
                    {clase.horaInicio} - {clase.horaFin}
                  </Text>
                  <Text style={[
                    styles.itemClaseEstado,
                    dentroDeHorario ? styles.estadoActivo : styles.estadoInactivo,
                  ]}>
                    {dentroDeHorario
                      ? 'Horario activo'
                      : `Fuera de horario (ahora: ${horaAhora})`}
                  </Text>
                  {claseSeleccionada === clase.id && (
                    <Text style={styles.seleccionada}>Seleccionada</Text>
                  )}
                  {yaRegistro && (
                    <Text style={styles.yaRegistrado}>Ya registraste asistencia aqui</Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* DATOS DEL ESTUDIANTE */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Tus datos</Text>
          <Text style={styles.ayuda}>
            Ingresa exactamente el ID y celular que el profesor registro para ti.
          </Text>

          <Text style={styles.etiqueta}>ID de estudiante</Text>
          <TextInput
            style={styles.input}
            placeholder="El ID que te asigno el profesor"
            placeholderTextColor="#718096"
            value={estudianteId}
            onChangeText={setEstudianteId}
            autoCapitalize="characters"
          />

          <Text style={styles.etiqueta}>Numero de celular</Text>
          <TextInput
            style={styles.input}
            placeholder="El celular que el profesor registro"
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
            El profesor genera un codigo en su panel y te lo comparte por
            WhatsApp o lo muestra en pantalla. Copialo y pegalo aqui.
            El codigo expira en 60 segundos.
          </Text>
          <TextInput
            style={[styles.input, styles.inputQR]}
            placeholder="Pega aqui el codigo QR..."
            placeholderTextColor="#718096"
            value={codigoQR}
            onChangeText={setCodigoQR}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {codigoQR.length > 0 && (
            <View style={styles.qrCargado}>
              <Text style={styles.qrCargadoTexto}>Codigo listo</Text>
              <TouchableOpacity onPress={() => setCodigoQR('')}>
                <Text style={styles.qrLimpiar}>Limpiar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* BOTON REGISTRAR */}
        <TouchableOpacity
          style={[
            styles.botonRegistrar,
            (cargando || !claseSeleccionada || !codigoQR.trim()) && styles.botonDesactivado,
          ]}
          onPress={handleRegistrar}
          disabled={cargando || !claseSeleccionada || !codigoQR.trim()}
        >
          <Text style={styles.botonRegistrarTexto}>
            {cargando ? 'Validando...' : 'Registrar Asistencia'}
          </Text>
        </TouchableOpacity>

        {!codigoQR.trim() && (
          <Text style={styles.notaBoton}>
            Pega el codigo QR del profesor para habilitar el registro.
          </Text>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0f0f1a' },
  encabezado: {
    backgroundColor: '#1a1a2e', paddingTop: 50, paddingBottom: 16,
    paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#2d3748',
  },
  botonVolver: { marginRight: 12, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: '#2d3748', borderRadius: 6 },
  botonVolverTexto: { color: '#63b3ed', fontSize: 14 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', flex: 1 },
  horaEncabezado: { fontSize: 14, color: '#4299e1', fontWeight: '600', letterSpacing: 1 },
  cuerpo: { flex: 1, padding: 20 },
  seccion: { marginBottom: 24 },
  seccionTitulo: {
    fontSize: 12, fontWeight: '600', color: '#718096',
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1,
  },
  alerta: { backgroundColor: '#3b2a00', borderRadius: 10, padding: 14, borderLeftWidth: 3, borderLeftColor: '#f6ad55' },
  alertaTexto: { color: '#f6ad55', fontSize: 14, lineHeight: 22 },
  // Clases
  itemClase: {
    backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#2d3748',
  },
  itemClaseActiva: { borderColor: '#4299e1', backgroundColor: '#1a365d' },
  itemClaseNombre: { fontSize: 15, fontWeight: '600', color: '#ffffff', marginBottom: 4 },
  itemClaseHora: { fontSize: 13, color: '#a0aec0', marginBottom: 4 },
  itemClaseEstado: { fontSize: 12 },
  estadoActivo: { color: '#68d391' },
  estadoInactivo: { color: '#fc8181' },
  seleccionada: { fontSize: 12, color: '#4299e1', marginTop: 4 },
  yaRegistrado: { fontSize: 12, color: '#68d391', marginTop: 4 },
  // Inputs
  ayuda: { fontSize: 12, color: '#718096', marginBottom: 10, lineHeight: 18 },
  etiqueta: { fontSize: 13, color: '#a0aec0', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#2d3748', borderRadius: 8, padding: 12,
    color: '#ffffff', fontSize: 15, borderWidth: 1, borderColor: '#4a5568',
  },
  inputQR: { height: 80, paddingTop: 12, fontSize: 12 },
  qrCargado: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 8,
    backgroundColor: '#1c3a2a', borderRadius: 8, padding: 10,
  },
  qrCargadoTexto: { color: '#68d391', fontSize: 13 },
  qrLimpiar: { color: '#fc8181', fontSize: 13 },
  // Boton
  botonRegistrar: {
    backgroundColor: '#3730a3', borderRadius: 10,
    padding: 16, alignItems: 'center', marginBottom: 8,
  },
  botonDesactivado: { backgroundColor: '#374151' },
  botonRegistrarTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  notaBoton: { color: '#4a5568', fontSize: 12, textAlign: 'center', marginBottom: 40 },
});