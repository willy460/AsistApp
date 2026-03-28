// components/ProfesorView.js
// Panel del profesor. Cubre HU1, HU2, HU9, HU12.
// El profesor crea clases, agrega estudiantes a cada clase,
// genera QR dinamico y puede registrar asistencia manual.

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, Clipboard,
} from 'react-native';

import { crearClase, validarClase, inscribirEstudiante } from '../models/clases';
import { crearEstudiante, validarEstudiante } from '../models/estudiantes';
import { generarQR } from '../utils/qrGenerator';
import { registrarManual } from '../controllers/asistenciaController';
import TimePicker from './TimePicker';

const DURACION_QR = 60;

export default function ProfesorView({ estado, onAgregarClase, onActualizarClase, onAgregarEstudiante, onAgregarRegistro, onAgregarLog, onVolver }) {
  const { clases, estudiantes, registros, logs } = estado;

  // --- Navegacion interna del panel ---
  const [vista, setVista] = useState('inicio'); // 'inicio' | 'nuevaClase' | 'detalleClase' | 'nuevoEstudiante' | 'registroManual' | 'logs'

  // --- Clase seleccionada actualmente ---
  const [claseActiva, setClaseActiva] = useState(null);

  // --- Formulario nueva clase ---
  const [formNombre, setFormNombre] = useState('');
  const [formHoraInicio, setFormHoraInicio] = useState('08:00');
  const [formHoraFin, setFormHoraFin] = useState('10:00');

  // --- Formulario nuevo estudiante ---
  const [estId, setEstId] = useState('');
  const [estNombre, setEstNombre] = useState('');
  const [estCelular, setEstCelular] = useState('');

  // --- QR dinamico ---
  const [codigoQR, setCodigoQR] = useState(null);
  const [segundos, setSegundos] = useState(0);

  // Contador regresivo del QR
  useEffect(() => {
    if (!codigoQR) return;
    setSegundos(DURACION_QR);
    const iv = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) { clearInterval(iv); setCodigoQR(null); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [codigoQR]);

  // ── CREAR CLASE (HU1) ──────────────────────────────────────
  const handleCrearClase = () => {
    const { valido, error } = validarClase(formNombre, formHoraInicio, formHoraFin);
    if (!valido) { Alert.alert('Error', error); return; }
    const nueva = crearClase(formNombre, formHoraInicio, formHoraFin);
    onAgregarClase(nueva);
    setFormNombre(''); setFormHoraInicio('08:00'); setFormHoraFin('10:00');
    setClaseActiva(nueva);
    setVista('detalleClase');
  };

  // ── AGREGAR ESTUDIANTE A CLASE ─────────────────────────────
  const handleAgregarEstudiante = () => {
    const { valido, error } = validarEstudiante(estId, estNombre, estCelular);
    if (!valido) { Alert.alert('Error', error); return; }

    // Verificar que el ID no exista ya en el sistema
    const existe = estudiantes.find(
      (e) => e.id.toLowerCase() === estId.trim().toLowerCase()
    );

    let estudianteParaInscribir;
    if (existe) {
      // El estudiante ya existe, solo inscribir en la clase
      estudianteParaInscribir = existe;
    } else {
      // Crear nuevo estudiante
      const nuevo = crearEstudiante(estId, estNombre, estCelular);
      onAgregarEstudiante(nuevo);
      estudianteParaInscribir = nuevo;
    }

    // Inscribir en la clase activa
    const claseActualizada = inscribirEstudiante(claseActiva, estudianteParaInscribir.id);
    onActualizarClase(claseActualizada);
    setClaseActiva(claseActualizada);

    setEstId(''); setEstNombre(''); setEstCelular('');
    Alert.alert('Estudiante agregado', `"${estudianteParaInscribir.nombre}" fue inscrito en la clase.`);
    setVista('detalleClase');
  };

  // ── GENERAR QR (HU2) ───────────────────────────────────────
  const handleGenerarQR = () => {
    if (!claseActiva) { Alert.alert('Sin clase', 'Selecciona una clase primero.'); return; }
    setCodigoQR(generarQR(claseActiva.id, DURACION_QR));
  };

  const handleCopiarQR = () => {
    if (codigoQR) {
      Clipboard.setString(codigoQR);
      Alert.alert('Copiado', 'Comparte este codigo con el estudiante.');
    }
  };

  // ── REGISTRO MANUAL (HU9) ──────────────────────────────────
  const [estudianteManualId, setEstudianteManualId] = useState('');
  const handleRegistroManual = () => {
    if (!estudianteManualId.trim()) { Alert.alert('Error', 'Ingresa el ID del estudiante.'); return; }
    const resultado = registrarManual(estudianteManualId, claseActiva.id, estado, onAgregarLog);
    if (resultado.exito && resultado.nuevoRegistro) {
      onAgregarRegistro(resultado.nuevoRegistro);
      Alert.alert('Registrado', resultado.detalle);
      setEstudianteManualId('');
    } else {
      Alert.alert(resultado.mensaje, resultado.detalle);
    }
  };

  // ── Datos de la clase activa actualizados desde el estado global ──
  const claseActivaActualizada = claseActiva
    ? clases.find((c) => c.id === claseActiva.id) || claseActiva
    : null;

  const registrosDeLaClase = claseActivaActualizada
    ? registros.filter((r) => r.claseId === claseActivaActualizada.id)
    : [];

  const estudiantesDeClase = claseActivaActualizada
    ? estudiantes.filter((e) => claseActivaActualizada.estudianteIds.includes(e.id))
    : [];

  const nombreEstudiante = (id) =>
    estudiantes.find((e) => e.id === id)?.nombre ?? id;

  const colorContador = segundos > 30 ? '#68d391' : segundos > 10 ? '#f6ad55' : '#fc8181';

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════

  // ── VISTA: DETALLE DE CLASE ────────────────────────────────
  if (vista === 'detalleClase' && claseActivaActualizada) {
    return (
      <View style={styles.contenedor}>
        <View style={styles.encabezado}>
          <TouchableOpacity onPress={() => { setVista('inicio'); setCodigoQR(null); }} style={styles.botonVolver}>
            <Text style={styles.botonVolverTexto}>Clases</Text>
          </TouchableOpacity>
          <Text style={styles.titulo} numberOfLines={1}>{claseActivaActualizada.nombre}</Text>
        </View>
        <ScrollView style={styles.cuerpo}>

          {/* Info de la clase */}
          <View style={styles.claseInfo}>
            <Text style={styles.claseDetalle}>{claseActivaActualizada.horaInicio} - {claseActivaActualizada.horaFin}  |  {claseActivaActualizada.fecha}</Text>
            <Text style={styles.claseDetalle}>{claseActivaActualizada.estudianteIds.length} estudiantes inscritos</Text>
          </View>

          {/* QR */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Codigo QR (HU2)</Text>
            {codigoQR ? (
              <View style={styles.qrActivo}>
                <Text style={[styles.qrContador, { color: colorContador }]}>{segundos}s</Text>
                <Text style={styles.qrEtiqueta}>Expira en</Text>
                <View style={styles.qrCodigo}>
                  <Text style={styles.qrCodigoTexto} numberOfLines={4}>{codigoQR}</Text>
                </View>
                <TouchableOpacity style={styles.botonPrimario} onPress={handleCopiarQR}>
                  <Text style={styles.botonPrimarioTexto}>Copiar codigo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonSecundario} onPress={handleGenerarQR}>
                  <Text style={styles.botonSecundarioTexto}>Generar nuevo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.botonGenerarQR} onPress={handleGenerarQR}>
                <Text style={styles.botonGenerarQRTexto}>Generar QR</Text>
                <Text style={styles.botonGenerarQRSub}>Valido por {DURACION_QR} segundos</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Asistencia */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Asistencia hoy ({registrosDeLaClase.length})</Text>
            {registrosDeLaClase.length === 0 ? (
              <Text style={styles.textoVacio}>Ningun estudiante ha registrado aun.</Text>
            ) : (
              registrosDeLaClase.map((reg) => (
                <View key={reg.id} style={styles.itemRegistro}>
                  <Text style={styles.itemRegistroNombre}>{nombreEstudiante(reg.estudianteId)}</Text>
                  <Text style={styles.itemRegistroDetalle}>
                    {reg.metodo === 'manual' ? 'Manual' : 'QR'}  ·  {new Date(reg.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Registro manual */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Registro manual (HU9)</Text>
            <TextInput
              style={styles.input}
              placeholder="ID del estudiante"
              placeholderTextColor="#718096"
              value={estudianteManualId}
              onChangeText={setEstudianteManualId}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.botonPrimario} onPress={handleRegistroManual}>
              <Text style={styles.botonPrimarioTexto}>Registrar manualmente</Text>
            </TouchableOpacity>
          </View>

          {/* Estudiantes inscritos */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Estudiantes inscritos ({estudiantesDeClase.length})</Text>
            {estudiantesDeClase.length === 0 ? (
              <Text style={styles.textoVacio}>No hay estudiantes inscritos aun.</Text>
            ) : (
              estudiantesDeClase.map((est) => (
                <View key={est.id} style={styles.itemEstudiante}>
                  <Text style={styles.itemEstudianteNombre}>{est.nombre}</Text>
                  <Text style={styles.itemEstudianteId}>ID: {est.id}  ·  Cel: {est.celular}</Text>
                </View>
              ))
            )}
            <TouchableOpacity style={[styles.botonSecundario, { marginTop: 8 }]} onPress={() => setVista('nuevoEstudiante')}>
              <Text style={styles.botonSecundarioTexto}>Agregar estudiante</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    );
  }

  // ── VISTA: NUEVA CLASE ─────────────────────────────────────
  if (vista === 'nuevaClase') {
    return (
      <View style={styles.contenedor}>
        <View style={styles.encabezado}>
          <TouchableOpacity onPress={() => setVista('inicio')} style={styles.botonVolver}>
            <Text style={styles.botonVolverTexto}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Nueva Clase</Text>
        </View>
        <ScrollView style={styles.cuerpo}>
          <Text style={styles.etiqueta}>Nombre de la clase</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Matematicas Lunes"
            placeholderTextColor="#718096"
            value={formNombre}
            onChangeText={setFormNombre}
          />
          <TimePicker label="Hora de inicio" valor={formHoraInicio} onChange={setFormHoraInicio} />
          <TimePicker label="Hora de fin"    valor={formHoraFin}    onChange={setFormHoraFin} />
          <TouchableOpacity style={styles.botonPrimario} onPress={handleCrearClase}>
            <Text style={styles.botonPrimarioTexto}>Guardar Clase</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── VISTA: AGREGAR ESTUDIANTE ──────────────────────────────
  if (vista === 'nuevoEstudiante') {
    return (
      <View style={styles.contenedor}>
        <View style={styles.encabezado}>
          <TouchableOpacity onPress={() => setVista('detalleClase')} style={styles.botonVolver}>
            <Text style={styles.botonVolverTexto}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Agregar Estudiante</Text>
        </View>
        <ScrollView style={styles.cuerpo}>
          <Text style={styles.ayuda}>
            El estudiante usara este ID y celular para registrar asistencia.
          </Text>
          <Text style={styles.etiqueta}>ID del estudiante</Text>
          <TextInput style={styles.input} placeholder="Ej: EST001" placeholderTextColor="#718096" value={estId} onChangeText={setEstId} autoCapitalize="characters" />
          <Text style={styles.etiqueta}>Nombre completo</Text>
          <TextInput style={styles.input} placeholder="Ej: Ana Garcia" placeholderTextColor="#718096" value={estNombre} onChangeText={setEstNombre} />
          <Text style={styles.etiqueta}>Numero de celular</Text>
          <TextInput style={styles.input} placeholder="Ej: 3001234567" placeholderTextColor="#718096" value={estCelular} onChangeText={setEstCelular} keyboardType="phone-pad" maxLength={10} />
          <TouchableOpacity style={styles.botonPrimario} onPress={handleAgregarEstudiante}>
            <Text style={styles.botonPrimarioTexto}>Agregar a la clase</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── VISTA: LOGS (HU12) ─────────────────────────────────────
  if (vista === 'logs') {
    return (
      <View style={styles.contenedor}>
        <View style={styles.encabezado}>
          <TouchableOpacity onPress={() => setVista('inicio')} style={styles.botonVolver}>
            <Text style={styles.botonVolverTexto}>Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Logs de errores (HU12)</Text>
        </View>
        <ScrollView style={styles.cuerpo}>
          {logs.length === 0 ? (
            <Text style={styles.textoVacio}>No hay intentos fallidos registrados.</Text>
          ) : (
            [...logs].reverse().map((log) => (
              <View key={log.id} style={styles.itemLog}>
                <Text style={styles.itemLogMotivo}>{log.motivo}</Text>
                <Text style={styles.itemLogDetalle}>ID: {log.estudianteId}  ·  {new Date(log.timestamp).toLocaleString('es-CO')}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // ── VISTA: INICIO (lista de clases) ───────────────────────
  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={onVolver} style={styles.botonVolver}>
          <Text style={styles.botonVolverTexto}>Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Panel Profesor</Text>
      </View>
      <ScrollView style={styles.cuerpo}>

        {clases.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTexto}>No hay clases creadas.</Text>
            <Text style={styles.emptyStateSub}>Crea tu primera clase para comenzar.</Text>
          </View>
        ) : (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Mis clases ({clases.length})</Text>
            {clases.map((clase) => (
              <TouchableOpacity
                key={clase.id}
                style={styles.itemClase}
                onPress={() => { setClaseActiva(clase); setVista('detalleClase'); setCodigoQR(null); }}
              >
                <Text style={styles.itemClaseNombre}>{clase.nombre}</Text>
                <Text style={styles.itemClaseHora}>{clase.horaInicio} - {clase.horaFin}  ·  {clase.fecha}</Text>
                <Text style={styles.itemClaseContador}>
                  {clase.estudianteIds.length} estudiantes  ·  {registros.filter((r) => r.claseId === clase.id).length} registros hoy
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.botonPrimario} onPress={() => setVista('nuevaClase')}>
          <Text style={styles.botonPrimarioTexto}>Nueva Clase</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botonSecundario, { marginTop: 12 }]} onPress={() => setVista('logs')}>
          <Text style={styles.botonSecundarioTexto}>Ver logs de errores ({logs.length})</Text>
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
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', flex: 1 },
  cuerpo: { flex: 1, padding: 20 },
  seccion: { marginBottom: 24 },
  seccionTitulo: { fontSize: 12, fontWeight: '600', color: '#718096', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  claseInfo: { backgroundColor: '#1a365d', borderRadius: 10, padding: 14, marginBottom: 20, borderLeftWidth: 3, borderLeftColor: '#4299e1' },
  claseDetalle: { fontSize: 13, color: '#90cdf4', marginBottom: 2 },
  textoVacio: { color: '#4a5568', fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyStateTexto: { fontSize: 16, color: '#a0aec0', fontWeight: '600', marginBottom: 8 },
  emptyStateSub: { fontSize: 13, color: '#4a5568' },
  // QR
  qrActivo: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#2d3748', marginBottom: 8 },
  qrContador: { fontSize: 52, fontWeight: 'bold', letterSpacing: 2 },
  qrEtiqueta: { fontSize: 12, color: '#718096', marginBottom: 16 },
  qrCodigo: { backgroundColor: '#2d3748', borderRadius: 8, padding: 12, width: '100%', marginBottom: 12 },
  qrCodigoTexto: { color: '#e2e8f0', fontSize: 11, fontFamily: 'monospace' },
  botonGenerarQR: { backgroundColor: '#2d3748', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#4a5568', marginBottom: 8 },
  botonGenerarQRTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 17, marginBottom: 4 },
  botonGenerarQRSub: { color: '#718096', fontSize: 12 },
  // Registros
  itemRegistro: { backgroundColor: '#1c3a2a', borderRadius: 8, padding: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemRegistroNombre: { color: '#68d391', fontWeight: '600', fontSize: 14 },
  itemRegistroDetalle: { color: '#9ae6b4', fontSize: 12 },
  // Estudiantes
  itemEstudiante: { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: '#2d3748' },
  itemEstudianteNombre: { color: '#ffffff', fontWeight: '600', fontSize: 14, marginBottom: 2 },
  itemEstudianteId: { color: '#718096', fontSize: 12 },
  // Logs
  itemLog: { backgroundColor: '#3b1c1c', borderRadius: 8, padding: 12, marginBottom: 6, borderLeftWidth: 3, borderLeftColor: '#f56565' },
  itemLogMotivo: { color: '#fc8181', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  itemLogDetalle: { color: '#a0aec0', fontSize: 11 },
  // Formularios
  etiqueta: { fontSize: 13, color: '#a0aec0', marginBottom: 6, marginTop: 12 },
  ayuda: { fontSize: 12, color: '#718096', marginBottom: 16, lineHeight: 18 },
  input: { backgroundColor: '#2d3748', borderRadius: 8, padding: 12, color: '#ffffff', fontSize: 15, borderWidth: 1, borderColor: '#4a5568', marginBottom: 8 },
  // Botones
  botonPrimario: { backgroundColor: '#2d6a4f', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 8 },
  botonPrimarioTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  botonSecundario: { borderWidth: 1, borderColor: '#4a5568', borderRadius: 10, padding: 14, alignItems: 'center' },
  botonSecundarioTexto: { color: '#a0aec0', fontSize: 14 },
  // Lista clases
  itemClase: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2d3748' },
  itemClaseNombre: { fontSize: 15, fontWeight: '600', color: '#ffffff', marginBottom: 4 },
  itemClaseHora: { fontSize: 12, color: '#a0aec0', marginBottom: 2 },
  itemClaseContador: { fontSize: 12, color: '#63b3ed' },
});