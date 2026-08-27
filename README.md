# Cundinamarca te Cuida

App nativa de **seguimiento de tensión arterial y glucosa** para la comunidad de Cundinamarca, con recordatorios de medicación, alerta SOS con ubicación y exportación de informes.

Hecha con **React Native + Expo**. Parte de una app web original (`web-original/Latidos 1.txt`).

## Funcionalidades

- 🫀 Registro de tensión (sistólica/diastólica/pulso) y 💧 glucosa, con clasificación clínica.
- 📈 Análisis: promedios, variabilidad (desviación estándar), tendencias y gráficos (líneas + barras por momento/contexto).
- 💊 Medicamentos: horarios, recordatorios (alarma Tomar / Posponer 15 min) y alerta de stock bajo.
- 🆘 SOS: mensaje con últimas cifras y ubicación GPS, enviado por WhatsApp o SMS.
- ☎️ Marcación rápida `tel:123`.
- 🌗 Tema de alto contraste para accesibilidad.
- 📄 Informe descriptivo exportable (PDF/TXT en móvil).

## Requisitos

- Node.js 18+ y npm.
- Para el build móvil: cuenta gratuita de Expo (expo.dev) y `eas-cli`.

## Puesta en marcha (desarrollo)

```bash
npm install
npm start          # abre Expo; escanea el QR con Expo Go (Android/iOS)
npm run web        # versión web en el navegador
```

## Demo web en Vercel

El repo está configurado para Vercel (`vercel.json`):

1. En vercel.com → “Continue with GitHub” e importa el repo `controlando`.
2. Configuración detectada automáticamente:
   - **Build Command:** `expo export -p web`
   - **Output Directory:** `dist`
3. Deploy → URL tipo `https://controlando.vercel.app`.

> En la web se desactivan con aviso: alarmas, GPS real, `tel:123` y exportar PDF/TXT (solo nativo).

## Build de la app móvil (APK)

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android   # APK instalable (~10–20 min en la nube)
```

La primera vez EAS crea el proyecto y reescribe `projectId` en `app.json` (haz commit de ese cambio).
Al terminar descarga el `.apk`, actívalo en “orígenes desconocidos” e instálalo.

Para Play Store:

```bash
eas build --profile production --platform android   # genera .aab
eas submit --platform android                        # sube a Play Console
```

En la versión nativa **sí** funcionan alarmas, GPS y `tel:123`.

## Estructura

```
App.tsx                 Navegación + listener de alarmas
src/calc.ts             Lógica clínica e informes
src/context.tsx         Estado global (AsyncStorage)
src/theme.ts            Temas (claro / alto contraste)
src/lib/notifications.ts  Motor de alarmas
src/lib/sos.ts          GPS + envío WhatsApp/SMS
src/screens/*           Inicio, Historial, Analisis, Medicamentos, Contactos, SOS, Perfil, Ajustes
web-original/           App web original de referencia
```
