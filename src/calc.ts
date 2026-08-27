import { Reading, User, UserSettings } from './types';

export const avg = (arr: any[], f: (r: any) => number): number | null =>
  arr.length ? Math.round(arr.reduce((a, b) => a + f(b), 0) / arr.length) : null;

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function stdDev(arr: number[]): number | null {
  if (arr.length < 2) return null;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) * (b - m), 0) / arr.length);
}

export function last7prev7(arr: Reading[]) {
  const now = Date.now();
  const l = arr.filter((r) => now - new Date(r.date).getTime() < 7 * 864e5);
  const p = arr.filter((r) => {
    const dt = now - new Date(r.date).getTime();
    return dt >= 7 * 864e5 && dt < 14 * 864e5;
  });
  return [l, p];
}

export function classifyBP(s: number, d: number): [string, string] {
  if (s >= 180 || d >= 120) return ['Crisis', 'red'];
  if (s >= 140 || d >= 90) return ['Alta', 'red'];
  if (s >= 130 || d >= 80) return ['Elevada', 'yellow'];
  if (s < 90 || d < 60) return ['Baja', 'yellow'];
  return ['Óptima', 'green'];
}

export function classifyGlu(g: number, ctx: string | string[]): [string, string] {
  const c = Array.isArray(ctx) ? ctx.join(' ') : ctx || '';
  const fast = /ayunas|antes/i.test(c);
  if (g < 70) return ['Hipoglucemia', 'red'];
  if (fast) {
    if (g <= 99) return ['Normal', 'green'];
    if (g <= 125) return ['Elevada', 'yellow'];
    return ['Alta', 'red'];
  }
  if (g <= 140) return ['Normal', 'green'];
  if (g <= 199) return ['Elevada', 'yellow'];
  return ['Alta', 'red'];
}

export function classifyPulse(p: number): [string, string] {
  if (p < 60) return ['Bradicardia', 'yellow'];
  if (p <= 100) return ['Normal', 'green'];
  return ['Taquicardia', 'yellow'];
}

export const bpOf = (u: User) => u.readings.filter((r) => r.type === 'bp');
export const gluOf = (u: User) => u.readings.filter((r) => r.type === 'glu');
export const settingsOf = (u?: User): UserSettings =>
  Object.assign({ sys: 130, dia: 80, glu: 100 }, u ? u.settings : {});

export function pctInRange(u: User, type: 'bp' | 'glu'): number | null {
  const st = settingsOf(u);
  const cut = Date.now() - 30 * 864e5;
  const arr = u.readings.filter((r) => r.type === type && new Date(r.date).getTime() >= cut);
  if (!arr.length) return null;
  const ok =
    type === 'bp'
      ? arr.filter((r) => r.s! <= st.sys && r.d! <= st.dia && r.s! >= 90 && r.d! >= 60).length
      : arr.filter((r) => classifyGlu(r.g!, r.ctx)[0] === 'Normal').length;
  return Math.round((ok / arr.length) * 100);
}

