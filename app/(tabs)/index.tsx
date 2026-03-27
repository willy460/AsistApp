// app/(tabs)/index.js
// Estado global y navegacion entre pantallas.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

import ProfesorView   from '../../components/ProfesorView';
import EstudianteView from '../../components/EstudianteView';
import ResultadoView  from '../../components/ResultadoView';

import { CLASES_INICIALES } from '../../models/clases';
import { ESTUDIANTES_INICIALES } from '../../models/estudiantes';

export default function Index() {
  const [clases, setClases] = useState(CLASES_INICIALES);
  const [estudiantes] = useState(ESTUDIANTES_INICIALES);
  const [registros, setRegistros] = useState([]);
  const [pantalla, setPantalla] = useState('inicio');
  const [resultado, setResultado] = useState(null);

  const estadoGlobal = { clases, estudiantes, registros };

  const agregarClase = (nueva: typeof CLASES_INICIALES[0]) => setClases((prev) => [...prev, nueva]);
  const agregarRegistro = (nuevo: typeof registros[0]) => setRegistros((prev) => [...prev, nuevo]);
  if (pantalla === 'profesor') {
    return (
      <ProfesorView
        estado={estadoGlobal}
        onAgregarClase={agregarClase}
        onVolver={() => setPantalla('inicio')}
      />
    );
  }

  if (pantalla === 'estudiante') {
    return (
      <EstudianteView
        estado={estadoGlobal}
        onActualizar={agregarRegistro}
        onVolver={() => setPantalla('inicio')}
        onResultado={(r: typeof resultado) => { setResultado(r); setPantalla('resultado'); }}
      />
    );
  }

  if (pantalla === 'resultado') {
    return (
      <ResultadoView
        resultado={resultado}
        onVolver={() => setPantalla('estudiante')}
        onInicio={() => setPantalla('inicio')}
      />
    );
  }

  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      <View style={styles.encabezado}>
        <Text style={styles.titulo}>SmartAttendance QR</Text>
        <Text style={styles.subtitulo}>Control de asistencia</Text>
      </View>

      {registros.length > 0 && (
        <View style={styles.contador}>
          <Text style={styles.contadorTexto}>
            {registros.length} {registros.length === 1 ? 'asistencia registrada' : 'asistencias registradas'} hoy
          </Text>
        </View>
      )}

      <View style={styles.botones}>
        <TouchableOpacity style={[styles.boton, styles.botonProfesor]} onPress={() => setPantalla('profesor')}>
          <Text style={styles.botonTexto}>Profesor</Text>
          <Text style={styles.botonSub}>Gestionar clases · QR · Ver registros ({registros.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.boton, styles.botonEstudiante]} onPress={() => setPantalla('estudiante')}>
          <Text style={styles.botonTexto}>Estudiante</Text>
          <Text style={styles.botonSub}>Registrar asistencia con QR</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Semana 3 activa</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0f0f1a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  encabezado: { alignItems: 'center', marginBottom: 40 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  subtitulo: { fontSize: 14, color: '#718096' },
  contador: { backgroundColor: '#1c3a2a', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 28 },
  contadorTexto: { color: '#68d391', fontSize: 14, fontWeight: '600' },
  botones: { width: '100%', gap: 14 },
  boton: { borderRadius: 14, padding: 22, alignItems: 'center' },
  botonProfesor: { backgroundColor: '#1e3a2f' },
  botonEstudiante: { backgroundColor: '#1a2744' },
  botonTexto: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  botonSub: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },
  version: { color: '#374151', fontSize: 11, marginTop: 32 },
});