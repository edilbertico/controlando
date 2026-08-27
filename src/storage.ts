import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, User } from './types';

const K = {
  users: 'tp_users',
  active: 'tp_active',
  hc: 'tp_hc',
};

export const loadState = async (): Promise<AppState> => {
  const [users, active, hc] = await Promise.all([
    AsyncStorage.getItem(K.users),
    AsyncStorage.getItem(K.active),
    AsyncStorage.getItem(K.hc),
  ]);
  return {
    users: users ? JSON.parse(users) : [],
    activeId: active ? JSON.parse(active) : null,
    highContrast: hc ? JSON.parse(hc) : false,
  };
};

export const saveUsers = (users: User[]) => AsyncStorage.setItem(K.users, JSON.stringify(users));
export const saveActive = (id: string | null) => AsyncStorage.setItem(K.active, JSON.stringify(id));
export const saveHC = (hc: boolean) => AsyncStorage.setItem(K.hc, JSON.stringify(hc));

export const uid = () => 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const rid = () => 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const mid = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const cid = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
