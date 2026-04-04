// components/TimePicker.js
// Selector de hora con botones + / - Y edicion directa por teclado.
// Toca el numero para editarlo directamente, o usa las flechas.

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';

const MINUTOS_VALIDOS = ['00', '15', '30', '45'];

export default function TimePicker({ valor, onChange, label }) {
  const partes = valor ? valor.split(':') : ['08', '00'];
  const hh = parseInt(partes[0] || '8', 10);
  const mm = partes[1] || '00';

  // Controla si el campo de hora o minutos esta en modo edicion
  const [editandoHora, setEditandoHora] = useState(false);
  const [editandoMin,  setEditandoMin]  = useState(false);
  const [textoHora, setTextoHora] = useState('');
  const [textoMin,  setTextoMin]  = useState('');

  const hhStr = hh.toString().padStart(2, '0');

  // ── Botones de hora ───────────────────────────────────────
  const subirHora  = () => onChange(`${((hh + 1) % 24).toString().padStart(2, '0')}:${mm}`);
  const bajarHora  = () => onChange(`${((hh - 1 + 24) % 24).toString().padStart(2, '0')}:${mm}`);

  // ── Botones de minutos (ciclo entre 00/15/30/45) ──────────
  const subirMin = () => {
    const idx = MINUTOS_VALIDOS.indexOf(mm);
    onChange(`${hhStr}:${MINUTOS_VALIDOS[(idx + 1) % MINUTOS_VALIDOS.length]}`);
  };
  const bajarMin = () => {
    const idx = MINUTOS_VALIDOS.indexOf(mm);
    onChange(`${hhStr}:${MINUTOS_VALIDOS[(idx - 1 + MINUTOS_VALIDOS.length) % MINUTOS_VALIDOS.length]}`);
  };

  // ── Confirmar edicion de hora ─────────────────────────────
  const confirmarHora = () => {
    setEditandoHora(false);
    const num = parseInt(textoHora, 10);
    if (!isNaN(num) && num >= 0 && num <= 23) {
      onChange(`${num.toString().padStart(2, '0')}:${mm}`);
    }
    setTextoHora('');
  };

  // ── Confirmar edicion de minutos ──────────────────────────
  const confirmarMin = () => {
    setEditandoMin(false);
    const num = parseInt(textoMin, 10);
    // Redondear al bloque de 15 min mas cercano
    let minFinal = '00';
    if (!isNaN(num)) {
      if (num < 8)       minFinal = '00';
      else if (num < 23) minFinal = '15';
      else if (num < 38) minFinal = '30';
      else if (num < 53) minFinal = '45';
      else               minFinal = '00';
    }
    onChange(`${hhStr}:${minFinal}`);
    setTextoMin('');
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.label}>{label}</Text>

      {/* Resumen grande */}
      <Text style={styles.resumen}>{hhStr}:{mm}</Text>

      <View style={styles.fila}>

        {/* ── Columna HORA ── */}
        <View style={styles.columna}>
          <Text style={styles.columnaLabel}>Hora</Text>

          <TouchableOpacity style={styles.flecha} onPress={subirHora}>
            <Text style={styles.flechaTexto}>▲</Text>
          </TouchableOpacity>

          {/* Toca el numero para escribir directamente */}
          {editandoHora ? (
            <TextInput
              style={styles.inputDirecto}
              value={textoHora}
              onChangeText={setTextoHora}
              keyboardType="number-pad"
              maxLength={2}
              autoFocus
              onBlur={confirmarHora}
              onSubmitEditing={confirmarHora}
              placeholder="0-23"
              placeholderTextColor="#4a5568"
              selectTextOnFocus
            />
          ) : (
            <TouchableOpacity
              style={styles.valorCaja}
              onPress={() => { setEditandoHora(true); setTextoHora(hhStr); }}
            >
              <Text style={styles.valorTexto}>{hhStr}</Text>
              <Text style={styles.editarHint}>toca</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.flecha} onPress={bajarHora}>
            <Text style={styles.flechaTexto}>▼</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.separador}>:</Text>

        {/* ── Columna MINUTOS ── */}
        <View style={styles.columna}>
          <Text style={styles.columnaLabel}>Min</Text>

          <TouchableOpacity style={styles.flecha} onPress={subirMin}>
            <Text style={styles.flechaTexto}>▲</Text>
          </TouchableOpacity>

          {editandoMin ? (
            <TextInput
              style={styles.inputDirecto}
              value={textoMin}
              onChangeText={setTextoMin}
              keyboardType="number-pad"
              maxLength={2}
              autoFocus
              onBlur={confirmarMin}
              onSubmitEditing={confirmarMin}
              placeholder="0-59"
              placeholderTextColor="#4a5568"
              selectTextOnFocus
            />
          ) : (
            <TouchableOpacity
              style={styles.valorCaja}
              onPress={() => { setEditandoMin(true); setTextoMin(mm); }}
            >
              <Text style={styles.valorTexto}>{mm}</Text>
              <Text style={styles.editarHint}>toca</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.flecha} onPress={bajarMin}>
            <Text style={styles.flechaTexto}>▼</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    marginBottom: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  label: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resumen: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4299e1',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 4,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  columna: {
    alignItems: 'center',
    width: 100,
  },
  columnaLabel: {
    fontSize: 11,
    color: '#4a5568',
    marginBottom: 6,
  },
  flecha: {
    backgroundColor: '#2d3748',
    borderRadius: 8,
    width: 60,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  flechaTexto: {
    color: '#4299e1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  valorCaja: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    width: 60,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4299e1',
  },
  valorTexto: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  editarHint: {
    color: '#4a5568',
    fontSize: 9,
    marginTop: 1,
  },
  inputDirecto: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    width: 60,
    height: 56,
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#63b3ed',
  },
  separador: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
    marginHorizontal: 12,
    marginTop: 18,
  },
});