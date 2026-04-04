// components/ProfesorView.js
// El QR ahora viene como prop desde index.tsx para que persista al navegar.

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, Clipboard,
} from 'react-native';

import QRCode from 'react-native-qrcode-svg';

import { crearClase, validarClase, inscribirEstudiante } from '../models/clases';
import { crearEstudiante, validarEstudiante } from '../models/estudiantes';
import { registrarManual } from '../controllers/asistenciaController';
import { exportarAsistencia, generarResumen } from '../utils/exportExcel';
import TimePicker from './TimePicker';

export default function ProfesorView({
  estado,
  // QR viene del index — persiste aunque el usuario navegue
  codigoQR,
  segundosQR,
  claseQRId,
  onGenerarQR,
  // Handlers del estado global
  onAgregarClase,
  onActualizarClase,
  onAgregarEstudiante,
  onAgregarRegistro,
  onAgregarLog,
  onVolver,
}) {
  const { clases, estudiantes, registros, logs } = estado;

  const [vista, setVista] = useState('inicio');
  const [claseActiva, setClaseActiva] = useState(null);

  // Formulario nueva clase
  const [formNombre, setFormNombre] = useState('');
  const [formHoraInicio, setFormHoraInicio] = useState('08:00');
  const [formHoraFin, setFormHoraFin] = useState('10:00');

  // Formulario nuevo estudiante
  const [estId, setEstId] = useState('');
  const [estNombre, setEstNombre] = useState('');
  const [estCelular, setEstCelular] = useState('');

  // Registro manual
  const [estudianteManualId, setEstudianteManualId] = useState('');

  // Exportacion
  const [exportando, setExportando] = useState(false);

  // Mostrar/ocultar texto del QR
  const [mostrarTextoQR, setMostrarTextoQR] = useState(false);

  // Clase actualizada desde estado global
  const claseActualizada = claseActiva
    ? clases.find((c) => c.id === claseActiva.id) || claseActiva
    : null;

  const registrosDeLaClase = claseActualizada
    ? registros.filter((r) => r.claseId === claseActualizada.id)
    : [];

  const estudiantesDeClase = claseActualizada
    ? estudiantes.filter((e) => claseActualizada.estudianteIds.includes(e.id))
    : [];

  const nombreEstudiante = (id) =>
    estudiantes.find((e) => e.id === id)?.nombre ?? id;

  // QR activo para la clase seleccionada actualmente
  const qrDeEstaClase = claseActualizada && claseQRId === claseActualizada.id
    ? codigoQR
    : null;

  const colorContador = segundosQR > 30 ? '#68d391' : segundosQR > 10 ? '#f6ad55' : '#fc8181';

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

  // ── AGREGAR ESTUDIANTE ─────────────────────────────────────
  const handleAgregarEstudiante = () => {
    const { valido, error } = validarEstudiante(estId, estNombre, estCelular);
    if (!valido) { Alert.alert('Error', error); return; }
    const existe = estudiantes.find((e) => e.id.toLowerCase() === estId.trim().toLowerCase());
    let est = existe;
    if (!existe) {
      est = crearEstudiante(estId, estNombre, estCelular);
      onAgregarEstudiante(est);
    }
    const claseActz = inscribirEstudiante(claseActualizada, est.id);
    onActualizarClase(claseActz);
    setClaseActiva(claseActz);
    setEstId(''); setEstNombre(''); setEstCelular('');
    Alert.alert('Listo', `"${est.nombre}" fue inscrito en la clase.`);
    setVista('detalleClase');
  };

  // ── COPIAR QR ──────────────────────────────────────────────
  const handleCopiarQR = () => {
    if (codigoQR) {
      Clipboard.setString(codigoQR);
      Alert.alert('Copiado', 'El codigo fue copiado. El estudiante debe pegarlo en su panel antes de que expire.');
    }
  };

  // ── REGISTRO MANUAL (HU9) ──────────────────────────────────
  const handleRegistroManual = () => {
    if (!estudianteManualId.trim()) { Alert.alert('Error', 'Ingresa el ID del estudiante.'); return; }
    const resultado = registrarManual(estudianteManualId, claseActualizada.id, estado, onAgregarLog);
    if (resultado.exito && resultado.nuevoRegistro) {
      onAgregarRegistro(resultado.nuevoRegistro);
      Alert.alert('Registrado', resultado.detalle);
      setEstudianteManualId('');
    } else {
      Alert.alert(resultado.mensaje, resultado.detalle);
    }
  };

  // ── EXPORTAR (HU11) ────────────────────────────────────────
  const handleExportar = async () => {
    if (estudiantesDeClase.length === 0) {
      Alert.alert('Sin datos', 'No hay estudiantes en esta clase.');
      return;
    }
    setExportando(true);
    const resumen = generarResumen(
      estudiantesDeClase, registros,
      claseActualizada.id, claseActualizada.totalSesiones || 1
    );
    const resultado = await exportarAsistencia(resumen, registros, claseActualizada.nombre);
    setExportando(false);
    if (!resultado.exito) Alert.alert('Error al exportar', resultado.error);
  };

  // ══════════════════════════════════════════════════════════
  // VISTAS
  // ══════════════════════════════════════════════════════════

  // ── TABLA DE ASISTENCIA (HU10) ─────────────────────────────
  if (vista === 'tablaAsistencia' && claseActualizada) {
    const resumen = generarResumen(
      estudiantesDeClase, registros,
      claseActualizada.id, claseActualizada.totalSesiones || 1
    );
    return (
      <View style={styles.contenedor}>
        <View style={styles.encabezado}>
          <TouchableOpacity onPress={() => setVista('detalleClase')} style={styles.botonVolver}>
            <Text style={styles.botonVolverTexto}>Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>% Asistencia (HU10)</Text>
        </View>
        <ScrollView style={styles.cuerpo}>
          <Text style={styles.ayuda}>
            {claseActualizada.nombre}  ·  {claseActualizada.totalSesiones || 1} sesion(es)
          </Text>
          <View style={styles.tablaEncabezado}>
            <Text style={[styles.tablaCelda, styles.tablaCeldaAncha, { color: '#ffffff', fontWeight: 'bold' }]}>Estudiante</Text>
            <Text style={[styles.tablaCelda, { color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }]}>Asist.</Text>
            <Text style={[styles.tablaCelda, { color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }]}>%</Text>
          </View>
          {resumen.length === 0 ? (
            <Text style={styles.textoVacio}>No hay estudiantes inscritos.</Text>
          ) : (
            resumen.map((fila) => (
              <View key={fila.id} style={styles.tablaFila}>
                <View style={[styles.tablaCelda, styles.tablaCeldaAncha]}>
                  <Text style={styles.tablaTextoNombre}>{fila.nombre}</Text>
                  <Text style={styles.tablaTextoId}>{fila.id}</Text>
                </View>
                <Text style={[styles.tablaCelda, { color: '#a0aec0', textAlign: 'center' }]}>
                  {fila.asistencias}/{fila.totalClases}
                </Text>
                <View style={styles.tablaCelda}>
                  <Text style={[styles.tablaPorcentaje, fila.porcentaje >= 70 ? styles.porcentajeBueno : styles.porcentajeMalo]}>
                    {fila.porcentaje}%
                  </Text>
                </View>
              </View>
            ))
          )}
          <TouchableOpacity
            style={[styles.botonExportar, exportando && styles.botonDesactivado]}
            onPress={handleExportar}
            disabled={exportando}
          >
            <Text style={styles.botonExportarTexto}>
              {exportando ? 'Generando...' : 'Exportar y compartir'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.notaExportar}>
            Se abre el menu de compartir del celular. Puedes enviarlo por correo o WhatsApp y abrirlo en Excel.
          </Text>
        </ScrollView>
      </View>
    );
  }

  // ── DETALLE DE CLASE ───────────────────────────────────────
  if (vista === 'detalleClase' && claseActualizada) {
    return (
      <View style={styles.contenedor}>
        <View style={styles.encabezado}>
          <TouchableOpacity onPress={() => { setVista('inicio'); }} style={styles.botonVolver}>
            <Text style={styles.botonVolverTexto}>Clases</Text>
          </TouchableOpacity>
          <Text style={styles.titulo} numberOfLines={1}>{claseActualizada.nombre}</Text>
        </View>
        <ScrollView style={styles.cuerpo}>

          <View style={styles.claseInfo}>
            <Text style={styles.claseDetalle}>{claseActualizada.horaInicio} - {claseActualizada.horaFin}  |  {claseActualizada.fecha}</Text>
            <Text style={styles.claseDetalle}>{claseActualizada.estudianteIds.length} estudiantes inscritos</Text>
          </View>

          {/* ── SECCION QR (HU2) ── */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Codigo QR (HU2)</Text>

            {/* Si hay QR activo para ESTA clase */}
            {qrDeEstaClase ? (
              <View style={styles.qrActivo}>
                <Text style={[styles.qrContador, { color: colorContador }]}>{segundosQR}s</Text>
                <Text style={styles.qrEtiqueta}>Expira en — el QR sigue activo aunque salgas de esta pantalla</Text>

                {/* Imagen QR — decorativa, para escaner local */}
                <View style={styles.qrImagenContenedor}>
                  <QRCode
                    value={qrDeEstaClase}
                    size={180}
                    color="#ffffff"
                    backgroundColor="#1a1a2e"
                  />
                </View>

                <Text style={styles.qrNota}>
                  Si la camara no lee el QR, usa el codigo de texto:
                </Text>

                {/* Texto QR siempre visible */}
                <View style={styles.qrCodigo}>
                  <Text style={styles.qrCodigoTexto} selectable>{qrDeEstaClase}</Text>
                </View>

                <TouchableOpacity style={styles.botonVerde} onPress={handleCopiarQR}>
                  <Text style={styles.botonVerdeTexto}>Copiar codigo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.botonSecundario, { marginTop: 8 }]} onPress={() => onGenerarQR(claseActualizada.id)}>
                  <Text style={styles.botonSecundarioTexto}>Generar nuevo QR</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Si hay QR activo pero de OTRA clase */
              codigoQR ? (
                <View style={styles.qrOtraClase}>
                  <Text style={styles.qrOtraClaseTexto}>
                    Hay un QR activo para otra clase ({segundosQR}s restantes).
                  </Text>
                  <TouchableOpacity style={styles.botonVerde} onPress={() => onGenerarQR(claseActualizada.id)}>
                    <Text style={styles.botonVerdeTexto}>Generar QR para esta clase</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.botonGenerarQR} onPress={() => onGenerarQR(claseActualizada.id)}>
                  <Text style={styles.botonGenerarQRTexto}>Generar QR</Text>
                  <Text style={styles.botonGenerarQRSub}>Valido por 60 segundos — persiste aunque navegues</Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Asistencia del dia */}
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

          {/* Registro manual (HU9) */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Registro manual (HU9)</Text>
            <Text style={styles.ayuda}>Para estudiantes sin celular disponible.</Text>
            <TextInput
              style={styles.input}
              placeholder="ID del estudiante"
              placeholderTextColor="#718096"
              value={estudianteManualId}
              onChangeText={setEstudianteManualId}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.botonVerde} onPress={handleRegistroManual}>
              <Text style={styles.botonVerdeTexto}>Registrar manualmente</Text>
            </TouchableOpacity>
          </View>

          {/* Acciones */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Acciones</Text>
            <TouchableOpacity style={styles.botonAccion} onPress={() => setVista('tablaAsistencia')}>
              <Text style={styles.botonAccionTexto}>Ver % de asistencia y exportar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botonAccion, { marginTop: 8 }]} onPress={() => setVista('nuevoEstudiante')}>
              <Text style={styles.botonAccionTexto}>Agregar estudiante</Text>
            </TouchableOpacity>
          </View>

          {/* Estudiantes */}
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
          </View>

        </ScrollView>
      </View>
    );
  }

  // ── NUEVA CLASE ────────────────────────────────────────────
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
          <TextInput style={styles.input} placeholder="Ej: Matematicas Lunes" placeholderTextColor="#718096" value={formNombre} onChangeText={setFormNombre} />
          <TimePicker label="Hora de inicio" valor={formHoraInicio} onChange={setFormHoraInicio} />
          <TimePicker label="Hora de fin"    valor={formHoraFin}    onChange={setFormHoraFin} />
          <TouchableOpacity style={styles.botonVerde} onPress={handleCrearClase}>
            <Text style={styles.botonVerdeTexto}>Guardar Clase</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── AGREGAR ESTUDIANTE ─────────────────────────────────────
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
          <Text style={styles.ayuda}>El estudiante usara este ID y celular para registrar asistencia.</Text>
          <Text style={styles.etiqueta}>ID del estudiante</Text>
          <TextInput style={styles.input} placeholder="Ej: EST001" placeholderTextColor="#718096" value={estId} onChangeText={setEstId} autoCapitalize="characters" />
          <Text style={styles.etiqueta}>Nombre completo</Text>
          <TextInput style={styles.input} placeholder="Ej: Ana Garcia" placeholderTextColor="#718096" value={estNombre} onChangeText={setEstNombre} />
          <Text style={styles.etiqueta}>Numero de celular</Text>
          <TextInput style={styles.input} placeholder="Ej: 3001234567" placeholderTextColor="#718096" value={estCelular} onChangeText={setEstCelular} keyboardType="phone-pad" maxLength={10} />
          <TouchableOpacity style={styles.botonVerde} onPress={handleAgregarEstudiante}>
            <Text style={styles.botonVerdeTexto}>Agregar a la clase</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── LOGS (HU12) ────────────────────────────────────────────
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

  // ── INICIO (lista de clases) ───────────────────────────────
  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={onVolver} style={styles.botonVolver}>
          <Text style={styles.botonVolverTexto}>Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Panel Profesor</Text>
      </View>
      <ScrollView style={styles.cuerpo}>
        {/* Aviso si hay QR activo */}
        {codigoQR && (
          <View style={styles.qrActivoBanner}>
            <Text style={styles.qrActivoBannerTexto}>
              QR activo para {clases.find(c => c.id === claseQRId)?.nombre ?? 'una clase'} — {segundosQR}s restantes
            </Text>
          </View>
        )}
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
                style={[styles.itemClase, claseQRId === clase.id && codigoQR && styles.itemClaseConQR]}
                onPress={() => { setClaseActiva(clase); setVista('detalleClase'); }}
              >
                <Text style={styles.itemClaseNombre}>{clase.nombre}</Text>
                <Text style={styles.itemClaseHora}>{clase.horaInicio} - {clase.horaFin}  ·  {clase.fecha}</Text>
                <Text style={styles.itemClaseContador}>
                  {clase.estudianteIds.length} estudiantes  ·  {registros.filter((r) => r.claseId === clase.id).length} registros hoy
                  {claseQRId === clase.id && codigoQR ? `  ·  QR activo ${segundosQR}s` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.botonVerde} onPress={() => setVista('nuevaClase')}>
          <Text style={styles.botonVerdeTexto}>Nueva Clase</Text>
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
  ayuda: { fontSize: 12, color: '#718096', marginBottom: 12, lineHeight: 18 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyStateTexto: { fontSize: 16, color: '#a0aec0', fontWeight: '600', marginBottom: 8 },
  emptyStateSub: { fontSize: 13, color: '#4a5568' },
  // QR
  qrActivo: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#2d3748', marginBottom: 8 },
  qrContador: { fontSize: 48, fontWeight: 'bold', letterSpacing: 2 },
  qrEtiqueta: { fontSize: 11, color: '#718096', marginBottom: 16, textAlign: 'center' },
  qrImagenContenedor: { backgroundColor: '#1a1a2e', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#2d3748' },
  qrNota: { fontSize: 12, color: '#718096', marginBottom: 8, textAlign: 'center' },
  qrCodigo: { backgroundColor: '#2d3748', borderRadius: 8, padding: 12, width: '100%', marginBottom: 12 },
  qrCodigoTexto: { color: '#e2e8f0', fontSize: 11, fontFamily: 'monospace' },
  qrOtraClase: { backgroundColor: '#2d2000', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#f6ad55', marginBottom: 8 },
  qrOtraClaseTexto: { color: '#f6ad55', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  qrActivoBanner: { backgroundColor: '#1a365d', borderRadius: 8, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#4299e1' },
  qrActivoBannerTexto: { color: '#90cdf4', fontSize: 13 },
  botonGenerarQR: { backgroundColor: '#2d3748', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#4a5568', marginBottom: 8 },
  botonGenerarQRTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 17, marginBottom: 4 },
  botonGenerarQRSub: { color: '#718096', fontSize: 12, textAlign: 'center' },
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
  // Tabla
  tablaEncabezado: { flexDirection: 'row', backgroundColor: '#2d3748', borderRadius: 8, padding: 10, marginBottom: 4 },
  tablaFila: { flexDirection: 'row', backgroundColor: '#1a1a2e', borderRadius: 8, padding: 10, marginBottom: 4, borderWidth: 1, borderColor: '#2d3748', alignItems: 'center' },
  tablaCelda: { flex: 1, fontSize: 13 },
  tablaCeldaAncha: { flex: 2 },
  tablaTextoNombre: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  tablaTextoId: { color: '#718096', fontSize: 11 },
  tablaPorcentaje: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  porcentajeBueno: { color: '#68d391' },
  porcentajeMalo: { color: '#fc8181' },
  botonExportar: { backgroundColor: '#2c5282', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 20, marginBottom: 8 },
  botonExportarTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  notaExportar: { color: '#4a5568', fontSize: 11, textAlign: 'center', marginBottom: 20 },
  // Botones generales
  botonVerde: { backgroundColor: '#2d6a4f', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 8 },
  botonVerdeTexto: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  botonSecundario: { borderWidth: 1, borderColor: '#4a5568', borderRadius: 10, padding: 14, alignItems: 'center' },
  botonSecundarioTexto: { color: '#a0aec0', fontSize: 14 },
  botonAccion: { backgroundColor: '#1a365d', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#4299e1' },
  botonAccionTexto: { color: '#90cdf4', fontWeight: '600', fontSize: 14 },
  botonDesactivado: { backgroundColor: '#374151' },
  // Formularios
  etiqueta: { fontSize: 13, color: '#a0aec0', marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: '#2d3748', borderRadius: 8, padding: 12, color: '#ffffff', fontSize: 15, borderWidth: 1, borderColor: '#4a5568', marginBottom: 12 },
  // Lista clases
  itemClase: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2d3748' },
  itemClaseConQR: { borderColor: '#4299e1', backgroundColor: '#1a2a3d' },
  itemClaseNombre: { fontSize: 15, fontWeight: '600', color: '#ffffff', marginBottom: 4 },
  itemClaseHora: { fontSize: 12, color: '#a0aec0', marginBottom: 2 },
  itemClaseContador: { fontSize: 12, color: '#63b3ed' },
});