import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context';
import { useTheme } from '../useTheme';
import { PrimaryButton, GhostButton } from './ui';

export const ReadingModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { saveReading } = useApp();
  const theme = useTheme();
  const [type, setType] = useState<'bp' | 'glu'>('bp');
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [pulse, setPulse] = useState('');
  const [glu, setGlu] = useState('');
  const [moment, setMoment] = useState('Mañana');
  const [notes, setNotes] = useState('');

  const reset = () => {
    setSys('');
    setDia('');
    setPulse('');
    setGlu('');
    setNotes('');
  };

  const save = () => {
    if (type === 'bp') {
      const s = Number(sys);
      const d = Number(dia);
      if (!s || !d || s < 50 || s > 300 || d < 30 || d > 200) return;
      saveReading({ type: 'bp', s, d, p: pulse ? Number(pulse) : null, m: moment, ctx: ['Reposo'], notes });
    } else {
      const g = Number(glu);
      if (!g || g < 20 || g > 600) return;
      saveReading({ type: 'glu', g, m: moment, ctx: 'En ayunas', notes });
    }
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.back, { backgroundColor: '#14315c55' }]}>
        <View style={[styles.sheet, { backgroundColor: theme.panel }]}>
          <Text style={[styles.title, { color: theme.text }]}>Nueva medicion</Text>
          <View style={styles.seg}>
            <TouchableOpacity style={[styles.segBtn, type === 'bp' && styles.segOn]} onPress={() => setType('bp')}>
              <Text style={type === 'bp' ? styles.segOnT : styles.segT}>Tension</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.segBtn, type === 'glu' && styles.segOn]} onPress={() => setType('glu')}>
              <Text style={type === 'glu' ? styles.segOnT : styles.segT}>Glucosa</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {type === 'bp' ? (
              <View style={styles.row}>
                <Field label="Sistolica" value={sys} set={setSys} theme={theme} />
                <Field label="Diastolica" value={dia} set={setDia} theme={theme} />
                <Field label="Pulso (opc)" value={pulse} set={setPulse} theme={theme} />
              </View>
            ) : (
              <View style={styles.row}>
                <Field label="Glucosa mg/dL" value={glu} set={setGlu} theme={theme} />
                <Field label="Momento" value={moment} set={setMoment} theme={theme} />
              </View>
            )}
            <Text style={[styles.lab, { color: theme.muted }]}>Observaciones</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={notes} onChangeText={setNotes} placeholder="Como te sentias" placeholderTextColor={theme.muted} />
          </ScrollView>
          <View style={styles.actions}>
            <GhostButton title="Cancelar" onPress={onClose} theme={theme} small />
            <PrimaryButton title="Guardar" onPress={save} theme={theme} small />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const Field = ({ label, value, set, theme }: { label: string; value: string; set: (v: string) => void; theme: any }) => (
  <View style={{ flex: 1 }}>
    <Text style={[styles.lab, { color: theme.muted }]}>{label}</Text>
    <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={value} onChangeText={set} keyboardType="numeric" placeholder="-" placeholderTextColor={theme.muted} />
  </View>
);

const styles = StyleSheet.create({
  back: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  title: { fontFamily: 'Sora', fontSize: 20, fontWeight: '800', marginBottom: 14 },
  seg: { flexDirection: 'row', backgroundColor: 'rgba(20,49,92,.06)', borderRadius: 14, padding: 4, marginBottom: 14 },
  segBtn: { flex: 1, padding: 10, borderRadius: 11, alignItems: 'center' },
  segOn: { backgroundColor: '#14315c' },
  segT: { fontWeight: '800', color: '#5b7290' },
  segOnT: { fontWeight: '800', color: '#fff' },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  lab: { fontSize: 12, fontWeight: '800', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 10, backgroundColor: '#f8fbfe' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
});
