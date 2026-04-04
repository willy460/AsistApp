// app/(tabs)/index.tsx
// El estado del QR vive aqui para que no se pierda al navegar.

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

import ProfesorView   from '../../components/ProfesorView';
import EstudianteView from '../../components/EstudianteView';
import ResultadoView  from '../../components/ResultadoView';

import { generarQR } from '../../utils/qrGenerator';

type Clase      = { id: string; nombre: string; horaInicio: string; horaFin: string; fecha: string; creadaEn: string; estudianteIds: string[]; totalSesiones: number };
type Estudiante = { id: string; nombre: string; celular: string };
type Registro   = { id: string; estudianteId: string; claseId: string; timestamp: string; metodo: 'qr' | 'manual' };
type Log        = { id: string; estudianteId: string; claseId: string; motivo: string; timestamp: string };
type Resultado  = { exito: boolean; mensaje: string; detalle: string; nuevoRegistro: Registro | null } | null;

const DURACION_QR = 60;

export default function Index() {
  const [clases,      setClases]      = useState<Clase[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [registros,   setRegistros]   = useState<Registro[]>([]);
  const [logs,        setLogs]        = useState<Log[]>([]);
  const [pantalla,    setPantalla]    = useState('inicio');
  const [resultado,   setResultado]   = useState<Resultado>(null);

  // ── Estado del QR aqui arriba para que persista al navegar ──
  const [codigoQR,    setCodigoQR]    = useState<string | null>(null);
  const [segundosQR,  setSegundosQR]  = useState(0);
  const [claseQRId,   setClaseQRId]   = useState<string | null>(null); // a que clase pertenece el QR activo
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Contador regresivo del QR — persiste aunque el usuario navegue
  useEffect(() => {
    if (!codigoQR) return;
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = setInterval(() => {
      setSegundosQR((s) => {
        if (s <= 1) {
          clearInterval(intervaloRef.current!);
          setCodigoQR(null);
          setClaseQRId(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [codigoQR]);

  // Funcion que genera un nuevo QR para una clase
  const handleGenerarQR = (claseId: string) => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    const nuevo = generarQR(claseId, DURACION_QR);
    setCodigoQR(nuevo);
    setSegundosQR(DURACION_QR);
    setClaseQRId(claseId);
  };

  const estadoGlobal = { clases, estudiantes, registros, logs };

  const agregarClase      = (nueva: Clase)     => setClases((p) => [...p, nueva]);
  const actualizarClase   = (act: Clase)        => setClases((p) => p.map((c) => c.id === act.id ? act : c));
  const agregarEstudiante = (nuevo: Estudiante) => setEstudiantes((p) => [...p, nuevo]);
  const agregarRegistro   = (nuevo: Registro)   => setRegistros((p) => [...p, nuevo]);
  const agregarLog        = (log: Log)          => setLogs((p) => [...p, log]);

  if (pantalla === 'profesor') {
    return (
      <ProfesorView
        estado={estadoGlobal}
        codigoQR={codigoQR}
        segundosQR={segundosQR}
        claseQRId={claseQRId}
        onGenerarQR={handleGenerarQR}
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

  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>AsistApp</Text>
        <Text style={styles.subtitulo}>Control de asistencia</Text>
      </View>

      {/* Muestra el QR activo en el inicio si hay uno vigente */}
      {codigoQR && (
        <View style={styles.qrAlerta}>
          <Text style={styles.qrAlertaTexto}>
            QR activo — expira en {segundosQR}s
          </Text>
        </View>
      )}

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
          <Text style={styles.botonSub}>
            {clases.length} {clases.length === 1 ? 'clase' : 'clases'}  ·  {registros.length} registros hoy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.boton, styles.botonEstudiante]} onPress={() => setPantalla('estudiante')}>
          <Text style={styles.botonTexto}>Estudiante</Text>
          <Text style={styles.botonSub}>Registrar asistencia con QR</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.version}>Semanas 1-4 completas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0f0f1a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  encabezado: { alignItems: 'center', marginBottom: 32 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  subtitulo: { fontSize: 14, color: '#718096' },
  qrAlerta: { backgroundColor: '#1a365d', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 16, borderWidth: 1, borderColor: '#4299e1' },
  qrAlertaTexto: { color: '#90cdf4', fontSize: 13, fontWeight: '600' },
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