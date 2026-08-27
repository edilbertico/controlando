import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context';
import { useTheme } from '../useTheme';
import { Card, Label, Pill } from '../components/ui';
import { bpOf, gluOf, classifyBP, classifyGlu, fmtDateTime } from '../calc';

export default function Historial() {
  const { activeUser: u, deleteReading } = useApp();
  const theme = useTheme();
  const [f, setF] = useState<'all' | 'bp' | 'glu'>('all');
  if (!u) return null;
  const all = u.readings;
  const list = f === 'all' ? all : all.filter((r) => r.type === f);

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <View style={styles.filters}>
        {(['all', 'bp', 'glu'] as const).map((k) => (
          <TouchableOpacity key={k} style={[styles.chip, f === k && styles.chipOn, { borderColor: theme.line }]} onPress={() => setF(k)}>
            <Text style={[styles.chipT, f === k ? styles.chipOnT : { color: theme.muted }]}>{k === 'all' ? 'Todos' : k === 'bp' ? '🫀 Tensión' : '💧 Glucosa'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {list.length === 0 && <Text style={[styles.empty, { color: theme.muted }]}>Sin mediciones todavía.</Text>}
      {list.map((r) => {
        const isBp = r.type === 'bp';
        const [t, c] = isBp ? classifyBP(r.s!, r.d!) : classifyGlu(r.g!, r.ctx);
        return (
          <Card key={r.id} theme={theme}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.date, { color: theme.text }]}>{fmtDateTime(r.date)}</Text>
                <Text style={[styles.val, { color: theme.text }]}>
                  {isBp ? `🫀 ${r.s}/${r.d} mmHg · ${r.p ?? '—'} lpm` : `💧 ${r.g} mg/dL`} · {Array.isArray(r.ctx) ? r.ctx.join(' · ') : r.ctx} · {r.m}
                </Text>
                {r.notes ? <Text style={[styles.note, { color: theme.muted }]}>{r.notes}</Text> : null}
              </View>
              <View>
                <Pill text={t} cls={c} theme={theme} hc={false} />
                <TouchableOpacity onPress={() => deleteReading(r.id)}>
                  <Text style={[styles.del, { color: theme.red }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  pad: { padding: 16 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: '#14315c' },
  chipT: { fontWeight: '800', fontSize: 12.5 },
  chipOnT: { color: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  date: { fontWeight: '700' },
  val: { marginTop: 2 },
  note: { fontSize: 12, marginTop: 4 },
  del: { marginTop: 8, fontWeight: '800', textAlign: 'right' },
  empty: { textAlign: 'center', marginTop: 40 },
});
