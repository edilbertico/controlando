import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { useApp } from '../context';
import { useTheme } from '../useTheme';
import { Card, Label, PrimaryButton, GhostButton } from '../components/ui';
import { bpOf, gluOf, ageFromBirth } from '../calc';

export default function Perfil() {
  const { activeUser: u, state, switchUser, saveUser, deleteUser } = useApp();
  const theme = useTheme();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [birth, setBirth] = useState('');

  const openNew = () => {
    setEditing(null);
    setFirst('');
    setLast('');
    setBirth('');
    setModal(true);
  };
  const openEdit = (usr: any) => {
    setEditing(usr.id);
    setFirst(usr.first);
    setLast(usr.last);
    setBirth(usr.birth || '');
    setModal(true);
  };
  const save = () => {
    if (!first || !last) return;
    saveUser({ first, last, birth }, editing);
    setModal(false);
  };

  if (!u) return null;

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Card theme={theme} style={styles.profile}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>{u.first} {u.last}</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>{ageFromBirth(u.birth)} años</Text>
          <View style={styles.btns}>
            <PrimaryButton title="✏️ Editar" onPress={() => openEdit(u)} theme={theme} small />
          </View>
        </View>
      </Card>
      <View style={styles.two}>
        <Card theme={theme} style={styles.col}>
          <Label theme={theme}>Mediciones TA</Label>
          <Text style={[styles.mid, { color: theme.text }]}>{bpOf(u).length}</Text>
        </Card>
        <Card theme={theme} style={styles.col}>
          <Label theme={theme}>Mediciones glucosa</Label>
          <Text style={[styles.mid, { color: theme.text }]}>{gluOf(u).length}</Text>
        </Card>
      </View>

      <Label theme={theme}>Usuarios registrados</Label>
      {state.users.map((x) => (
        <Card key={x.id} theme={theme}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.text, fontSize: 15 }]}>{x.first} {x.last}</Text>
              <Text style={[styles.meta, { color: theme.muted }]}>{ageFromBirth(x.birth)} años · {x.readings.length} mediciones</Text>
            </View>
            <View style={styles.row}>
              {x.id !== u.id ? (
                <TouchableOpacity onPress={() => switchUser(x.id)}>
                  <Text style={[styles.act, { color: theme.blue2 }]}>Activar</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.actOn, { color: theme.green }]}>Activo</Text>
              )}
              {state.users.length > 1 && (
                <TouchableOpacity onPress={() => deleteUser(x.id)}>
                  <Text style={[styles.act, { color: theme.red }]}>🗑</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card>
      ))}
      <PrimaryButton title="＋ Crear usuario" onPress={openNew} theme={theme} />

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={[styles.back, { backgroundColor: '#14315c55' }]}>
          <View style={[styles.sheet, { backgroundColor: theme.panel }]}>
            <Text style={[styles.title, { color: theme.text }]}>{editing ? 'Editar usuario' : 'Crear usuario'}</Text>
            <Text style={[styles.lab, { color: theme.muted }]}>Nombres</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={first} onChangeText={setFirst} />
            <Text style={[styles.lab, { color: theme.muted }]}>Apellidos</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={last} onChangeText={setLast} />
            <Text style={[styles.lab, { color: theme.muted }]}>Nacimiento (AAAA-MM-DD)</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={birth} onChangeText={setBirth} placeholder="1990-01-01" />
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
  profile: { flexDirection: 'row', alignItems: 'center' },
  name: { fontFamily: 'Sora', fontSize: 20, fontWeight: '800' },
  meta: { fontSize: 12 },
  btns: { marginTop: 10 },
  two: { flexDirection: 'row', gap: 12, marginVertical: 12 },
  col: { flex: 1 },
  mid: { fontFamily: 'Sora', fontSize: 24, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  act: { fontWeight: '800', marginLeft: 12 },
  actOn: { fontWeight: '800', marginLeft: 12 },
  back: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  title: { fontFamily: 'Sora', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  lab: { fontSize: 12, fontWeight: '800', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 10, backgroundColor: '#f8fbfe' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
});