export function streakDays(u: User): number {
  const days = new Set(u.readings.map((r) => new Date(r.date).toDateString()));
  let n = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function ageFromBirth(b?: string): number | string {
  if (!b) return '—';
  const d = new Date(b + 'T00:00:00');
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
  return a;
}

export function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}
export function fmtDateTime(d: string): string {
  return new Date(d).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function insightTA(u: User): string {
  const ta = bpOf(u);
  if (!ta.length) return 'Registra tu primera medición de tensión para recibir una orientación personalizada.';
  const st = settingsOf(u);
  const rec = ta.slice(0, 5);
  const s = avg(rec, (r) => r.s!) as number;
  const d = avg(rec, (r) => r.d!) as number;
  const last = ta[0];
  if (last.s! >= 180 || last.d! >= 120)
    return `⚠️ Tu última lectura (${last.s}/${last.d}) está en rango de crisis. Repítela tras 5 minutos de reposo; si persiste o aparecen síntomas, busca atención médica urgente.`;
  if (s >= 140 || d >= 90)
    return `Tus últimas ${rec.length} mediciones promedian ${s}/${d} mmHg, por encima de lo recomendado. Considera consultarlo con tu médico.`;
  if (s > st.sys || d > st.dia)
    return `Promedio reciente de ${s}/${d} mmHg, ligeramente sobre tu meta (${st.sys}/${st.dia}). Pequeños cambios — menos sal, más movimiento — suman.`;
  return `¡Buen trabajo! Promedio reciente de ${s}/${d} mmHg, dentro de tu meta (${st.sys}/${st.dia}).`;
}

export function insightGlu(u: User): string {
  const gl = gluOf(u);
  if (!gl.length) return 'Añade mediciones de glucosa para ver tu tendencia y tiempo en rango.';
  const st = settingsOf(u);
  const last = gl[0];
  if (last.g! < 70)
    return `⚠️ Última glucosa ${last.g} mg/dL: posible hipoglucemia. Consume carbohidratos de absorción rápida y vuelve a medirte en 15 minutos.`;
  if (last.g! >= 126 && /ayunas/i.test(Array.isArray(last.ctx) ? last.ctx.join(' ') : last.ctx || ''))
    return `Tu glucosa en ayunas de ${last.g} mg/dL está en rango de alerta. Si se repite, coméntalo con tu equipo de salud.`;
  const rec = gl.slice(0, 5);
  const g = avg(rec, (r) => r.g!) as number;
  if (g > st.glu + 25)
    return `Promedio reciente de ${g} mg/dL, por encima de tu objetivo (${st.glu} mg/dL). Revisa comidas, actividad física y horarios.`;
  return `Promedio reciente de ${g} mg/dL. ${g <= st.glu ? `Dentro de tu objetivo (${st.glu}). ¡Sigue así!` : `Cerca de tu objetivo (${st.glu}).`}`;
}

// Informe en texto plano para compartir / exportar
export function buildReportText(u: User, range?: { f: Date | null; t: Date | null }): string {
  const st = settingsOf(u);
  const inR = (r: Reading) => {
    const d = new Date(r.date).getTime();
    return (!range?.f || d >= range.f.getTime()) && (!range?.t || d <= range.t.getTime());
  };
  const ta = bpOf(u).filter(inR);
  const gl = gluOf(u).filter(inR);
  const L: string[] = [];
  L.push('INFORME DE SEGUIMIENTO — Cundinamarca te Cuida');
  L.push('Gobernación de Cundinamarca · Secretaría de Salud');
  L.push(`${u.first} ${u.last} · ${ageFromBirth(u.birth)} años · Generado: ${new Date().toLocaleString('es-CO')}`);
  if (range?.f || range?.t)
    L.push(`Periodo: ${range?.f?.toLocaleDateString('es-CO') || 'inicio'} – ${range?.t?.toLocaleDateString('es-CO') || 'hoy'}`);
  L.push('');
  if (!ta.length && !gl.length) {
    L.push('Sin mediciones en el periodo seleccionado.');
    return L.join('\n');
  }
  if (ta.length) {
    const s = avg(ta, (r) => r.s!) as number;
    const d = avg(ta, (r) => r.d!) as number;
    const [lab] = classifyBP(s, d);
    const ok = ta.filter((r) => r.s! <= st.sys && r.d! <= st.dia).length;
    const pct = Math.round((ok / ta.length) * 100);
    const mx = ta.reduce((a, b) => (b.s! > a.s! ? b : a));
    L.push(`TENSIÓN ARTERIAL (${ta.length} mediciones)`);
    L.push(`- Promedio: ${s}/${d} mmHg · clasificación: ${lab}`);
    L.push(`- Dentro de meta ${st.sys}/${st.dia}: ${pct}%`);
    L.push(`- Lectura más alta: ${mx.s}/${mx.d} (${fmtDateTime(mx.date)})`);
    L.push('');
  }
  if (gl.length) {
    const g = avg(gl, (r) => r.g!) as number;
    const a1c = (g + 46.7) / 28.7;
    const okg = gl.filter((r) => classifyGlu(r.g!, r.ctx)[0] === 'Normal').length;
    const pg = Math.round((okg / gl.length) * 100);
    const mx = gl.reduce((a, b) => (b.g! > a.g! ? b : a));
    L.push(`GLUCOSA (${gl.length} mediciones)`);
    L.push(`- Promedio: ${g} mg/dL · eA1c estimada: ${a1c.toFixed(1)}%`);
    L.push(`- Tiempo en rango: ${pg}%`);
    L.push(`- Lectura más alta: ${mx.g} mg/dL (${fmtDateTime(mx.date)})`);
    L.push('');
  }
  L.push('Informe orientativo — Cundinamarca te Cuida. No sustituye la valoración profesional.');
  return L.join('\n');
}

export function buildReportHtml(u: User, range?: { f: Date | null; t: Date | null }): string {
  const st = settingsOf(u);
  const inR = (r: Reading) => {
    const d = new Date(r.date).getTime();
    return (!range?.f || d >= range.f.getTime()) && (!range?.t || d <= range.t.getTime());
  };
  const ta = bpOf(u).filter(inR);
  const gl = gluOf(u).filter(inR);
  const rows: string[] = [];
  rows.push(`<h2 style="color:#14315c;font-family:sans-serif">Informe de seguimiento — Cundinamarca te Cuida</h2>`);
  rows.push(`<p style="font-family:sans-serif;color:#33507a">${u.first} ${u.last} · ${ageFromBirth(u.birth)} años · Generado: ${new Date().toLocaleString('es-CO')}</p>`);
  if (range?.f || range?.t)
    rows.push(`<p style="font-family:sans-serif;color:#33507a">Periodo: ${range?.f?.toLocaleDateString('es-CO') || 'inicio'} – ${range?.t?.toLocaleDateString('es-CO') || 'hoy'}</p>`);
  if (!ta.length && !gl.length) {
    rows.push(`<p style="font-family:sans-serif;color:#33507a">Sin mediciones en el periodo seleccionado.</p>`);
  }
  if (ta.length) {
    const s = avg(ta, (r) => r.s!) as number;
    const d = avg(ta, (r) => r.d!) as number;
    const [lab] = classifyBP(s, d);
    const ok = ta.filter((r) => r.s! <= st.sys && r.d! <= st.dia).length;
    const pct = Math.round((ok / ta.length) * 100);
    const mx = ta.reduce((a, b) => (b.s! > a.s! ? b : a));
    rows.push(`<h3 style="color:#14315c;font-family:sans-serif">Tensión arterial (${ta.length})</h3>`);
    rows.push(`<ul style="font-family:sans-serif;color:#33507a"><li>Promedio: ${s}/${d} mmHg · ${lab}</li><li>Dentro de meta ${st.sys}/${st.dia}: ${pct}%</li><li>Lectura más alta: ${mx.s}/${mx.d} (${fmtDateTime(mx.date)})</li></ul>`);
  }
  if (gl.length) {
    const g = avg(gl, (r) => r.g!) as number;
    const a1c = (g + 46.7) / 28.7;
    const okg = gl.filter((r) => classifyGlu(r.g!, r.ctx)[0] === 'Normal').length;
    const pg = Math.round((okg / gl.length) * 100);
    const mx = gl.reduce((a, b) => (b.g! > a.g! ? b : a));
    rows.push(`<h3 style="color:#14315c;font-family:sans-serif">Glucosa (${gl.length})</h3>`);
    rows.push(`<ul style="font-family:sans-serif;color:#33507a"><li>Promedio: ${g} mg/dL · eA1c estimada: ${a1c.toFixed(1)}%</li><li>Tiempo en rango: ${pg}%</li><li>Lectura más alta: ${mx.g} mg/dL (${fmtDateTime(mx.date)})</li></ul>`);
  }
  rows.push(`<hr><p style="font-family:sans-serif;color:#5b7290;font-size:12px">Informe orientativo — Cundinamarca te Cuida · Gobernación de Cundinamarca. No sustituye la valoración profesional.</p>`);
  return `<!doctype html><html><body>${rows.join('')}</body></html>`;
}
