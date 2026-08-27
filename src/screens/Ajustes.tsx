import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { useApp } from '../context';
import { useTheme } from '../useTheme';
import { Card, Label, PrimaryButton, GhostButton, DangerButton } from '../components/ui';
import { settingsOf, bpOf, gluOf } from '../calc';
import * as Linking from 'expo-linking';

export default function Ajustes() {
  const { activeUser: u, state, saveSettings, toggleHC, deleteReading } = useApp();
  const theme = useTheme();
  const [sys, setSys] = useState('130');
  const [dia, setDia] = useState('80');
  const [glu, setGlu] = useState('100');

  useEffect(() => {
    if (u) {
      const s = settingsOf(u);
      setSys(String(s.sys));
      setDia(String(s.dia));
      setGlu(String(s.glu));
    }
  }, [u]);

  if (!u) return null;

  const save = () => saveSettings({ sys: Number(sys) || 130, dia: Number(dia) || 80, glu: Number(glu) || 100 });

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Card theme={theme}>
        <Label theme={theme}>🎯 Metas de seguimiento</Label>
        <View style={styles.row3}>
          <Field label="Sistólica" value={sys} set={setSys} theme={theme} />
          <Field label="Diastólica" value={dia} set={setDia} theme={theme} />
          <Field label="Glucosa" value={glu} set={setGlu} theme={theme} />
        </View>
        <PrimaryButton title="💾 Guardar metas" onPress={save} theme={theme} />
      </Card>

      <Card theme={theme}>
        <View style={styles.row}>
          <Text style={[styles.t, { color: theme.text }]}>🌗 Modo alto contraste</Text>
          <Switch value={state.highContrast} onValueChange={toggleHC} thumbColor={theme.blue2} />
        </View>
        <Text style={[styles.meta, { color: theme.muted }]}>Mejora la visibilidad en situaciones de crisis o para usuarios mayores.</Text>
      </Card>

      <Card theme={theme}>
        <Label theme={theme}>📞 Llamada de emergencia</Label>
        <TouchableOpacity style={[styles.sos, { backgroundColor: theme.red }]} onPress={() => Linking.openURL('tel:123')}>
          <Text style={styles.sosText}>📞 Marcar 123 ahora</Text>
        </TouchableOpacity>
      </Card>

      <Card theme={theme}>
        <Label theme={theme}>🆘 Botón SOS</Label>
        <Text style={[styles.meta, { color: theme.muted }]}>Envía tu último registro clínico y tu ubicación por WhatsApp o SMS a tus contactos de emergencia. Configúralos en la pestaña Contactos.</Text>
      </Card>

      <Card theme={theme}>
        <Label theme={theme}>⚠️ Zona de riesgo</Label>
        <View style={styles.row}>
          <DangerButton title="Borrar mis mediciones" onPress={() => { if (u.readings.length) u.readings.forEach((r) => deleteReading(r.id)); }} small />
        </View>
      </Card>
    </ScrollView>
  );
}

const Field = ({ label, value, set, theme }: any) => (
  <View style={{ flex: 1 }}>
    <Text style={[styles.lab, { color: theme.muted }]}>{label}</Text>
    <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={value} onChangeText={set} keyboardType="numeric" />
  </View>
);

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40 },
  row3: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  t: { fontFamily: 'Sora', fontSize: 15, fontWeight: '700' },
  lab: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 10, backgroundColor: '#f8fbfe' },
  meta: { fontSize: 12, marginTop: 6 },
  sos: { marginTop: 10, borderRadius: 14, padding: 14, alignItems: 'center' },
  sosText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
