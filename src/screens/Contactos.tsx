import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { useApp } from '../context';
import { useTheme } from '../useTheme';
import { Card, Label, PrimaryButton, GhostButton } from '../components/ui';
import { dispatchSOS, getCoords } from '../lib/sos';

export default function ContactosScreen() {
  const { activeUser: u, saveContact, deleteContact } = useApp();
  const theme = useTheme();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');

  const openNew = () => { setEditing(null); setName(''); setRelation(''); setPhone(''); setChannel('whatsapp'); setModal(true); };
  const openEdit = (c: any) => { setEditing(c.id); setName(c.name); setRelation(c.relation); setPhone(c.phone); setChannel(c.channel); setModal(true); };
  const save = () => {
    if (!name || !phone) return;
    saveContact({ name, relation, phone, channel }, editing);
    setModal(false);
  };
  if (!u) return null;

  const test = async (contact: any) => {
    const coords = await getCoords();
    await dispatchSOS(contact, u, coords);
  };

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <Label theme={theme}>Contactos de emergencia</Label>
      {u.contacts.map((c) => (
        <Card key={c.id} theme={theme}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.text }]}>{c.name}</Text>
              <Text style={[styles.meta, { color: theme.muted }]}>{c.relation} · {c.phone}</Text>
              <Text style={[styles.meta, { color: theme.blue2 }]}>{c.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}</Text>
            </View>
            <View style={styles.colA}>
              <TouchableOpacity onPress={() => test(c)}>
                <Text style={[styles.act, { color: theme.green }]}>📤 Probar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openEdit(c)}>
                <Text style={[styles.act, { color: theme.blue2 }]}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteContact(c.id)}>
                <Text style={[styles.act, { color: theme.red }]}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      ))}
      <PrimaryButton title="＋ Añadir contacto" onPress={openNew} theme={theme} />

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={[styles.back, { backgroundColor: '#14315c55' }]}>
          <View style={[styles.sheet, { backgroundColor: theme.panel }]}>
            <Text style={[styles.title, { color: theme.text }]}>{editing ? 'Editar contacto' : 'Añadir contacto'}</Text>
            <Text style={[styles.lab, { color: theme.muted }]}>Nombre</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={name} onChangeText={setName} />
            <Text style={[styles.lab, { color: theme.muted }]}>Parentesco</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={relation} onChangeText={setRelation} />
            <Text style={[styles.lab, { color: theme.muted }]}>Teléfono (con código de país, ej. 57...)</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.line }]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Text style={[styles.lab, { color: theme.muted }]}>Canal preferido</Text>
            <View style={styles.seg}>
              <TouchableOpacity style={[styles.segBtn, channel === 'whatsapp' && styles.segOn]} onPress={() => setChannel('whatsapp')}>
                <Text style={channel === 'whatsapp' ? styles.segOnT : styles.segT}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.segBtn, channel === 'sms' && styles.segOn]} onPress={() => setChannel('sms')}>
                <Text style={channel === 'sms' ? styles.segOnT : styles.segT}>SMS</Text>
              </TouchableOpacity>
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
  back: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  title: { fontFamily: 'Sora', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  lab: { fontSize: 12, fontWeight: '800', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 10, backgroundColor: '#f8fbfe' },
  seg: { flexDirection: 'row', backgroundColor: 'rgba(20,49,92,.06)', borderRadius: 14, padding: 4, marginTop: 8 },
  segBtn: { flex: 1, padding: 10, borderRadius: 11, alignItems: 'center' },
  segOn: { backgroundColor: '#14315c' },
  segT: { fontWeight: '800', color: '#5b7290' },
  segOnT: { fontWeight: '800', color: '#fff' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
});
