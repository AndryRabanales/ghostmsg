# 🚀 Checklist de lanzamiento — GhostMsg app

El código de la app, push, deep links y moderación **ya está listo**.
Estos son los pasos que te tocan a ti (en orden). Marca cada uno al terminarlo.

## A. Cuentas (hazlo YA, tardan días en aprobar)
- [ ] **Apple Developer** (99 USD/año): https://developer.apple.com/programs/enroll/
- [ ] **Google Play Console** (25 USD una vez): https://play.google.com/console/signup
- [ ] Cuenta **Expo** (gratis): https://expo.dev/signup

## B. Proyecto EAS (5 min, necesario para push y builds)
```bash
cd app
npm install -g eas-cli
eas login
eas init            # crea el projectId (habilita las notificaciones push)
```

## C. Google OAuth nativo (para el login en la app)
En Google Cloud Console → mismo proyecto del client web → Credenciales → Crear ID de cliente OAuth:
- [ ] Tipo **iOS** → bundle: `com.ghostmsg.app`
- [ ] Tipo **Android** → package: `com.ghostmsg.app` + SHA-1
      (el SHA-1 sale de `eas credentials` → Android → Keystore)
- [ ] Pega ambos IDs en `app/app.json` → `extra.googleIosClientId` / `extra.googleAndroidClientId`
- [ ] En Railway (ghost-api) agrega las variables:
      `GOOGLE_IOS_CLIENT_ID` y `GOOGLE_ANDROID_CLIENT_ID`

## D. Push (credenciales, EAS lo automatiza)
```bash
eas credentials     # sigue el asistente: APNs (iOS) y FCM (Android)
```
Para FCM necesitas un proyecto en https://console.firebase.google.com
(agregar app Android `com.ghostmsg.app` y subir la clave a EAS).

## E. Probar en tu teléfono
```bash
eas build --profile development --platform android   # o ios
npx expo start
```
Instala el build en tu teléfono, inicia sesión con Google y prueba:
mensajes, push (mándate un anónimo desde la web), archivar, perfil, compartir.

## F. Deep links (cuando tengas los IDs reales)
- [ ] `web/public/.well-known/apple-app-site-association`:
      reemplaza `REEMPLAZA_TEAMID` con tu **Team ID** de Apple (10 caracteres).
- [ ] `web/public/.well-known/assetlinks.json`:
      reemplaza la huella con el **SHA-256** (sale de `eas credentials`).
- [ ] Sube la web (git push) para que sirvan los archivos actualizados.

## G. Assets de tienda
- [ ] Ícono **1024×1024** (sin transparencia para iOS) → `app/assets/icon.png`
- [ ] Splash → `app/assets/splash-icon.png` · Adaptive icon Android → `app/assets/adaptive-icon.png`
- [ ] Capturas de pantalla (iPhone 6.7" y 6.5"; Android teléfono)
- [ ] Textos: nombre "GhostMsg", subtítulo, descripción, keywords

## H. Fichas de tienda
- [ ] URLs legales (ya publicadas):
      Privacidad: `https://ghost-web-production.up.railway.app/privacidad`
      Términos:   `https://ghost-web-production.up.railway.app/terminos`
- [ ] Cuestionario **App Privacy** (Apple) y **Data Safety** (Google)
- [ ] Clasificación de edad: **17+** (contenido generado por usuarios/anónimo)

## I. Beta y publicación
```bash
eas build --profile production --platform all
eas submit --platform ios       # TestFlight
eas submit --platform android   # Internal testing
```
- [ ] Probar en TestFlight / Internal testing
- [ ] Enviar a revisión (menciona en las notas: filtro automático + reportar + bloquear)
- [ ] Al aprobar: pega las URLs de tienda en `web/src/utils/appStore.js`
      (`APP_STORE_URL` y `PLAY_STORE_URL`) → los botones de la web se activan solos.
