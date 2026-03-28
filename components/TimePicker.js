// components/TimePicker.js
// Selector de hora tipo rueda deslizable.

import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const ITEM_HEIGHT = 48;
const HORAS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTOS = ['00', '15', '30', '45'];

export default function TimePicker({ valor, onChange, label }) {
  const partes = valor ? valor.split(':') : ['08', '00'];
  const hh = partes[0] || '08';
  const mm = partes[1] || '00';
  const horaRef = useRef(null);
  const minRef = useRef(null);

  useEffect(() => {
    const horaIdx = HORAS.indexOf(hh);
    const minIdx = MINUTOS.indexOf(mm);
    setTimeout(() => {
      if (horaRef.current && horaIdx >= 0)
        horaRef.current.scrollTo({ y: horaIdx * ITEM_HEIGHT, animated: false });
      if (minRef.current && minIdx >= 0)
        minRef.current.scrollTo({ y: minIdx * ITEM_HEIGHT, animated: false });
    }, 100);
  }, []);

  const onScrollHora = (e) => {
    const idx = Math.min(Math.max(Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT), 0), HORAS.length - 1);
    onChange(`${HORAS[idx]}:${mm}`);
  };

  const onScrollMin = (e) => {
    const idx = Math.min(Math.max(Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT), 0), MINUTOS.length - 1);
    onChange(`${hh}:${MINUTOS[idx]}`);
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valorActual}>{hh}:{mm}</Text>
      <View style={styles.rueda}>
        <View style={styles.indicador} pointerEvents="none" />
        <View style={styles.columna}>
          <Text style={styles.columnaLabel}>Hora</Text>
          <ScrollView ref={horaRef} style={styles.scroll} snapToInterval={ITEM_HEIGHT} decelerationRate="fast" showsVerticalScrollIndicator={false} onMomentumScrollEnd={onScrollHora}>
            <View style={{ height: ITEM_HEIGHT }} />
            {HORAS.map((h) => (
              <View key={h} style={styles.item}>
                <Text style={[styles.itemTexto, hh === h && styles.itemActivo]}>{h}</Text>
              </View>
            ))}
            <View style={{ height: ITEM_HEIGHT }} />
          </ScrollView>
        </View>
        <Text style={styles.separador}>:</Text>
        <View style={styles.columna}>
          <Text style={styles.columnaLabel}>Min</Text>
          <ScrollView ref={minRef} style={styles.scroll} snapToInterval={ITEM_HEIGHT} decelerationRate="fast" showsVerticalScrollIndicator={false} onMomentumScrollEnd={onScrollMin}>
            <View style={{ height: ITEM_HEIGHT }} />
            {MINUTOS.map((m) => (
              <View key={m} style={styles.item}>
                <Text style={[styles.itemTexto, mm === m && styles.itemActivo]}>{m}</Text>
              </View>
            ))}
            <View style={{ height: ITEM_HEIGHT }} />
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: 20 },
  label: { fontSize: 12, color: '#718096', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  valorActual: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 10, letterSpacing: 4 },
  rueda: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f1a', borderRadius: 12, padding: 8, height: ITEM_HEIGHT * 3, overflow: 'hidden', borderWidth: 1, borderColor: '#2d3748' },
  indicador: { position: 'absolute', top: ITEM_HEIGHT, left: 8, right: 8, height: ITEM_HEIGHT, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#4299e1', borderRadius: 6 },
  columna: { alignItems: 'center', width: 80 },
  columnaLabel: { fontSize: 10, color: '#4a5568', marginBottom: 2 },
  scroll: { height: ITEM_HEIGHT * 3 },
  item: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  itemTexto: { fontSize: 20, color: '#4a5568' },
  itemActivo: { fontSize: 28, color: '#ffffff', fontWeight: 'bold' },
  separador: { fontSize: 28, color: '#ffffff', fontWeight: 'bold', marginHorizontal: 8, marginTop: -10 },
});