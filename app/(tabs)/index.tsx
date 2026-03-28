// app/(tabs)/index.tsx
// Estado global y navegacion entre pantallas.
// Maneja: clases, estudiantes, registros y logs (HU12).

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

import ProfesorView   from '../../components/ProfesorView';
import EstudianteView from '../../components/EstudianteView';
import ResultadoView  from '../../components/ResultadoView';

// ── Tipos base inferidos del estado vacío inicial ──
type Clase      = { id: string; nombre: string; horaInicio: string; horaFin: string; [key: string]: any };
type Estudiante = { id: string; nombre: string; celular: string; claseIds: string[] };
type Registro   = { estudianteId: string; claseId: string; fecha: string; [key: string]: any };
type Log        = { mensaje: string; timestamp?: string; [key: string]: any };
type Resultado  = { exito: boolean; mensaje: string; detalle?: string; nuevoRegistro?: Registro | null } | null;

export default function Index() {
  // Estado global — todo arranca vacio (sin datos predeterminados)
  const [clases,      setClases]      = useState<Clase[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [registros,   setRegistros]   = useState<Registro[]>([]);
  const [logs,        setLogs]        = useState<Log[]>([]);

  const [pantalla,  setPantalla]  = useState('inicio');
  const [resultado, setResultado] = useState<Resultado>(null);

  const estadoGlobal = { clases, estudiantes, registros, logs };

  // Agrega una clase nueva
  const agregarClase = (nueva: Clase) => setClases((prev) => [...prev, nueva]);

  // Actualiza una clase existente (ej: cuando se inscribe un estudiante)
  const actualizarClase = (claseActualizada: Clase) =>
    setClases((prev) => prev.map((c) => c.id === claseActualizada.id ? claseActualizada : c));

  // Agrega un estudiante nuevo al sistema
  const agregarEstudiante = (nuevo: Estudiante) => setEstudiantes((prev) => [...prev, nuevo]);

  // Agrega un registro de asistencia
  const agregarRegistro = (nuevo: Registro) => setRegistros((prev) => [...prev, nuevo]);

  // Agrega un log de intento fallido (HU12)
  const agregarLog = (log: Log) => setLogs((prev) => [...prev, log]);

  if (pantalla === 'profesor') {
    return (
      <ProfesorView
        estado={estadoGlobal}
        onAgregarClase={agregarClase}
        onActualizarClase={actualizarClase}
        onAgregarEstudiante={agregarEstudiante}
        onAgregarRegistro={agregarRegistro}
        onAgregarLog={agregarLog}
        onVolver={() => setPantalla('inicio')}
      />
    );
  }

  if (pantalla === 'estudiante') {
    return (
      <EstudianteView
        estado={estadoGlobal}
        onActualizar={agregarRegistro}
        onAgregarLog={agregarLog}
        onVolver={() => setPantalla('inicio')}
        onResultado={(r: Resultado) => { setResultado(r); setPantalla('resultado'); }}
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

  // PANTALLA DE INICIO
  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      <View style={styles.encabezado}>
        <Text style={styles.titulo}>AsistApp</Text>
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
        <TouchableOpacity
          style={[styles.boton, styles.botonProfesor]}
          onPress={() => setPantalla('profesor')}
        >
          <Text style={styles.botonTexto}>Profesor</Text>
          <Text style={styles.botonSub}>
            {clases.length} {clases.length === 1 ? 'clase' : 'clases'}  ·  {registros.length} registros hoy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, styles.botonEstudiante]}
          onPress={() => setPantalla('estudiante')}
        >
          <Text style={styles.botonTexto}>Estudiante</Text>
          <Text style={styles.botonSub}>Registrar asistencia con QR</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Semanas 1-3 completas</Text>
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