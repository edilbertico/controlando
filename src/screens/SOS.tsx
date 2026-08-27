import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useApp } from '../context';
import { useTheme } from '../useTheme';
import { Card, Label } from '../components/ui';
import { getCoords, buildSOSMessage, dispatchSOS, Coords } from '../lib/sos';

export default function SOSScreen() {
  const { activeUser: u } = useApp();
  const theme = useTheme();
  const [coords, setCoords] = useState<Coords>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  if (!u) return null;

  const capture = async () => {
    setLoading(true);
    const c = await getCoords();
    setCoords(c);
    setPreview(buildSOSMessage(u, c));
    setLoading(false);
  };

  const send = async (contact: any) => {
    const c = coords || (await getCoords());
    await dispatchSOS(contact, u, c);
  };

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: theme.bg }]} contentContainerStyle={styles.pad}>
      <TouchableOpacity style={[styles.sos, { backgroundColor: theme.red }]} onPress={capture} disabled={loading}>
        <Text style={styles.sosIcon}>🆘</Text>
        <Text style={styles.sosText}>TOCA PARA SOS</Text>
        <Text style={styles.sosSub}>{loading ? 'Obteniendo ubicación…' : 'Captura GPS y arma el mensaje'}</Text>
      </TouchableOpacity>

      {coords && (
        <Card theme={theme}>
          <Label theme={theme}>Coordenadas</Label>
          <Text style={[styles.meta, { color: theme.text }]}>Lat: {coords.lat.toFixed(5)} · Lng: {coords.lng.toFixed(5)}</Text>
        </Card>
      )}

      {preview ? (
        <Card theme={theme}>
          <Label theme={theme}>Vista previa del mensaje</Label>
          <Text style={[styles.msg, { color: theme.text }]}>{preview}</Text>
        </Card>
      ) : null}

      <Label theme={theme}>Enviar a contactos</Label>
      {u.contacts.length === 0 && <Text style={[styles.meta, { color: theme.muted }]}>Aún no hay contactos. Añádelos en la pestaña Contactos.</Text>}
      {u.contacts.map((c) => (
        <Card key={c.id} theme={theme}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.text }]}>{c.name}</Text>
              <Text style={[styles.meta, { color: theme.muted }]}>{c.relation} · {c.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}</Text>
            </View>
            <TouchableOpacity style={[styles.send, { backgroundColor: theme.blue }]} onPress={() => send(c)}>
              <Text style={styles.sendT}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40 },
  sos: { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16 },
  sosIcon: { fontSize: 48 },
  sosText: { color: '#fff', fontWeight: '800', fontSize: 22, letterSpacing: 1, marginTop: 6 },
  sosSub: { color: '#fff', fontSize: 12, marginTop: 4, opacity: 0.9 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontFamily: 'Sora', fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  msg: { fontSize: 13, lineHeight: 20, marginTop: 6 },
  send: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  sendT: { color: '#fff', fontWeight: '800' },
});
