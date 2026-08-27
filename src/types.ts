export type Reading = {
  id: string;
  type: 'bp' | 'glu';
  s?: number;
  d?: number;
  p?: number | null;
  g?: number;
  ctx: string | string[];
  m: string;
  notes?: string;
  date: string;
};

export type Med = {
  id: string;
  name: string;
  presentation: string;
  dose: string;
  schedule: string[];
  inventory: number;
  threshold: number;
};

export type Contact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  channel: 'whatsapp' | 'sms';
};

export type UserSettings = { sys: number; dia: number; glu: number };

export type User = {
  id: string;
  first: string;
  last: string;
  birth?: string;
  readings: Reading[];
  settings: UserSettings;
  meds: Med[];
  contacts: Contact[];
};

export type AppState = {
  users: User[];
  activeId: string | null;
  highContrast: boolean;
};
