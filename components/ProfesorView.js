// ============================================================
// components/ProfesorView.js — SEMANA 2 (corregido)
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import { crearClase, validarClase } from '../models/clases';

export default function ProfesorView({ estado, onAgregarClase, onVolver }) {
  const { clases, estudiantes, registros } = estado;

  const [claseSeleccionada, setClaseSeleccionada] = useState(
    clases.length > 0 ? clases[0] : null
  );
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formNombre, setFormNombre] = useState('');
  const [formHoraInicio, setFormHoraInicio] = useState('');
  const [formHoraFin, setFormHoraFin] = useState('');

  // ──────────────────────────────────────────────
  // CREAR CLASE: sube al estado global del index
  // ──────────────────────────────────────────────
  const handleCrearClase = () => {
    const { valido, error } = validarClase(formNombre, formHoraInicio, formHoraFin);
    if (!valido) {
      Alert.alert('Error', error);
      return;
    }

    const nuevaClase = crearClase(formNombre, formHoraInicio, formHoraFin);

    // Sube la clase al estado global — así el estudiante la ve de inmediato
    onAgregarClase(nuevaClase);
    setClaseSeleccionada(nuevaClase);

    setFormNombre('');
    setFormHoraInicio('');
    setFormHoraFin('');
    setMostrarFormulario(false);

    Alert.alert('✅ Clase creada', `"${nuevaClase.nombre}" lista.`);
  };

  // Registros de la clase activa
  const registrosDeLaClase = claseSeleccionada
    ? registros.filter((r) => r.claseId === claseSeleccionada.id)
    : [];

  const nombreEstudiante = (id) => {
    const est = estudiantes.find((e) => e.id === id);
    return est ? est.nombre : id;
  };

  return (
    <View style={styles.contenedor}>

      {/* ENCABEZADO */}
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={onVolver} style={styles.botonVolver}>
          <Text style={styles.botonVolverTexto}>← Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>👨‍🏫 Panel Profesor</Text>
      </View>

      <ScrollView style={styles.cuerpo} showsVerticalScrollIndicator={false}>

        {/* CLASE ACTIVA */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Clase activa</Text>
          {claseSeleccionada ? (
            <View style={styles.claseActiva}>
              <Text style={styles.claseActivaNombre}>{claseSeleccionada.nombre}</Text>
              <Text style={styles.claseActivaHora}>
                ⏰ {claseSeleccionada.horaInicio} – {claseSeleccionada.horaFin}
              </Text>
              <Text style={styles.claseActivaFecha}>📅 {claseSeleccionada.fecha}</Text>
            </View>
          ) : (
            <Text style={styles.textoVacio}>Selecciona o crea una clase</Text>
          )}
        </View>

        {/* ASISTENCIA DE HOY */}
        {claseSeleccionada && (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>
              Asistencia hoy ({registrosDeLaClase.length})
            </Text>
            {registrosDeLaClase.length === 0 ? (
              <Text style={styles.textoVacio}>Ningún estudiante ha registrado aún.</Text>
            ) : (
              registrosDeLaClase.map((reg) => (
                <View key={reg.id} style={styles.itemRegistro}>
                  <Text style={styles.itemRegistroNombre}>
                    ✅ {nombreEstudiante(reg.estudianteId)}
                  </Text>
                  <Text style={styles.itemRegistroDetalle}>
                    {reg.metodo === 'manual' ? '📝 Manual' : '📱 QR'} ·{' '}
                    {new Date(reg.timestamp).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* BOTÓN NUEVA CLASE */}
        <TouchableOpacity
          style={styles.botonCrear}
          onPress={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <Text style={styles.botonCrearTexto}>
            {mostrarFormulario ? '✕ Cancelar' : '＋ Nueva Clase'}
          </Text>
        </TouchableOpacity>

        {/* FORMULARIO */}
        {mostrarFormulario && (
          <View style={styles.formulario}>
            <Text style={styles.formularioTitulo}>Nueva Clase</Text>

            <Text style={styles.etiqueta}>Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: App Móviles - Lunes"
              placeholderTextColor="#718096"
              value={formNombre}
              onChangeText={setFormNombre}
            />

            <Text style={styles.etiqueta}>Hora inicio * (HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 08:00  (usa 00:00 para pruebas)"
              placeholderTextColor="#718096"
              value={formHoraInicio}
              onChangeText={setFormHoraInicio}
              maxLength={5}
            />

            <Text style={styles.etiqueta}>Hora fin * (HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 23:59  (usa 23:59 para pruebas)"
              placeholderTextColor="#718096"
              value={formHoraFin}
              onChangeText={setFormHoraFin}
              maxLength={5}
            />

            <TouchableOpacity style={styles.botonGuardar} onPress={handleCrearClase}>
              <Text style={styles.botonGuardarTexto}>💾 Guardar Clase</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LISTA DE CLASES */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Clases ({clases.length})</Text>
          {clases.map((clase) => (
            <TouchableOpacity
              key={clase.id}
              style={[
                styles.itemClase,
                claseSeleccionada?.id === clase.id && styles.itemClaseActiva,
              ]}
              onPress={() => setClaseSeleccionada(clase)}
            >
              <Text style={styles.itemClaseNombre}>{clase.nombre}</Text>
              <Text style={styles.itemClaseHora}>
                {clase.horaInicio} – {clase.horaFin} · {clase.fecha}
              </Text>
              <Text style={styles.itemClaseContador}>
                👥 {registros.filter((r) => r.claseId === clase.id).length} registros
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Próximas funciones</Text>
          <Text style={styles.textoProximo}>🔄 Semana 3: Generar QR dinámico</Text>
          <Text style={styles.textoProximo}>🔄 Semana 4: Registro manual y Excel</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0f0f1a' },
  encabezado: {
    backgroundColor: '#1a1a2e',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
  },
  botonVolver: { marginRight: 16 },
  botonVolverTexto: { color: '#63b3ed', fontSize: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  cuerpo: { flex: 1, padding: 20 },
  seccion: { marginBottom: 24 },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a0aec0',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  claseActiva: {
    backgroundColor: '#1a365d',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4299e1',
  },
  claseActivaNombre: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  claseActivaHora: { fontSize: 14, color: '#90cdf4', marginBottom: 2 },
  claseActivaFecha: { fontSize: 14, color: '#90cdf4' },
  textoVacio: { color: '#718096', fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
  itemRegistro: {
    backgroundColor: '#1c4532',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemRegistroNombre: { color: '#68d391', fontWeight: '600', fontSize: 14 },
  itemRegistroDetalle: { color: '#9ae6b4', fontSize: 12 },
  botonCrear: {
    backgroundColor: '#2d6a4f',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  botonCrearTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  formulario: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  formularioTitulo: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 },
  etiqueta: { fontSize: 14, color: '#a0aec0', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#2d3748',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  botonGuardar: {
    backgroundColor: '#4299e1',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  botonGuardarTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  itemClase: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  itemClaseActiva: { borderColor: '#4299e1', backgroundColor: '#1a365d' },
  itemClaseNombre: { fontSize: 15, fontWeight: '600', color: '#ffffff', marginBottom: 4 },
  itemClaseHora: { fontSize: 13, color: '#a0aec0', marginBottom: 2 },
  itemClaseContador: { fontSize: 12, color: '#63b3ed', marginTop: 2 },
  textoProximo: { color: '#718096', fontSize: 14, paddingVertical: 3 },
});