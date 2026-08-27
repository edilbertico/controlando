import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState as St, User, Reading, Med, Contact } from './types';
import { loadState, saveUsers, saveActive, saveHC, uid, rid, mid, cid } from './storage';

type Ctx = {
  state: St;
  activeUser: User | null;
  ensure: () => void;
  switchUser: (id: string) => void;
  saveUser: (data: { first: string; last: string; birth?: string }, editingId?: string | null) => void;
  deleteUser: (id: string) => void;
  saveReading: (r: Omit<Reading, 'id' | 'date'> & { date?: string }) => void;
  deleteReading: (id: string) => void;
  saveSettings: (s: { sys: number; dia: number; glu: number }) => void;
  saveMed: (m: Omit<Med, 'id'>, editingId?: string | null) => void;
  deleteMed: (id: string) => void;
  takeMed: (id: string, qty?: number) => void;
  saveContact: (c: Omit<Contact, 'id'>, editingId?: string | null) => void;
  deleteContact: (id: string) => void;
  toggleHC: () => void;
  refresh: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp debe usarse dentro de AppProvider');
  return c;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<St>({ users: [], activeId: null, highContrast: false });

  useEffect(() => {
    loadState().then((s) => setState(s));
  }, []);

  const persist = (next: St) => {
    setState(next);
    saveUsers(next.users);
    saveActive(next.activeId);
    saveHC(next.highContrast);
  };

  const getUser = (s: St = state) => s.users.find((u) => u.id === s.activeId) || null;

  const ensure = () => {
    setState((s) => {
      let ns = s;
      if (!ns.users.length) {
        const nu: User = { id: uid(), first: 'Invitado', last: 'Demo', birth: '1990-01-01', readings: [], settings: { sys: 130, dia: 80, glu: 100 }, meds: [], contacts: [] };
        ns = { ...ns, users: [nu], activeId: nu.id };
      } else if (!getUser(ns)) {
        ns = { ...ns, activeId: ns.users[0].id };
      }
      saveUsers(ns.users);
      saveActive(ns.activeId);
      return ns;
    });
  };

  const switchUser = (id: string) =>
    setState((s) => {
      const ns = { ...s, activeId: id };
      saveActive(id);
      return ns;
    });

  const saveUser = (data: { first: string; last: string; birth?: string }, editingId?: string | null) => {
    setState((s) => {
      let users = s.users;
      if (editingId) {
        users = users.map((u) => (u.id === editingId ? { ...u, ...data } : u));
      } else {
        const nu: User = { id: uid(), first: data.first, last: data.last, birth: data.birth, readings: [], settings: { sys: 130, dia: 80, glu: 100 }, meds: [], contacts: [] };
        users = [...users, nu];
        saveActive(nu.id);
        return { ...s, users, activeId: nu.id };
      }
      saveUsers(users);
      return { ...s, users };
    });
  };

  const deleteUser = (id: string) =>
    setState((s) => {
      let users = s.users.filter((u) => u.id !== id);
      let activeId = s.activeId;
      if (activeId === id) activeId = users.length ? users[0].id : null;
      const ns = { ...s, users, activeId };
      saveUsers(users);
      saveActive(activeId);
      return ns;
    });

  const saveReading = (r: Omit<Reading, 'id' | 'date'> & { date?: string }) => {
    setState((s) => {
      const users = s.users.map((u) => {
        if (u.id !== s.activeId) return u;
        const nr: Reading = { ...(r as any), id: rid(), date: r.date || new Date().toISOString() };
        const readings = [nr, ...u.readings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { ...u, readings };
      });
      saveUsers(users);
      return { ...s, users };
    });
  };

  const deleteReading = (id: string) =>
    setState((s) => {
      const users = s.users.map((u) => (u.id === s.activeId ? { ...u, readings: u.readings.filter((r) => r.id !== id) } : u));
      saveUsers(users);
      return { ...s, users };
    });

  const saveSettings = (set: { sys: number; dia: number; glu: number }) =>
    setState((s) => {
      const users = s.users.map((u) => (u.id === s.activeId ? { ...u, settings: set } : u));
      saveUsers(users);
      return { ...s, users };
    });

  const saveMed = (m: Omit<Med, 'id'>, editingId?: string | null) =>
    setState((s) => {
      const users = s.users.map((u) => {
        if (u.id !== s.activeId) return u;
        if (editingId) return { ...u, meds: u.meds.map((x) => (x.id === editingId ? { ...x, ...m } : x)) };
        return { ...u, meds: [...u.meds, { ...m, id: mid() }] };
      });
      saveUsers(users);
      return { ...s, users };
    });

  const deleteMed = (id: string) =>
    setState((s) => {
      const users = s.users.map((u) => (u.id === s.activeId ? { ...u, meds: u.meds.filter((m) => m.id !== id) } : u));
      saveUsers(users);
      return { ...s, users };
    });

  const takeMed = (id: string, qty = 1) =>
    setState((s) => {
      const users = s.users.map((u) => {
        if (u.id !== s.activeId) return u;
        return { ...u, meds: u.meds.map((m) => (m.id === id ? { ...m, inventory: Math.max(0, m.inventory - qty) } : m)) };
      });
      saveUsers(users);
      return { ...s, users };
    });

  const saveContact = (c: Omit<Contact, 'id'>, editingId?: string | null) =>
    setState((s) => {
      const users = s.users.map((u) => {
        if (u.id !== s.activeId) return u;
        if (editingId) return { ...u, contacts: u.contacts.map((x) => (x.id === editingId ? { ...x, ...c } : x)) };
        return { ...u, contacts: [...u.contacts, { ...c, id: cid() }] };
      });
      saveUsers(users);
      return { ...s, users };
    });

  const deleteContact = (id: string) =>
    setState((s) => {
      const users = s.users.map((u) => (u.id === s.activeId ? { ...u, contacts: u.contacts.filter((c) => c.id !== id) } : u));
      saveUsers(users);
      return { ...s, users };
    });

  const toggleHC = () =>
    setState((s) => {
      const ns = { ...s, highContrast: !s.highContrast };
      saveHC(ns.highContrast);
      return ns;
    });

  const refresh = () => setState((s) => ({ ...s }));

  return (
    <AppCtx.Provider
      value={{
        state,
        activeUser: getUser(),
        ensure,
        switchUser,
        saveUser,
        deleteUser,
        saveReading,
        deleteReading,
        saveSettings,
        saveMed,
        deleteMed,
        takeMed,
        saveContact,
        deleteContact,
        toggleHC,
        refresh,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
};
