import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { useApp } from '../context';
import { useTheme } from '../useTheme';
import { Card, Label, PrimaryButton, GhostButton, DangerButton } from '../components/ui';
import { lowStockMeds } from '../lib/notifications';

export default function MedScreen() {
  const { activeUser: u, saveMed, deleteMed, takeMed } = useApp();
  const theme = useTheme();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [presentation, setPresentation] = useState('Tabletas');
  const [dose, setDose] = useState('');
  const [schedule, setSchedule] = useState('08:00,20:00');
  const [inventory, setInventory] = useState('30');
  const [threshold, setThreshold] = useState('5');

  const openNew = () => { setEditing(null); setName(''); setPresentation('Tabletas'); setDose(''); setSchedule('08:00,20:00'); setInventory('30'); setThreshold('5'); setModal(true); };
  const openEdit = (m: any) => { setEditing(m.id); setName(m.name); setPresentation(m.presentation); setDose(m.dose); setSchedule(m.schedule.join(',')); setInventory(String(m.inventory)); setThreshold(String(m.threshold)); setModal(true); };
  const save = () => {
    if (!name) return;
    saveMed({ name, presentation, dose, schedule: schedule.split(',').map((s) => s.trim()).filter(Boolean), inventory: Number(inventory) || 0, threshold: Number(threshold) || 0 }, editing);
    setModal(false);
  };
  if (!u) return null;
  const low = lowStockMeds(u);

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Label theme={theme}>Medicamentos</Label>
      {low.length > 0 && (
        <Card theme={theme} style={[styles.warn, { borderColor: theme.red } as any]}>
          <Text style={[styles.warnT, { color: theme.red }]}>⚠️ Stock bajo: {low.map((m) => `${m.name} (${m.inventory})`).join(', ')}</Text>
        </Card>
      )}
      {u.meds.map((m) => (
        <Card key={m.id} theme={theme}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.text }]}>{m.name}</Text>
              <Text style={[styles.meta, { color: theme.muted }]}>{m.dose} · {m.presentation} · {m.schedule.join(' · ')}</Text>
              <Text style={[styles.meta, { color: m.inventory <= m.threshold ? theme.red : theme.muted }]}>Inventario: {m.inventory} (mín. {m.threshold})</Text>
            </View>
            <View style={styles.colA}>
              <TouchableOpacity style={[styles.take, { backgroundColor: theme.green }]} onPress={() => takeMed(m.id, 1)}>
                <Text style={styles.takeT}>Tomar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openEdit(m)}>
                <Text style={[styles.act, { color: theme.blue2 }]}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteMed(m.id)}>
                <Text style={[styles.act, { color: theme.red }]}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      ))}
      <PrimaryButton title="＋ Añadir medicamento" onPress={openNew} theme={theme} />

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={[styles.back, { backgroundColor: '#14315c55' }]}>
          <View style={[styles.sheet, { backgroundColor: theme.panel }]}>
            <Text style={[styles.title, { color: theme.text }]}>{editing ? 'Editar medicamento' : 'Añadir medicamento'}</Text>
            <Text style={[styles.lab, { color: theme.muted }]}>Nombre</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={name} onChangeText={setName} />
            <Text style={[styles.lab, { color: theme.muted }]}>Presentación</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={presentation} onChangeText={setPresentation} />
            <Text style={[styles.lab, { color: theme.muted }]}>Dosis</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={dose} onChangeText={setDose} />
            <Text style={[styles.lab, { color: theme.muted }]}>Horarios (HH:MM separados por coma)</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={schedule} onChangeText={setSchedule} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lab, { color: theme.muted }]}>Inventario actual</Text>
                <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={inventory} onChangeText={setInventory} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lab, { color: theme.muted }]}>Umbral mínimo</Text>
                <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={threshold} onChangeText={setThreshold} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.actions}>
              <GhostButton title="Cancelar" onPress={() => setModal(false)} theme={theme} small />
              <PrimaryButton title="Guardar" onPress={save} theme={theme} small />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  colA: { alignItems: 'flex-end', gap: 8 },
  name: { fontFamily: 'Sora', fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  act: { fontWeight: '800', marginLeft: 8 },
  take: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  takeT: { color: '#fff', fontWeight: '800' },
  warn: { borderWidth: 1 },
  warnT: { fontWeight: '800' },
  back: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  title: { fontFamily: 'Sora', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  lab: { fontSize: 12, fontWeight: '800', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 10, backgroundColor: '#f8fbfe' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
});
