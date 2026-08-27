import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useApp } from '../context';
import { useTheme } from '../useTheme';
import { Card, Label, BigNum, Pill, PrimaryButton } from '../components/ui';
import { ReadingModal } from '../components/ReadingModal';
import { bpOf, gluOf, classifyBP, classifyGlu, settingsOf, pctInRange, streakDays, insightTA, insightGlu, fmtDateTime, fmtDate } from '../calc';
import * as Linking from 'expo-linking';

export default function Inicio() {
  const { activeUser: u, state } = useApp();
  const theme = useTheme();
  const [modal, setModal] = useState(false);
  if (!u) return null;
  const st = settingsOf(u);
  const ta = bpOf(u);
  const gl = gluOf(u);
  const lt = ta[0];
  const lg = gl[0];
  const [ltT, ltC] = lt ? classifyBP(lt.s!, lt.d!) : ['Sin datos', 'blue'];
  const [lgT, lgC] = lg ? classifyGlu(lg.g!, lg.ctx) : ['Sin datos', 'blue'];
  const pctTA = pctInRange(u, 'bp');
  const pctGlu = pctInRange(u, 'glu');
  const streak = streakDays(u);
  const taChart = bpOf(u).slice(0, 14).reverse();
  const chartW = Dimensions.get('window').width - 64;

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Card theme={theme}>
        <Label theme={theme}>Última tensión arterial</Label>
        <View style={styles.heroRow}>
          <View>
            <BigNum theme={theme}>{lt ? `${lt.s}/${lt.d}` : '—'}</BigNum>
            <Text style={[styles.unit, { color: theme.muted }]}>mmHg · {lt ? fmtDateTime(lt.date) : 'sin registros'}</Text>
          </View>
          <View>
            <Pill text={ltT} cls={ltC} theme={theme} hc={state.highContrast} />
            <Text style={[styles.unit, { color: theme.muted, marginTop: 6 }]}>Pulso: {lt?.p ?? '—'} lpm</Text>
          </View>
        </View>
      </Card>

      <View style={styles.two}>
        <Card theme={theme} style={styles.col}>
          <Label theme={theme}>Última glucosa</Label>
          <Text style={[styles.mid, { color: theme.text }]}>{lg ? `${lg.g}` : '—'}</Text>
          <Text style={[styles.unit, { color: theme.muted }]}>mg/dL · {lg ? fmtDateTime(lg.date) : 'sin registros'}</Text>
          <Pill text={lgT} cls={lgC} theme={theme} hc={state.highContrast} />
        </Card>
        <Card theme={theme} style={styles.col}>
          <Label theme={theme}>Racha de registro</Label>
          <Text style={[styles.mid, { color: theme.text }]}>🔥 {streak}</Text>
          <Text style={[styles.unit, { color: theme.muted }]}>días consecutivos</Text>
        </Card>
      </View>

      <View style={styles.two}>
        <Card theme={theme} style={styles.col}>
          <Label theme={theme}>TA en meta · 30 días</Label>
          <Text style={[styles.mid, { color: theme.text }]}>{pctTA == null ? '—' : pctTA + '%'}</Text>
        </Card>
        <Card theme={theme} style={styles.col}>
          <Label theme={theme}>Glucosa en rango · 30 días</Label>
          <Text style={[styles.mid, { color: theme.text }]}>{pctGlu == null ? '—' : pctGlu + '%'}</Text>
        </Card>
      </View>

      <Card theme={theme}>
        <Label theme={theme}>💡 Lectura rápida · tensión</Label>
        <Text style={[styles.ins, { color: theme.text }]}>{insightTA(u)}</Text>
      </Card>
      <Card theme={theme}>
        <Label theme={theme}>💧 Lectura rápida · glucosa</Label>
        <Text style={[styles.ins, { color: theme.text }]}>{insightGlu(u)}</Text>
      </Card>

      {taChart.length > 0 && (
        <Card theme={theme}>
          <Label theme={theme}>📈 Tendencia de tensión · últimas {taChart.length}</Label>
          <LineChart
            data={{ labels: taChart.map((r) => fmtDate(r.date)), datasets: [{ data: taChart.map((r) => r.s!), color: () => theme.blue2, strokeWidth: 2 }, { data: taChart.map((r) => r.d!), color: () => theme.sky, strokeWidth: 2 }] }}
            width={chartW}
            height={200}
            chartConfig={{ backgroundColor: theme.panel, backgroundGradientFrom: theme.panel, backgroundGradientTo: theme.panel, decimalPlaces: 0, color: () => theme.muted, labelColor: () => theme.muted, propsForDots: { r: '2', strokeWidth: '0' } }}
            style={{ borderRadius: 12, marginTop: 8 }}
            bezier
          />
        </Card>
      )}

      <PrimaryButton title="＋ Registrar medición" onPress={() => setModal(true)} theme={theme} />

      <TouchableOpacity style={[styles.sos, { backgroundColor: theme.red }]} onPress={() => Linking.openURL('tel:123')}>
        <Text style={styles.sosText}>📞 Llamar a emergencias (123)</Text>
      </TouchableOpacity>

      <ReadingModal visible={modal} onClose={() => setModal(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  unit: { fontSize: 12, marginTop: 4 },
  mid: { fontFamily: 'Sora', fontSize: 28, fontWeight: '800', marginTop: 4 },
  two: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  ins: { fontSize: 13.5, lineHeight: 22, marginTop: 6 },
  sos: { marginTop: 16, borderRadius: 16, padding: 16, alignItems: 'center' },
  sosText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
