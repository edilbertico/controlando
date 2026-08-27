import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { AppProvider, useApp } from './src/context';
import { useTheme } from './src/useTheme';
import Inicio from './src/screens/Inicio';
import Historial from './src/screens/Historial';
import Analisis from './src/screens/Analisis';
import Perfil from './src/screens/Perfil';
import Ajustes from './src/screens/Ajustes';
import MedScreen from './src/screens/Medicamentos';
import ContactosScreen from './src/screens/Contactos';
import SOSScreen from './src/screens/SOS';
import * as Notifications from 'expo-notifications';
import { scheduleAllMeds, cancelAllMeds, scheduleSnooze, configureMedCategory, requestNotifPermission } from './src/lib/notifications';

const Tab = createBottomTabNavigator();

const TabBar = () => {
  const { activeUser } = useApp();
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.panel },
        headerTintColor: theme.text,
        tabBarStyle: { backgroundColor: theme.panel, borderTopColor: theme.line },
        tabBarActiveTintColor: theme.blue2,
        tabBarInactiveTintColor: theme.muted,
      }}
    >
      <Tab.Screen name="Inicio" component={Inicio} />
      <Tab.Screen name="Historial" component={Historial} />
      <Tab.Screen name="Analisis" component={Analisis} />
      <Tab.Screen name="Medicamentos" component={MedScreen} />
      <Tab.Screen name="Contactos" component={ContactosScreen} />
      <Tab.Screen name="SOS" component={SOSScreen} />
      <Tab.Screen name="Perfil" component={Perfil} />
      <Tab.Screen name="Ajustes" component={Ajustes} />
    </Tab.Navigator>
  );
};

const Listener = () => {
  const { activeUser, takeMed, ensure } = useApp();
  useEffect(() => {
    ensure();
    configureMedCategory();
    requestNotifPermission();
  }, []);
  useEffect(() => {
    if (activeUser) scheduleAllMeds(activeUser);
    else cancelAllMeds();
  }, [activeUser]);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const medId = resp.notification.request.content.data?.medId as string;
      if (!medId) return;
      const med = activeUser?.meds.find((m) => m.id === medId);
      if (resp.actionIdentifier === 'TOMAR') takeMed(medId, 1);
      else if (resp.actionIdentifier === 'POSPONER' && med) scheduleSnooze(medId, med.name, 15);
    });
    return () => sub.remove();
  }, [activeUser]);
  return null;
};

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TabBar />
        <Listener />
      </NavigationContainer>
    </AppProvider>
  );
}
