# Changelog — LolyLine

Todos los cambios notables de **LolyLine** están documentados en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-14

### 🚀 Lanzamiento Nativo Android — Google Play & Amazon Appstore

Esta versión marca la transición de la Progressive Web App (PWA) a una aplicación nativa Android optimizada de grado de producción, lista para su publicación en Google Play Store y Amazon Appstore bajo el nombre comercial **LolyLine**.

---

### ✨ Nuevas Características

#### 1. Marca Comercial & Landing de Bienvenida
- **Nombre comercial**: `LolyLine` (Arte en una sola línea continua / Single Continuous Line Art).
- **Identificador de paquete interno**: Se preserva `com.lineacontinua.studio` para garantizar estabilidad de configuración y compatibilidad con el proyecto Android base.
- **Pantalla de Bienvenida (Welcome Landing)**:
  - 📷 **Hacer Foto con Cámara**: Captura instantánea directa desde la app.
  - 🖼️ **Elegir de la Galería**: Selector nativo de imágenes.
  - ✨ **Probar Retrato Demo**: Retrato clásico cargado al instante con un solo toque.
  - 🏠 **Acceso Rápido al Inicio**: Botón en la cabecera del estudio para alternar fotos o volver a la bienvenida.
  - Opción de recordar preferencia para abrir directamente el estudio.

#### 2. Soporte Bilingüe Completo (Español & English - ES/EN)
- Selector de idioma interactivo en tiempo real `[ES | EN]` en la barra superior del editor.
- Traducción completa de los 22 estilos y algoritmos de trazado (nombres, badges y descripciones detalladas).
- Traducción de todos los paneles: bienvenida, cámara, ajustes, exportación y modal Pro.
- Cadenas nativas localizadas en Android: `res/values/strings.xml`, `res/values-es/strings.xml` y `res/values-en/strings.xml`.

#### 3. Adaptaciones Nativas de Alto Rendimiento
- **Cámara Nativa (`@capacitor/camera`)**:
  - Captura en alta resolución con corrección automática de orientación EXIF (`correctOrientation: true`).
  - Salvaguarda de memoria con restricción a 1600x1600 píxeles para prevenir caídas por agotamiento de RAM (OOM) en sensores fotográficos de 48 MP a 108 MP.
  - Declaración de características de hardware con `android:required="false"` (`android.hardware.camera`, `autofocus`, `front`), permitiendo la instalación en tablets Amazon Fire o dispositivos sin cámara trasera.
- **Servicio de Exportación en Scoped Storage (`@capacitor/filesystem` + `@capacitor/share`)**:
  - Sustituye las etiquetas `<a download>` y URLs Blob de navegador (incompatibles en WebView) por escritura atómica nativa en almacenamiento aislado y disparo de la hoja de compartir del sistema (`Intent.ACTION_SEND`).
  - Permite guardar o compartir directamente en Google Drive, WhatsApp, Galería, Archivos, Correo, etc.
- **Botón Atrás Físico de Android (`@capacitor/app`)**:
  - Cierra paneles flotantes, modales y bienvenida antes de salir de la aplicación, proporcionando una experiencia nativa natural.
- **Barra de Estado Inmersiva (`@capacitor/status-bar`)**:
  - Fondo oscuro unificado (`#07090e`) con iconos claros en modo Edge-to-Edge.
- **Pantalla de Carga (Splash Screen) (`@capacitor/splash-screen`)**:
  - Splash screen oscuro nativo con el imagotipo centrado de LolyLine.
  - Generado en todas las resoluciones para orientación vertical y horizontal (`drawable-port-*` y `drawable-land-*` de mdpi a xxxhdpi).
  - Soporte completo para el API de Splash Screen de Android 12+ (`values-v31/styles.xml`).
- **Iconos Adaptativos (Adaptive Icons)**:
  - Mipmaps de alta resolución generados desde `icon-store-512.png` para densidades mdpi, hdpi, xhdpi, xxhdpi y xxxhdpi (versiones estándar, circular y adaptive foreground/background).
- **Desactivación de Service Worker en Entorno Nativo**:
  - Detección de plataforma nativa vía `Capacitor.isNativePlatform()` para evitar el almacenamiento en caché obsoleto en WebViews nativas, conservando el soporte PWA completo cuando se accede desde navegadores web estándar.

#### 4. Modelo Freemium & LolyLine Pro (Fase 4)
- **Modal LolyLine Pro (`#lolyProModal`)**:
  - Interfaz de compra elegante con estilo dark mode, pill dorado animado y desglose de valor.
  - Botón de compra dinámica con precio localizado (`2,99 €` / `$2.99`). Prohibido precios estáticos quemados en código.
  - Botón de restauración de compras (`Restaurar compras` / `Restore purchases`) conforme a los requisitos de Google Play y Amazon.
- **Marca de Agua en Versión Gratuita**:
  - Gratuito: Acceso ilimitado a los 22 algoritmos de trazado y ajustes en vivo. Exportación PNG con marca de agua discreta y elegante (`LolyLine • Single Line Art`).
  - Pro: Exportación de Vector SVG Master puro sin marcas (ideal para plotters de corte, CNC, tatuajes y bordado), exportación PNG Ultra HD sin marca de agua, y exportación de vídeo time-lapse sin marca.
- **Persistencia y Caché Offline**:
  - El estado Pro se valida y cachea localmente (`localStorage`), garantizando que los usuarios con licencia Pro sigan disfrutando de todas las funciones sin necesidad de conexión a Internet.

#### 5. Arquitectura Multi-Tienda (Google Play & Amazon Appstore)
- **Flavors Gradle (`play` y `amazon`)**:
  - `play`: Generación de Android App Bundle (`.aab`) mediante `./gradlew bundlePlayRelease`.
  - `amazon`: Generación de APK universal (`.apk`) mediante `./gradlew assembleAmazonRelease`.
- **Compatibilidad 100% Fire OS (Amazon)**:
  - Cero dependencias obligatorias de Google Play Services en el código base común, eliminando cierres inesperados en tablets Amazon Fire.
- **Firma Segura Sin Secretos en el Repositorio**:
  - `signingConfigs.release` lee dinámicamente las rutas de keystore y contraseñas desde variables de entorno o archivo externo `gradle.properties` fuera del control de versiones.

#### 6. Política de Privacidad y Cumplimiento Legal
- Documentación bilingüe (Español / Inglés):
  - [`PRIVACY_POLICY.md`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/mobile/PRIVACY_POLICY.md)
  - [`privacy-policy.html`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/mobile/privacy-policy.html)
- Declaración de procesamiento 100% local en el dispositivo del usuario: cero recopilación de datos, cero rastreadores, cero cookies de analítica y cero subida de imágenes a servidores externos. Cumple rigurosamente con las directrices de Seguridad de los Datos (Data Safety) de Google Play y Amazon Appstore.

---

### 🔧 Especificaciones Técnicas
- **Plataforma**: Android (API 24+ / Android 7.0 Nougat hasta Android 15 / API 35).
- **Target SDK**: 35 (cumple el requisito vigente de Google Play y Amazon).
- **Compile SDK**: 35.
- **Android Gradle Plugin**: 8.2.1 (compatible con Gradle 8.2.1+).
- **Entorno de Compilación**: JDK 17 (JBR 17.0.14+1).
- **Core Web Engine**: HTML5 Canvas 2D + Web Workers multihilo para cálculo intensivo sin congelar la interfaz.
