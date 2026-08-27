import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { User, Contact } from '../types';
import { bpOf, gluOf, fmtDateTime } from '../calc';

export type Coords = { lat: number; lng: number } | null;

export async function getCoords(): Promise<Coords> {
  try {
    if (Platform.OS === 'web') {
      return await new Promise<Coords>((resolve) => {
        if (!('geolocation' in navigator)) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}

export function buildSOSMessage(user: User, coords: Coords): string {
  const ta = bpOf(user)[0];
  const gl = gluOf(user)[0];
  const parts: string[] = [];
  parts.push(`🆘 SOS de ${user.first} ${user.last}.`);
  if (ta) parts.push(`Tensión: ${ta.s}/${ta.d} mmHg · Pulso: ${ta.p ?? '—'} lpm (${fmtDateTime(ta.date)})`);
  if (gl) parts.push(`Glicemia: ${gl.g} mg/dL (${fmtDateTime(gl.date)})`);
  if (coords) {
    parts.push(`Ubicación: https://maps.google.com/?q=${coords.lat},${coords.lng}`);
  } else {
    parts.push(`Ubicación: no disponible en este momento (sin GPS).`);
  }
  parts.push(`Por favor, contacta pronto. Mensaje enviado desde Cundinamarca te Cuida.`);
  return parts.join('\n');
}

function normalizePhone(p: string): string {
  return p.replace(/[^\d]/g, '');
}

export async function sendViaWhatsApp(contact: Contact, message: string) {
  const phone = normalizePhone(contact.phone);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const can = await Linking.canOpenURL(url);
  if (can) await Linking.openURL(url);
  else await sendViaSms(contact, message);
}

export async function sendViaSms(contact: Contact, message: string) {
  const phone = normalizePhone(contact.phone);
  const url = `sms:${phone}?body=${encodeURIComponent(message)}`;
  const can = await Linking.canOpenURL(url);
  if (can) await Linking.openURL(url);
}

export async function dispatchSOS(contact: Contact, user: User, coords: Coords) {
  const msg = buildSOSMessage(user, coords);
  if (contact.channel === 'whatsapp') await sendViaWhatsApp(contact, msg);
  else await sendViaSms(contact, msg);
}
