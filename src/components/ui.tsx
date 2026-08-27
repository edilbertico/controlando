import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { ThemeColors, pillColors, pillBg, pillBgHC } from '../theme';

export const Card = ({ children, style, theme }: { children: React.ReactNode; style?: any; theme: ThemeColors }) => (
  <View style={[styles.card, { backgroundColor: theme.panel, borderColor: theme.line }, style]}>
    {children}
  </View>
);

export const Label = ({ children, theme }: { children: React.ReactNode; theme: ThemeColors }) => (
  <Text style={[styles.label, { color: theme.muted }]}>{children}</Text>
);

export const BigNum = ({ children, theme }: { children: React.ReactNode; theme: ThemeColors }) => (
  <Text style={[styles.bignum, { color: theme.text }]}>{children}</Text>
);

export const Pill = ({ text, cls, theme, hc }: { text: string; cls: string; theme: ThemeColors; hc: boolean }) => (
  <View style={[styles.pill, { backgroundColor: hc ? pillBgHC[cls] || '#222' : pillBg[cls] || '#eee', borderColor: pillColors[cls] + '55' }]}>
    <Text style={[styles.pillText, { color: pillColors[cls] }]}>{text}</Text>
  </View>
);

export const PrimaryButton = ({ title, onPress, theme, small }: { title: string; onPress: () => void; theme: ThemeColors; small?: boolean }) => (
  <TouchableOpacity style={[styles.btn, styles.btnPrimary, small && styles.btnSmall, { backgroundColor: theme.blue }]} onPress={onPress}>
    <Text style={[styles.btnText, small && styles.btnTextSmall]}>{title}</Text>
  </TouchableOpacity>
);

export const GhostButton = ({ title, onPress, theme, small }: { title: string; onPress: () => void; theme: ThemeColors; small?: boolean }) => (
  <TouchableOpacity style={[styles.btn, styles.btnGhost, small && styles.btnSmall, { borderColor: theme.line }]} onPress={onPress}>
    <Text style={[styles.btnTextGhost, small && styles.btnTextSmall, { color: theme.blue }]}>{title}</Text>
  </TouchableOpacity>
);

export const DangerButton = ({ title, onPress, small }: { title: string; onPress: () => void; small?: boolean }) => (
  <TouchableOpacity style={[styles.btn, styles.btnDanger, small && styles.btnSmall]} onPress={onPress}>
    <Text style={[styles.btnText, small && styles.btnTextSmall]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 14, shadowColor: '#14315c', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
  label: { fontSize: 11.5, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  bignum: { fontFamily: 'Sora', fontSize: 40, fontWeight: '800', letterSpacing: -0.5 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 99, borderWidth: 1, marginTop: 8 },
  pillText: { fontSize: 11.5, fontWeight: '800' },
  btn: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  btnSmall: { paddingVertical: 9, paddingHorizontal: 14 },
  btnPrimary: { backgroundColor: '#14315c' },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1 },
  btnDanger: { backgroundColor: '#d64550' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  btnTextSmall: { fontSize: 13 },
  btnTextGhost: { fontWeight: '800', fontSize: 14 },
});
