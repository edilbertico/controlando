import React, { useState, useRef } from 'react';
import { Platform } from 'react-native';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useApp } from '../context';
import { useTheme } from '../useTheme';
import { Card, Label, PrimaryButton, GhostButton } from '../components/ui';
import { bpOf, gluOf, settingsOf, avg, stdDev, classifyBP, classifyGlu, buildReportText, buildReportHtml, fmtDateTime, fmtDate } from '../calc';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';

export default function Analisis() {
  const { activeUser: u } = useApp();
  const theme = useTheme();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  if (!u) return null;
  const st = settingsOf(u);
  const ta = bpOf(u);
  const gl = gluOf(u);
  const range = {
    f: from ? new Date(from + 'T00:00:00') : null,
    t: to ? new Date(to + 'T23:59:59.999') : null,
  };
  const report = buildReportText(u, range ? { f: range.f, t: range.t } : undefined);
  const chartW = Dimensions.get('window').width - 64;
  const taChart = ta.slice(0, 14).reverse();
  const glChart = gl.slice(0, 14).reverse();
  const taRef = useRef<any>(null);
  const glRef = useRef<any>(null);

  const moms = ['Mañana', 'Tarde', 'Noche'];
  const taByMoment = {
    labels: moms,
    datasets: [
      { data: moms.map((m) => avg(ta.filter((r) => r.m === m), (r) => r.s!) ?? 0), color: () => theme.blue2, strokeWidth: 2 },
      { data: moms.map((m) => avg(ta.filter((r) => r.m === m), (r) => r.d!) ?? 0), color: () => theme.sky, strokeWidth: 2 },
    ],
  };
  const ctxs = ['En ayunas', 'Antes de comer', 'Después de comer', 'Antes de dormir'];
  const gluByCtx = {
    labels: ctxs,
    datasets: [{ data: ctxs.map((c) => avg(gl.filter((r) => r.ctx === c), (r) => r.g!) ?? 0), color: () => theme.yellow2, strokeWidth: 2 }],
  };

  const share = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Disponible en la app móvil', 'La exportación de informes funciona en Android/iOS.');
      return;
    }
    try {
      const uri = FileSystem.documentDirectory + 'informe.txt';
      await FileSystem.writeAsStringAsync(uri, report, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(uri, { mimeType: 'text/plain', dialogTitle: 'Compartir informe' });
    } catch (e) {
      Alert.alert('No se pudo compartir', String(e));
    }
  };

  const exportPdf = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Disponible en la app móvil', 'El PDF se genera en Android/iOS.');
      return;
    }
    try {
      let chartsHtml = '';
      try {
        if (taRef.current) {
          const img = await taRef.current.capture();
          if (img) chartsHtml += `<img src="data:image/png;base64,${img}" style="width:100%;max-width:520px;margin:10px 0"/>`;
        }
        if (glRef.current) {
          const img = await glRef.current.capture();
          if (img) chartsHtml += `<img src="data:image/png;base64,${img}" style="width:100%;max-width:520px;margin:10px 0"/>`;
        }
      } catch {
        chartsHtml = '';
      }
      const html = buildReportHtml(u, { f: range.f, t: range.t }) + chartsHtml;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Descargar PDF' });
    } catch (e) {
      Alert.alert('No se pudo generar el PDF', String(e));
    }
  };

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <View style={styles.two}>
        <Card theme={theme} style={styles.col}>
          <Label theme={theme}>Promedio TA</Label>
          <Text style={[styles.mid, { color: theme.text }]}>{ta.length ? `${avg(ta, (r) => r.s!)}/${avg(ta, (r) => r.d!)}` : '—'}</Text>
        </Card>
        <Card theme={theme} style={styles.col}>
          <Label theme={theme}>Promedio glucosa</Label>
          <Text style={[styles.mid, { color: theme.text }]}>{gl.length ? avg(gl, (r) => r.g!) : '—'}</Text>
        </Card>
      </View>

      <Card theme={theme}>
        <Label theme={theme}>Variabilidad</Label>
        <Text style={[styles.ins, { color: theme.text }]}>
          Sistólica ± {stdDev(ta.map((r) => r.s!))?.toFixed(0) ?? '—'} mmHg · Diastólica ± {stdDev(ta.map((r) => r.d!))?.toFixed(0) ?? '—'} mmHg · Glucosa ± {stdDev(gl.map((r) => r.g!))?.toFixed(0) ?? '—'} mg/dL
        </Text>
      </Card>

      {taChart.length > 0 && (
        <Card theme={theme}>
          <Label theme={theme}>📈 Evolución de tensión</Label>
          <LineChart
            ref={taRef}
            data={{ labels: taChart.map((r) => fmtDate(r.date)), datasets: [{ data: taChart.map((r) => r.s!), color: () => theme.blue2, strokeWidth: 2 }, { data: taChart.map((r) => r.d!), color: () => theme.sky, strokeWidth: 2 }] }}
            width={chartW}
            height={220}
            chartConfig={{ backgroundColor: theme.panel, backgroundGradientFrom: theme.panel, backgroundGradientTo: theme.panel, decimalPlaces: 0, color: () => theme.muted, labelColor: () => theme.muted, propsForDots: { r: '2', strokeWidth: '0' } }}
            style={{ borderRadius: 12, marginTop: 8 }}
            bezier
          />
        </Card>
      )}

      {glChart.length > 0 && (
        <Card theme={theme}>
          <Label theme={theme}>💧 Evolución de glucosa</Label>
          <LineChart
            ref={glRef}
            data={{ labels: glChart.map((r) => fmtDate(r.date)), datasets: [{ data: glChart.map((r) => r.g!), color: () => theme.yellow2, strokeWidth: 2 }] }}
            width={chartW}
            height={220}
            chartConfig={{ backgroundColor: theme.panel, backgroundGradientFrom: theme.panel, backgroundGradientTo: theme.panel, decimalPlaces: 0, color: () => theme.muted, labelColor: () => theme.muted, propsForDots: { r: '2', strokeWidth: '0' } }}
            style={{ borderRadius: 12, marginTop: 8 }}
            bezier
          />
        </Card>
      )}

      {ta.length > 0 && (
        <Card theme={theme}>
          <Label theme={theme}>🫀 Tensión según momento del día</Label>
          <BarChart
            data={taByMoment}
            width={chartW}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{ backgroundColor: theme.panel, backgroundGradientFrom: theme.panel, backgroundGradientTo: theme.panel, decimalPlaces: 0, color: () => theme.muted, labelColor: () => theme.muted }}
            style={{ borderRadius: 12, marginTop: 8 }}
          />
        </Card>
      )}

      {gl.length > 0 && (
        <Card theme={theme}>
          <Label theme={theme}>💧 Glucosa según contexto de la toma</Label>
          <BarChart
            data={gluByCtx}
            width={chartW}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{ backgroundColor: theme.panel, backgroundGradientFrom: theme.panel, backgroundGradientTo: theme.panel, decimalPlaces: 0, color: () => theme.muted, labelColor: () => theme.muted }}
            style={{ borderRadius: 12, marginTop: 8 }}
          />
        </Card>
      )}

      <Card theme={theme}>
        <Label theme={theme}>📄 Informe descriptivo</Label>
        <View style={styles.filters}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.lab, { color: theme.muted }]}>Desde (AAAA-MM-DD)</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={from} onChangeText={setFrom} placeholder="2025-01-01" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.lab, { color: theme.muted }]}>Hasta (AAAA-MM-DD)</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={to} onChangeText={setTo} placeholder="2025-12-31" />
          </View>
        </View>
        <Text style={[styles.report, { color: theme.text }]}>{report}</Text>
        <View style={styles.actions}>
          <PrimaryButton title="🖨 PDF" onPress={exportPdf} theme={theme} small />
          <GhostButton title="⬇ TXT" onPress={share} theme={theme} small />
          <GhostButton title="Todo el periodo" onPress={() => { setFrom(''); setTo(''); }} theme={theme} small />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  pad: { padding: 16 },
  two: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  mid: { fontFamily: 'Sora', fontSize: 26, fontWeight: '800' },
  ins: { fontSize: 13.5, lineHeight: 22, marginTop: 6 },
  filters: { flexDirection: 'row', gap: 10, marginTop: 10 },
  lab: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 10, backgroundColor: '#f8fbfe' },
  report: { fontSize: 13, lineHeight: 20, marginTop: 12, fontFamily: 'Sora' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'flex-end' },
});
