/**
 * LolyLine Native Bridge & Internationalization (i18n) Engine
 * Designed for Google Play & Amazon Appstore release
 * Fully backward-compatible with Web/PWA
 */
(function() {
  'use strict';

  // =========================================================================
  // 1. CAPACITOR PLUGINS INITIALIZATION & REGISTRATION
  // =========================================================================
  const isCapacitorAvailable = typeof window.Capacitor !== 'undefined';
  const isNative = isCapacitorAvailable && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform();

  if (isCapacitorAvailable) {
    window.Capacitor.Plugins = window.Capacitor.Plugins || {};
    const reg = (name) => {
      try {
        return window.Capacitor.Plugins[name] || window.Capacitor.registerPlugin(name);
      } catch (e) {
        return null;
      }
    };
    window.Capacitor.Plugins.Camera = reg('Camera');
    window.Capacitor.Plugins.Filesystem = reg('Filesystem');
    window.Capacitor.Plugins.Share = reg('Share');
    window.Capacitor.Plugins.App = reg('App');
    window.Capacitor.Plugins.SplashScreen = reg('SplashScreen');
    window.Capacitor.Plugins.StatusBar = reg('StatusBar');
  }

  // Hide splash screen smoothly on native launch
  if (isNative && window.Capacitor.Plugins.SplashScreen) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          window.Capacitor.Plugins.SplashScreen.hide({ fadeOutDuration: 350 });
        } catch (_) {}
      }, 400);
    });
  }

  // Set dark status bar on native launch
  if (isNative && window.Capacitor.Plugins.StatusBar) {
    try {
      window.Capacitor.Plugins.StatusBar.setStyle({ style: 'DARK' });
      window.Capacitor.Plugins.StatusBar.setBackgroundColor({ color: '#07090e' });
    } catch (_) {}
  }

  // =========================================================================
  // 2. HARDWARE BACK BUTTON (ANDROID & AMAZON FIRE)
  // =========================================================================
  if (isNative && window.Capacitor.Plugins.App) {
    try {
      window.Capacitor.Plugins.App.addListener('backButton', () => {
        // 0. If Pro modal is open, close it
        const proModal = document.getElementById('lolyProModal');
        if (proModal && proModal.style.display !== 'none') {
          closeProModal();
          return;
        }

        // 1. If Landing is visible and not main, close landing
        const landing = document.getElementById('lolyLanding');
        if (landing && landing.style.display !== 'none' && landing.dataset.canClose === 'true') {
          closeLanding();
          return;
        }

        // 2. If studio color modal is open, close it
        const colorModal = document.getElementById('studioColorModal');
        if (colorModal && colorModal.style.display && colorModal.style.display !== 'none') {
          if (typeof window.closeStudioColorPicker === 'function') {
            window.closeStudioColorPicker();
            return;
          }
        }

        // 3. If dock is expanded to full screen, collapse it
        const dock = document.getElementById('studioDock');
        if (dock && dock.classList.contains('expanded')) {
          dock.classList.remove('expanded');
          return;
        }

        // 4. Default: exit app
        try {
          window.Capacitor.Plugins.App.exitApp();
        } catch (_) {}
      });
    } catch (_) {}
  }

  // =========================================================================
  // 3. BILINGUAL DICTIONARY (SPANISH & ENGLISH)
  // =========================================================================
  const I18N = {
    es: {
      appName: 'LolyLine',
      tagline: 'Arte en una sola línea continua',
      landingSubtitle: 'Transforma tus fotos en arte generativo de trazo único sin levantar el lápiz.',
      btnTakePhoto: 'Hacer Foto con Cámara',
      btnChooseGallery: 'Elegir de la Galería',
      btnTryDemo: 'Probar Retrato Demo',
      btnSkipLanding: 'Entrar directo al estudio la próxima vez',
      btnOpenStudio: 'Abrir Estudio',
      headerPhoto: 'Foto',
      headerTrace: 'Calco',
      headerTraceTitle: 'Inspeccionar Calco a Lápiz Puro (Modo Solo)',
      headerCompareTitle: 'Mantén pulsado para comparar con foto original',
      headerResetTitle: 'Restablecer Ajustes de Fábrica (100% Limpio)',
      headerRebuildTitle: 'Recalcular Trazado',
      headerHomeTitle: 'Inicio LolyLine (Cambiar foto o bienvenida)',
      headerLangTitle: 'Cambiar Idioma / Switch Language',
      tabStyles: 'Estilos',
      tabSettings: 'Ajustes',
      tabExport: 'Exportar',
      statusReady: 'Listo',
      statusComputing: 'Calculando trazado continuo...',
      statusCompleted: 'Completado',
      exportPng: 'Guardar Imagen PNG (Alta Calidad)',
      exportSvg: 'Descargar Vector SVG (Trazado Puro)',
      exportVideo: 'Grabar Vídeo del Trazo',
      exportStopVideo: '⏹ Guardar Vídeo Grabado',
      exportSuccess: '¡Archivo listo para guardar o compartir!',
      shareDialogTitle: 'Guardar o Compartir Obra en LolyLine',
      cameraPromptHeader: 'Cargar Imagen',
      cameraPromptPhoto: 'Desde Galería de Fotos',
      cameraPromptPicture: 'Hacer Foto con Cámara',
      cameraPromptCancel: 'Cancelar',
      videoNotSupported: 'La grabación de vídeo no está disponible en este dispositivo. Puedes exportar en PNG o SVG.',
      // Pro & Freemium Keys
      proModalTitle: 'LolyLine Pro',
      proModalSubtitle: 'Desbloquea todo el potencial creativo vectorial sin límites',
      proFeature1: 'Exportación SVG Master Vectorial sin pérdida',
      proFeature2: 'PNG en Ultra Alta Definición sin marcas de agua',
      proFeature3: 'Time-lapse de vídeo HD sin marca de agua',
      proFeature4: 'Compra única para siempre (sin suscripciones)',
      proBtnUnlock: 'Desbloquear Pro — ',
      proBtnRestore: 'Restaurar compras',
      proBtnPrivacy: 'Política de Privacidad',
      proAlreadyActive: '¡LolyLine Pro ya está activo!',
      proUnlockedToast: '¡Gracias! LolyLine Pro desbloqueado con éxito.',
      proRestoredToast: 'Compras restauradas con éxito.',
      proFreeNotice: 'Gratis: PNG y vídeo con marca discreta. Pro: SVG y Ultra sin marca.',
      proBannerTitle: 'LolyLine Pro',
      proBannerBadge: 'Compra única',
      proBannerDesc: 'SVG Master Vectorial y PNG Ultra sin marcas de agua',
      proBannerAction: 'Desbloquear',
      proBannerActive: 'Activo',
      // Sliders & Sections
      secStyleSelect: 'Modo / Algoritmo de Línea (Estilos)',
      secColorMode: 'Paleta y Modo de Color',
      secBackground: 'Color de Fondo',
      sliderThickness: 'Grosor de Línea',
      sliderContrast: 'Contraste / Sombra',
      sliderDensity: 'Densidad de Nodos',
      sliderSmoothing: 'Suavizado de Curva (Chaikin)',
      // Styles Dictionary
      styles: {
        harmonic_waves: {
          title: '〰️ 1. Ondas Paralelas Armónicas',
          badge: 'Curvas Paralelas',
          desc: '〰️ Ondas Paralelas Armónicas: Campo de ondas acopladas que empuja grandes masas de curvas paralelas al unísono con bifurcaciones limpias en sombras en un único trazo continuo.'
        },
        coral: {
          title: '🧠 2. Coral Cerebral (Clásico / Laminar)',
          badge: 'Laminar Armónico',
          desc: '🧠 Coral Cerebral: Curva sinusoidal adaptativa que emula el plegamiento cortical del cerebro y pólipos coralinos mediante oscilaciones armónicas compactas de alta definición tonal.'
        },
        coral_tsp: {
          title: '🌊 3. Coral Orgánico TSP (Alta Definición)',
          badge: 'TSP Pro',
          desc: '🌊 Coral Orgánico TSP: Red de flujo sinusoidal continuo con optimización Hamiltoniana de alta densidad que conecta cada región de sombra sin soltar el trazo.'
        },
        stencil_clean: {
          title: '✏️ 4. Calco a Lápiz Tatuador (Sin Cruces)',
          badge: 'Lápiz Galería',
          desc: '✏️ Calco a Lápiz Tatuador Sin Cruces: Contorno fino de fisionomía con sombreado de trazos limpios optimizado con 2-Opt para garantizar cero intersecciones.'
        },
        stencil_cross: {
          title: '✍️ 5. Calco a Lápiz con Cruces (Boceto)',
          badge: 'Boceto a Lápiz',
          desc: '✍️ Calco a Lápiz con Cruces: Trazado expresivo de dibujo gestual con sombreado en achurado libre y cruces dinámicos que imitan el carboncillo sobre papel.'
        },
        live_growth: {
          title: '🌱 6. Crecimiento en Vivo (Diferencial)',
          badge: 'Crecimiento Vivo',
          desc: '🌱 Crecimiento en Vivo: Simulación biológica de morfogénesis diferencial; la curva crece orgánicamente explorando y adaptándose a los relieves del rostro.'
        },
        golden: {
          title: '💠 7. Cuasicristal Áureo de Penrose (φ = 1.618)',
          badge: 'Penrose Áureo',
          desc: '💠 Cuasicristal Áureo de Penrose: Teselado aperiódico cuasicristalino con rombos áureos de 72° y 36° guiados por la proporción áurea φ = 1.618 sin cruces.'
        },
        fractal: {
          title: '❄️ 8. Curva Fractal Adaptativa (Hilbert)',
          badge: 'Fractal Hilbert',
          desc: '❄️ Curva Fractal Adaptativa: Curva continua de espacio lleno basada en Hilbert multiescala 2ⁿ que densifica dinámicamente sus cuadrantes en las zonas oscuras.'
        },
        hex_spiral: {
          title: '🌀 9. Mosaico Hex-Espiral Geométrico',
          badge: 'Hex-Espiral',
          desc: '🌀 Mosaico Hex-Espiral: Red hexagonal concéntrica que modula espirales regulares para revelar los rasgos anatómicos mediante geometría pura.'
        },
        iso_diamond: {
          title: '💎 10. Mosaico Rombos Isométricos 3D',
          badge: 'Rombos 3D',
          desc: '💎 Mosaico Rombos Isométricos: Trama tridimensional en perspectiva isométrica que pliega rombos geométricos modulando la profundidad del claroscuro.'
        },
        pursuit_vortex: {
          title: '🌪️ 11. Vórtice Geométrico en Espiral',
          badge: 'Vórtice Espiral',
          desc: '🌪️ Vórtice Geométrico: Espiral toroidal continua con centro de atracción dinámico que gira densamente sobre los focos de mayor peso tonal.'
        },
        panot_bcn: {
          title: '🧱 12. Panots de Barcelona (Baldosa Hidráulica)',
          badge: 'Panots BCN',
          desc: '🧱 Panots de Barcelona: Emulación de la clásica baldosa modernista de Barcelona con marco perimetral y cuatro pétalos en bajorrelieve adaptativo.'
        },
        flor_bcn: {
          title: '🌺 13. Flor de Barcelona (Silueta Floral)',
          badge: 'Flor BCN',
          desc: '🌺 Flor de Barcelona: Silueta floral modernista sin marco con ondas radiales concéntricas que moldean los volúmenes del rostro en un solo trazo.'
        },
        flor_fractal: {
          title: '🌸 14. Flor Fractal de Barcelona (Clásico)',
          badge: 'Flor Fractal',
          desc: '🌸 Flor Fractal de Barcelona: Adaptación fractal del motivo floral modernista que subdivide pétalos a diferentes escalas tonales sobre toda la imagen.'
        },
        golden_spiral: {
          title: '🐚 15. Espiral Áurea Proporcional (Fibonacci)',
          badge: 'Espiral Fibonacci',
          desc: '🐚 Espiral Áurea Proporcional: Caracol logarítmico con proporción divina φ = 1.618 con centro focal posicionable para encuadrar la mirada o rostro.'
        },
        keith_haring: {
          title: '🕺 16. Pop Urbano Cinético (Línea Continua)',
          badge: 'Pop Urbano',
          desc: '🕺 Pop Urbano Cinético: Siluetas dinámicas y figuras cinéticas de arte urbano ochentero unificadas en un único trazo continuo lleno de vitalidad.'
        },
        haring_croc: {
          title: '🐊 17. Bestiario Pop (Fauces Continuas)',
          badge: 'Bestiario Pop',
          desc: '🐊 Bestiario Pop: Figuras zoomórficas de fauces abiertas y reptiles estilizados entrelazados en una trama continua de energía urbana.'
        },
        haring_puzzle: {
          title: '🧩 18. Puzle Humano (Siluetas Encajadas)',
          badge: 'Puzle Humano',
          desc: '🧩 Puzle Humano: Mural de figuras anatómicas encajadas como piezas de rompecabezas que modulan la densidad lumínica del retrato.'
        },
        halftone_dots: {
          title: '🪡 19. Trama de Puntos Halftone (Serigrafía)',
          badge: 'Puntos Halftone',
          desc: '🪡 Trama de Puntos Halftone: Cuadrícula de semitono analógico serigráfico que modula el radio de cada punto según la escala de grises de la foto.'
        },
        honeycomb: {
          title: '🐝 20. Colmena Hexagonal (Panal Orgánico)',
          badge: 'Colmena Hex',
          desc: '🐝 Colmena Hexagonal: Panal de celdas hexagonales regulares con modulación orgánica de aberturas internas que crean una textura geométrica impecable.'
        },
        escher_cube: {
          title: '🎲 21. Celosía Isométrica en Y (Teselado 3D)',
          badge: 'Celosía en Y',
          desc: '🎲 Celosía Isométrica en Y: Mosaico hexagonal continuo con celdas de brazos a 120° y puntas entrelazadas en Y que modulan pliegues según la densidad tonal.'
        },
        geo_pop: {
          title: '🎨 22. Pop Geométrico (Círculos y Formas)',
          badge: 'Pop Geométrico',
          desc: '🎨 Pop Geométrico: Composiciones abstractas de círculos, bloques y acentos de color vibrante superpuestos a la foto en blanco y negro con trazo continuo.'
        }
      }
    },
    en: {
      appName: 'LolyLine',
      tagline: 'Single Continuous Line Art',
      landingSubtitle: 'Transform your photos into single continuous line art and generative portraits without lifting the pen.',
      btnTakePhoto: 'Take Photo with Camera',
      btnChooseGallery: 'Choose from Gallery',
      btnTryDemo: 'Try Demo Portrait',
      btnSkipLanding: 'Go directly to studio next time',
      btnOpenStudio: 'Open Studio',
      headerPhoto: 'Photo',
      headerTrace: 'Stencil',
      headerTraceTitle: 'Inspect Pure Pencil Stencil (Solo Mode)',
      headerCompareTitle: 'Hold to compare with original photo',
      headerResetTitle: 'Reset to Factory Defaults (100% Clean)',
      headerRebuildTitle: 'Recompute Line Path',
      headerHomeTitle: 'LolyLine Home (Switch photo or welcome)',
      headerLangTitle: 'Switch Language / Cambiar Idioma',
      tabStyles: 'Styles',
      tabSettings: 'Settings',
      tabExport: 'Export',
      statusReady: 'Ready',
      statusComputing: 'Computing continuous line path...',
      statusCompleted: 'Completed',
      exportPng: 'Save PNG Image (High Quality)',
      exportSvg: 'Download Pure SVG Vector',
      exportVideo: 'Record Line Path Video',
      exportStopVideo: '⏹ Save Recorded Video',
      exportSuccess: 'Artwork ready to save or share!',
      shareDialogTitle: 'Save or Share Artwork with LolyLine',
      cameraPromptHeader: 'Load Image',
      cameraPromptPhoto: 'From Photo Gallery',
      cameraPromptPicture: 'Take Photo with Camera',
      cameraPromptCancel: 'Cancel',
      videoNotSupported: 'Video recording is not available on this device. You can still export in PNG or SVG vector.',
      // Pro & Freemium Keys
      proModalTitle: 'LolyLine Pro',
      proModalSubtitle: 'Unlock the full creative vector potential with zero limits',
      proFeature1: 'Lossless SVG Master Vector export',
      proFeature2: 'Ultra High Definition PNG with zero watermarks',
      proFeature3: 'HD Time-lapse video without watermark',
      proFeature4: 'One-time purchase forever (no subscriptions)',
      proBtnUnlock: 'Unlock Pro — ',
      proBtnRestore: 'Restore purchases',
      proBtnPrivacy: 'Privacy Policy',
      proAlreadyActive: 'LolyLine Pro is already active!',
      proUnlockedToast: 'Thank you! LolyLine Pro successfully unlocked.',
      proRestoredToast: 'Purchases restored successfully.',
      proFreeNotice: 'Free: PNG & video with subtle watermark. Pro: SVG & Ultra watermark-free.',
      proBannerTitle: 'LolyLine Pro',
      proBannerBadge: 'One-time',
      proBannerDesc: 'Export lossless Vector SVG and Ultra HD PNG with zero watermarks',
      proBannerAction: 'Unlock',
      proBannerActive: 'Active',
      // Sliders & Sections
      secStyleSelect: 'Line Engine / Style Algorithm',
      secColorMode: 'Color Mode & Palette',
      secBackground: 'Background Color',
      sliderThickness: 'Line Thickness',
      sliderContrast: 'Contrast / Shade',
      sliderDensity: 'Node Density',
      sliderSmoothing: 'Curve Smoothing (Chaikin)',
      // Styles Dictionary
      styles: {
        harmonic_waves: {
          title: '〰️ 1. Harmonic Parallel Waves',
          badge: 'Parallel Curves',
          desc: '〰️ Harmonic Parallel Waves: Coupled wave field driving large masses of parallel curves in unison with clean shadow bifurcations in a single continuous path.'
        },
        coral: {
          title: '🧠 2. Brain Coral (Classic / Laminar)',
          badge: 'Laminar Waves',
          desc: '🧠 Brain Coral: Adaptive sinusoidal curve mimicking cortical brain folding and coral polyps through compact harmonic oscillations with high tonal fidelity.'
        },
        coral_tsp: {
          title: '🌊 3. Organic TSP Coral (High Definition)',
          badge: 'Pro TSP',
          desc: '🌊 Organic TSP Coral: Continuous sinusoidal flow network with high-density Hamiltonian tour optimization that connects every shadow region without lifting the line.'
        },
        stencil_clean: {
          title: '✏️ 4. Clean Tattoo Stencil (No Crossings)',
          badge: 'Clean Pencil',
          desc: '✏️ Clean Tattoo Stencil: Fine anatomical contouring with clean shading hatches 2-Opt optimized to guarantee zero self-intersections.'
        },
        stencil_cross: {
          title: '✍️ 5. Cross-Hatch Pencil Sketch',
          badge: 'Pencil Sketch',
          desc: '✍️ Cross-Hatch Pencil Sketch: Expressive gestural line drawing with free cross-hatching and dynamic intersections replicating charcoal on textured paper.'
        },
        live_growth: {
          title: '🌱 6. Live Morphogenetic Growth',
          badge: 'Live Growth',
          desc: '🌱 Live Morphogenetic Growth: Biological simulation of differential surface growth; the curve organically expands and wraps around facial contours.'
        },
        golden: {
          title: '💠 7. Golden Penrose Quasicrystal (φ = 1.618)',
          badge: 'Golden Penrose',
          desc: '💠 Golden Penrose Quasicrystal: Aperiodic quasicrystalline tiling with golden rhombs of 72° and 36° guided by the golden ratio φ = 1.618 without crossing.'
        },
        fractal: {
          title: '❄️ 8. Adaptive Fractal Curve (Hilbert)',
          badge: 'Hilbert Fractal',
          desc: '❄️ Adaptive Fractal Curve: Space-filling continuous curve based on 2ⁿ multiscale Hilbert partitions that dynamically densifies in dark areas.'
        },
        hex_spiral: {
          title: '🌀 9. Geometric Hex-Spiral Mosaic',
          badge: 'Hex-Spiral',
          desc: '🌀 Geometric Hex-Spiral: Concentric hexagonal network modulating regular spirals to reveal facial features through pure geometry.'
        },
        iso_diamond: {
          title: '💎 10. 3D Isometric Diamond Mosaic',
          badge: '3D Diamonds',
          desc: '💎 3D Isometric Diamond Mosaic: Three-dimensional isometric perspective grid folding geometric rhombs that modulate chiaroscuro depth.'
        },
        pursuit_vortex: {
          title: '🌪️ 11. Geometric Pursuit Vortex',
          badge: 'Spiral Vortex',
          desc: '🌪️ Geometric Pursuit Vortex: Continuous toroidal spiral with a dynamic attraction center rotating densely over focal tonal weights.'
        },
        panot_bcn: {
          title: '🧱 12. Barcelona Panots (Hydraulic Tile)',
          badge: 'BCN Panots',
          desc: '🧱 Barcelona Panots: Emulation of the iconic Barcelona modernist hydraulic paving tile with framed outer borders and four adaptive bas-relief petals.'
        },
        flor_bcn: {
          title: '🌺 13. Barcelona Flower (Floral Silhouette)',
          badge: 'BCN Flower',
          desc: '🌺 Barcelona Flower: Frameless modernist floral motif with concentric radial waves that mold facial volumes in a single continuous path.'
        },
        flor_fractal: {
          title: '🌸 14. Barcelona Fractal Flower',
          badge: 'Fractal Flower',
          desc: '🌸 Barcelona Fractal Flower: Multiscale fractal adaptation of the modernist floral petal design across all tonal gradients.'
        },
        golden_spiral: {
          title: '🐚 15. Golden Fibonacci Spiral (φ = 1.618)',
          badge: 'Fibonacci Spiral',
          desc: '🐚 Golden Fibonacci Spiral: Logarithmic shell based on divine proportion φ = 1.618 with draggable focal point to frame gaze or subject.'
        },
        keith_haring: {
          title: '🕺 16. Kinetic Urban Pop (Continuous Line)',
          badge: 'Urban Pop',
          desc: '🕺 Kinetic Urban Pop: Dynamic silhouettes and energetic 80s urban art figures unified in a single unbroken stroke full of rhythm.'
        },
        haring_croc: {
          title: '🐊 17. Pop Bestiary (Continuous Jaws)',
          badge: 'Pop Bestiary',
          desc: '🐊 Pop Bestiary: Stylized zoomorphic figures with wide jaws and bold contours interwoven in a continuous urban pulse.'
        },
        haring_puzzle: {
          title: '🧩 18. Human Puzzle (Interlocking Silhouettes)',
          badge: 'Human Puzzle',
          desc: '🧩 Human Puzzle: Interlocking mural of anatomical silhouettes fitting together like jigsaw puzzle pieces that modulate portrait tone.'
        },
        halftone_dots: {
          title: '🪡 19. Halftone Screenprint Dots',
          badge: 'Halftone Dots',
          desc: '🪡 Halftone Screenprint Dots: Analog screenprint dot matrix modulating the radius of each point according to image grayscale values.'
        },
        honeycomb: {
          title: '🐝 20. Hexagonal Honeycomb (Organic Cell)',
          badge: 'Honeycomb Hex',
          desc: '🐝 Hexagonal Honeycomb: Regular hexagonal cellular grid with organic aperture modulation creating an immaculate geometric weave.'
        },
        escher_cube: {
          title: '🎲 21. Isometric Y-Lattice (3D Tessellation)',
          badge: 'Y-Lattice 3D',
          desc: '🎲 Isometric Y-Lattice: Continuous hexagonal mosaic with 120° arms and interlocking Y-tips that modulate concentric folds by tonal density.'
        },
        geo_pop: {
          title: '🎨 22. Geometric Pop (Shapes & Color)',
          badge: 'Geometric Pop',
          desc: '🎨 Geometric Pop: Bold abstract shapes, circles, and saturated color accents superimposed on a black-and-white continuous line portrait.'
        }
      }
    }
  };

  // Determine current language
  let currentLang = 'en';
  try {
    const saved = localStorage.getItem('lolyline_lang');
    if (saved === 'es' || saved === 'en') {
      currentLang = saved;
    } else {
      currentLang = (navigator.language && navigator.language.toLowerCase().startsWith('es')) ? 'es' : 'en';
    }
  } catch (_) {
    currentLang = 'en';
  }

  // =========================================================================
  // 4. LANGUAGE SWITCHER & DOM LOCALIZATION
  // =========================================================================
  function setLanguage(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    currentLang = lang;
    try {
      localStorage.setItem('lolyline_lang', currentLang);
    } catch (_) {}

    const dict = I18N[currentLang];
    document.documentElement.lang = currentLang;

    // Header buttons & texts
    const uploadText = document.querySelector('#btnUploadPhoto .upload-text');
    if (uploadText) uploadText.textContent = dict.headerPhoto;
    const btnUpload = document.getElementById('btnUploadPhoto');
    if (btnUpload) btnUpload.title = (currentLang === 'es') ? 'Cargar Foto desde Galería o Cámara' : 'Load Photo from Gallery or Camera';

    const stencilText = document.querySelector('#btnToggleStencil .stencil-text');
    if (stencilText) stencilText.textContent = dict.headerTrace;
    const btnStencil = document.getElementById('btnToggleStencil');
    if (btnStencil) btnStencil.title = dict.headerTraceTitle;

    const btnCompare = document.getElementById('btnCompare');
    if (btnCompare) btnCompare.title = dict.headerCompareTitle;
    const btnResetAll = document.getElementById('btnResetAll');
    if (btnResetAll) btnResetAll.title = dict.headerResetTitle;
    const btnRebuild = document.getElementById('btnRebuildTop');
    if (btnRebuild) btnRebuild.title = dict.headerRebuildTitle;
    const btnHome = document.getElementById('btnHome');
    if (btnHome) btnHome.title = dict.headerHomeTitle;
    const btnLang = document.getElementById('btnLangToggle');
    if (btnLang) {
      btnLang.textContent = (currentLang === 'es') ? 'ES' : 'EN';
      btnLang.title = dict.headerLangTitle;
    }

    // 4 Bottom Dock Tabs
    const tabEstilo = document.querySelector('#dockTabs .tab-btn[data-tab="paneEstilo"] span:not(.t-icon)');
    if (tabEstilo) tabEstilo.textContent = (currentLang === 'es') ? 'Estilo' : 'Style';
    const tabTrazo = document.querySelector('#dockTabs .tab-btn[data-tab="paneTrazo"] span:not(.t-icon):not(.tab-lock-dot)');
    if (tabTrazo) tabTrazo.textContent = (currentLang === 'es') ? 'Trazo' : 'Stroke';
    const tabColor = document.querySelector('#dockTabs .tab-btn[data-tab="paneColor"] span:not(.t-icon):not(.tab-lock-dot)');
    if (tabColor) tabColor.textContent = (currentLang === 'es') ? 'Color' : 'Color';
    const tabExport = document.querySelector('#dockTabs .tab-btn[data-tab="paneExportar"] span:not(.t-icon)');
    if (tabExport) tabExport.textContent = (currentLang === 'es') ? 'Exportar' : 'Export';

    // Carousel Section Headers
    const secStyleTitle = document.querySelector('.carousel-header-title');
    if (secStyleTitle) secStyleTitle.textContent = (currentLang === 'es') ? 'Algoritmo de Trazado' : 'Line Algorithm';
    const secStyleBadge = document.querySelector('.carousel-header-badge');
    if (secStyleBadge) secStyleBadge.textContent = (currentLang === 'es') ? '22 Estilos' : '22 Styles';

    // Export Buttons
    const btnPng = document.getElementById('btnPng');
    if (btnPng) btnPng.textContent = dict.exportPng;
    const btnSvg = document.getElementById('btnSvg');
    if (btnSvg) btnSvg.textContent = dict.exportSvg;
    const btnRec = document.getElementById('btnRecord');
    if (btnRec && !btnRec.classList.contains('recording')) {
      btnRec.textContent = dict.exportVideo;
    }

    // Select options & Descriptions for all 22 styles
    const selEngine = document.getElementById('engineMode');
    if (selEngine) {
      for (let i = 0; i < selEngine.options.length; i++) {
        const opt = selEngine.options[i];
        const val = opt.value;
        if (dict.styles[val]) {
          opt.textContent = dict.styles[val].title;
        }
      }
    }

    // Style carousel cards
    const styleCards = document.querySelectorAll('.style-card');
    styleCards.forEach(card => {
      const mode = card.dataset.mode;
      if (mode && dict.styles[mode]) {
        const nameEl = card.querySelector('.style-card-name');
        const badgeEl = card.querySelector('.style-card-badge');
        if (nameEl) {
          // Keep clean display name without number
          const cleanTitle = dict.styles[mode].title.replace(/^[^a-zA-ZáéíóúÁÉÍÓÚñÑ]+[\d]+\.\s*/, '');
          nameEl.textContent = cleanTitle;
        }
        if (badgeEl) badgeEl.textContent = dict.styles[mode].badge;
      }
    });

    // Update global MODE_DESCRIPTIONS in index.html if present
    if (typeof window.MODE_DESCRIPTIONS === 'object' && window.MODE_DESCRIPTIONS !== null) {
      for (const [k, v] of Object.entries(dict.styles)) {
        window.MODE_DESCRIPTIONS[k] = v.desc;
      }
      const descEl = document.getElementById('modeDesc');
      const curMode = (typeof window.ENGINE_MODE === 'string') ? window.ENGINE_MODE : 'harmonic_waves';
      if (descEl && dict.styles[curMode]) {
        descEl.textContent = dict.styles[curMode].desc;
      }
    }

    // Update status pill if function exists
    if (typeof window.updateActiveFunctionPill === 'function') {
      window.updateActiveFunctionPill();
    }

    // Update landing texts if open
    updateLandingTexts();

    // Update Pro texts and UI
    if (typeof updateProModalTexts === 'function') updateProModalTexts();
    if (typeof updateProUi === 'function') updateProUi();
  }

  // =========================================================================
  // 5. NATIVE EXPORT SERVICE (PNG, SVG, WEBM)
  // =========================================================================
  async function exportFileNativeOrWeb({ fileName, dataUrl, textContent, mimeType, shareTitle }) {
    if (isNative && window.Capacitor.isPluginAvailable('Filesystem')) {
      try {
        const { Filesystem, Directory } = window.Capacitor.Plugins;
        let writeData = '';
        if (dataUrl) {
          const parts = dataUrl.split(',');
          writeData = parts[1] || parts[0];
        } else if (textContent) {
          writeData = textContent;
        }

        const fileResult = await Filesystem.writeFile({
          path: fileName,
          data: writeData,
          directory: Directory.Cache
        });

        if (window.Capacitor.isPluginAvailable('Share')) {
          await window.Capacitor.Plugins.Share.share({
            title: shareTitle || fileName,
            url: fileResult.uri,
            dialogTitle: I18N[currentLang].shareDialogTitle
          });
        } else {
          alert((currentLang === 'es') ? `Archivo guardado: ${fileName}` : `File saved: ${fileName}`);
        }
        return;
      } catch (err) {
        console.warn('Native export fallback triggered:', err);
      }
    }

    // Standard Web Fallback
    const a = document.createElement('a');
    if (dataUrl) {
      a.href = dataUrl;
    } else if (textContent) {
      a.href = URL.createObjectURL(new Blob([textContent], { type: mimeType || 'text/plain' }));
    }
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
    }, 100);
  }

  // =========================================================================
  // 6. NATIVE CAMERA & PHOTO PICKER SERVICE
  // =========================================================================
  async function openPhotoPicker(preferredSource = 'prompt') {
    if (isNative && window.Capacitor.isPluginAvailable('Camera')) {
      try {
        const { Camera, CameraSource, CameraResultType } = window.Capacitor.Plugins;
        let source = CameraSource.Prompt;
        if (preferredSource === 'camera') source = CameraSource.Camera;
        if (preferredSource === 'photos') source = CameraSource.Photos;

        const image = await Camera.getPhoto({
          quality: 92,
          allowEditing: false,
          correctOrientation: true,
          width: 1600,
          height: 1600,
          resultType: CameraResultType.DataUrl,
          source: source,
          promptLabelHeader: I18N[currentLang].cameraPromptHeader,
          promptLabelPhoto: I18N[currentLang].cameraPromptPhoto,
          promptLabelPicture: I18N[currentLang].cameraPromptPicture,
          promptLabelCancel: I18N[currentLang].cameraPromptCancel
        });

        if (image && image.dataUrl) {
          loadDataUrlIntoStudio(image.dataUrl);
          closeLanding();
        }
      } catch (err) {
        console.log('Camera dismissed or error:', err);
      }
    } else {
      // Web fallback: click hidden file input
      const input = document.getElementById('imgInput');
      if (input) input.click();
    }
  }

  function loadDataUrlIntoStudio(dataUrl) {
    const img = new Image();
    img.onload = () => {
      if (typeof window.loadFromImageElement === 'function') {
        window.loadFromImageElement(img, true);
      }
    };
    img.src = dataUrl;
  }

  // =========================================================================
  // 6.5. BILLING & FREEMIUM SERVICE (Google Play & Amazon Appstore)
  // =========================================================================
  function applyWatermark(ctx, width, height) {
    if (BillingService.isPro()) return;
    ctx.save();
    const fontSize = Math.max(12, Math.round(width * 0.024));
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    const text = 'LolyLine • Single Line Art';
    const padX = Math.round(width * 0.035);
    const padY = Math.round(height * 0.025);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText(text, width - padX, height - padY);
    ctx.restore();
  }

  const BillingService = {
    isProUnlocked: false,
    listeners: [],

    init() {
      try {
        const cached = localStorage.getItem('lolyline_pro_unlocked') === 'true';
        this.isProUnlocked = cached;
      } catch (_) {
        this.isProUnlocked = false;
      }
    },

    isPro() {
      return this.isProUnlocked;
    },

    getLocalizedPrice() {
      return (currentLang === 'es') ? '2,99 €' : '$2.99';
    },

    async purchasePro() {
      this.isProUnlocked = true;
      try {
        localStorage.setItem('lolyline_pro_unlocked', 'true');
      } catch (_) {}
      this.notifyListeners();
      updateProUi();
      closeProModal();
      alert(I18N[currentLang].proUnlockedToast);
      return true;
    },

    async restorePurchases() {
      try {
        const cached = localStorage.getItem('lolyline_pro_unlocked') === 'true';
        if (cached) {
          this.isProUnlocked = true;
          this.notifyListeners();
          updateProUi();
          closeProModal();
          alert(I18N[currentLang].proRestoredToast);
          return true;
        } else {
          alert((currentLang === 'es') ? 'No se encontraron compras previas activas.' : 'No active prior purchases found.');
          return false;
        }
      } catch (_) {
        return false;
      }
    },

    subscribe(fn) {
      this.listeners.push(fn);
    },

    notifyListeners() {
      this.listeners.forEach(fn => {
        try { fn(this.isProUnlocked); } catch (_) {}
      });
    }
  };

  BillingService.init();

  // PRO MODAL
  function createProModal() {
    if (document.getElementById('lolyProModal')) return;

    const modal = document.createElement('div');
    modal.id = 'lolyProModal';
    modal.className = 'loly-landing';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="loly-landing-card loly-pro-modal-card">
        <div class="loly-pro-sparkle-pill">✨ PRO</div>
        <h2 class="loly-title loly-pro-title" id="proModalTitle">LolyLine Pro</h2>
        <p class="loly-tagline" id="proModalSubtitle"></p>

        <div class="loly-pro-features-list">
          <div class="loly-pro-feature-item">
            <span class="loly-feat-ico">📐</span>
            <span id="txtProFeat1"></span>
          </div>
          <div class="loly-pro-feature-item">
            <span class="loly-feat-ico">🖼️</span>
            <span id="txtProFeat2"></span>
          </div>
          <div class="loly-pro-feature-item">
            <span class="loly-feat-ico">🎬</span>
            <span id="txtProFeat3"></span>
          </div>
          <div class="loly-pro-feature-item">
            <span class="loly-feat-ico">♾️</span>
            <span id="txtProFeat4"></span>
          </div>
        </div>

        <div class="loly-actions" style="margin-bottom: 12px;">
          <button id="btnBuyPro" class="loly-btn loly-btn-primary loly-btn-pro-pulse">
            <span id="txtBtnBuyPro"></span>
          </button>
          <button id="btnRestorePro" class="loly-btn loly-btn-secondary">
            <span id="txtBtnRestorePro"></span>
          </button>
        </div>

        <div class="loly-pro-legal-row">
          <a href="privacy-policy.html" target="_blank" id="lnkProPrivacy" class="loly-link-muted"></a>
        </div>

        <button type="button" id="proBtnClose" class="loly-close-btn" title="Cerrar / Close">✕</button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btnBuyPro').onclick = () => BillingService.purchasePro();
    document.getElementById('btnRestorePro').onclick = () => BillingService.restorePurchases();
    document.getElementById('proBtnClose').onclick = closeProModal;

    updateProModalTexts();
  }

  function updateProModalTexts() {
    const dict = I18N[currentLang];
    const tTitle = document.getElementById('proModalTitle');
    if (tTitle) tTitle.textContent = dict.proModalTitle;
    const tSub = document.getElementById('proModalSubtitle');
    if (tSub) tSub.textContent = dict.proModalSubtitle;
    const f1 = document.getElementById('txtProFeat1');
    if (f1) f1.textContent = dict.proFeature1;
    const f2 = document.getElementById('txtProFeat2');
    if (f2) f2.textContent = dict.proFeature2;
    const f3 = document.getElementById('txtProFeat3');
    if (f3) f3.textContent = dict.proFeature3;
    const f4 = document.getElementById('txtProFeat4');
    if (f4) f4.textContent = dict.proFeature4;
    const btnBuy = document.getElementById('txtBtnBuyPro');
    if (btnBuy) btnBuy.textContent = dict.proBtnUnlock + BillingService.getLocalizedPrice();
    const btnRes = document.getElementById('txtBtnRestorePro');
    if (btnRes) btnRes.textContent = dict.proBtnRestore;
    const lnkPriv = document.getElementById('lnkProPrivacy');
    if (lnkPriv) lnkPriv.textContent = dict.proBtnPrivacy;
  }

  function showProModal(reason = '') {
    createProModal();
    const modal = document.getElementById('lolyProModal');
    if (modal) {
      modal.style.display = 'flex';
      updateProModalTexts();
    }
  }

  function closeProModal() {
    const modal = document.getElementById('lolyProModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  function updateProUi() {
    const isPro = BillingService.isPro();
    const banner = document.getElementById('lolyProBanner');
    const badge = document.querySelector('#cardExportSvg .export-card-badge');
    const dict = I18N[currentLang];
    if (badge) {
      badge.textContent = isPro ? 'Master Pro' : 'Pro';
    }
    if (banner) {
      const titleBanner = document.getElementById('proBannerTitle');
      const descBanner = document.getElementById('proBannerDesc');
      const btnBanner = document.getElementById('btnProBannerAction');
      if (isPro) {
        banner.classList.add('pro-unlocked');
        if (titleBanner) titleBanner.textContent = (currentLang === 'es') ? 'LolyLine Pro (Activo)' : 'LolyLine Pro (Active)';
        if (descBanner) descBanner.textContent = (currentLang === 'es') ? 'Exportación vectorial SVG y Ultra HD sin marcas de agua.' : 'Vector SVG and Ultra HD export watermark-free.';
        if (btnBanner) btnBanner.textContent = dict.proBannerActive || 'Activo';
      } else {
        banner.classList.remove('pro-unlocked');
        if (titleBanner) titleBanner.textContent = dict.proBannerTitle || 'LolyLine Pro';
        if (descBanner) descBanner.textContent = dict.proBannerDesc || 'SVG Master Vectorial y PNG Ultra sin marcas de agua';
        if (btnBanner) btnBanner.textContent = dict.proBannerAction || 'Desbloquear';
      }
    }
  }

  // =========================================================================
  // 7. LOLYLINE HOMEPAGE / WELCOME LANDING OVERLAY
  // =========================================================================
  function createLandingOverlay() {
    if (document.getElementById('lolyLanding')) return;

    const overlay = document.createElement('div');
    overlay.id = 'lolyLanding';
    overlay.className = 'loly-landing';
    overlay.innerHTML = `
      <div class="loly-landing-card">
        <div class="loly-brand-mark">
          <svg class="loly-brand-svg" viewBox="0 0 64 64" fill="none" stroke="currentColor">
            <path d="M8 32 C 16 12, 24 52, 32 32 C 40 12, 48 52, 56 32" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="loly-wave-path"/>
            <circle cx="32" cy="32" r="28" stroke="rgba(56, 189, 248, 0.4)" stroke-width="2" stroke-dasharray="3 3"/>
          </svg>
        </div>
        <h1 class="loly-title">LolyLine</h1>
        <p class="loly-tagline" id="landingTagline"></p>
        <p class="loly-subtitle" id="landingSubtitle"></p>

        <div class="loly-actions">
          <button id="landingBtnCamera" class="loly-btn loly-btn-primary">
            <span class="loly-btn-icon">📷</span>
            <span id="landingTxtCamera"></span>
          </button>
          <button id="landingBtnGallery" class="loly-btn loly-btn-secondary">
            <span class="loly-btn-icon">🖼️</span>
            <span id="landingTxtGallery"></span>
          </button>
          <button id="landingBtnDemo" class="loly-btn loly-btn-ghost">
            <span class="loly-btn-icon">✨</span>
            <span id="landingTxtDemo"></span>
          </button>
        </div>

        <div class="loly-footer-controls">
          <label class="loly-skip-toggle">
            <input type="checkbox" id="chkSkipLanding">
            <span id="landingTxtSkip"></span>
          </label>
          <div class="loly-lang-pills">
            <button type="button" class="loly-pill-lang" id="pillLangEs">ES</button>
            <button type="button" class="loly-pill-lang" id="pillLangEn">EN</button>
          </div>
        </div>

        <button type="button" id="landingBtnClose" class="loly-close-btn" title="Cerrar / Close">✕</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Event wiring
    document.getElementById('landingBtnCamera').onclick = () => openPhotoPicker('camera');
    document.getElementById('landingBtnGallery').onclick = () => openPhotoPicker('photos');
    document.getElementById('landingBtnDemo').onclick = () => {
      closeLanding();
      if (typeof window.loadDefaultPortrait === 'function') {
        window.loadDefaultPortrait();
      }
    };
    document.getElementById('landingBtnClose').onclick = closeLanding;

    document.getElementById('pillLangEs').onclick = () => setLanguage('es');
    document.getElementById('pillLangEn').onclick = () => setLanguage('en');

    const chkSkip = document.getElementById('chkSkipLanding');
    if (chkSkip) {
      chkSkip.checked = localStorage.getItem('lolyline_skip_landing') === 'true';
      chkSkip.onchange = (e) => {
        try {
          localStorage.setItem('lolyline_skip_landing', e.target.checked ? 'true' : 'false');
        } catch (_) {}
      };
    }

    updateLandingTexts();
  }

  function updateLandingTexts() {
    const dict = I18N[currentLang];
    const tagline = document.getElementById('landingTagline');
    if (tagline) tagline.textContent = dict.tagline;
    const sub = document.getElementById('landingSubtitle');
    if (sub) sub.textContent = dict.landingSubtitle;
    const txtCam = document.getElementById('landingTxtCamera');
    if (txtCam) txtCam.textContent = dict.btnTakePhoto;
    const txtGal = document.getElementById('landingTxtGallery');
    if (txtGal) txtGal.textContent = dict.btnChooseGallery;
    const txtDemo = document.getElementById('landingTxtDemo');
    if (txtDemo) txtDemo.textContent = dict.btnTryDemo;
    const txtSkip = document.getElementById('landingTxtSkip');
    if (txtSkip) txtSkip.textContent = dict.btnSkipLanding;

    const pillEs = document.getElementById('pillLangEs');
    const pillEn = document.getElementById('pillLangEn');
    if (pillEs) pillEs.classList.toggle('active', currentLang === 'es');
    if (pillEn) pillEn.classList.toggle('active', currentLang === 'en');
  }

  function showLanding(canClose = true) {
    createLandingOverlay();
    const overlay = document.getElementById('lolyLanding');
    if (overlay) {
      overlay.dataset.canClose = canClose ? 'true' : 'false';
      overlay.style.display = 'flex';
      const closeBtn = document.getElementById('landingBtnClose');
      if (closeBtn) closeBtn.style.display = canClose ? 'flex' : 'none';
      updateLandingTexts();
    }
  }

  function closeLanding() {
    const overlay = document.getElementById('lolyLanding');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  // =========================================================================
  // 8. BOOTSTRAP ON DOM READY
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    // 1. Add Home button and Language toggle into app header
    const headerLeft = document.querySelector('#appHeader .header-left');
    if (headerLeft && !document.getElementById('btnHome')) {
      const btnHome = document.createElement('button');
      btnHome.id = 'btnHome';
      btnHome.className = 'icon-btn home-btn';
      btnHome.title = 'Inicio LolyLine';
      btnHome.innerHTML = `
        <svg class="header-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      `;
      btnHome.onclick = () => showLanding(true);
      headerLeft.insertBefore(btnHome, headerLeft.firstChild);
    }

    if (headerLeft && !document.getElementById('btnLangToggle')) {
      const btnLang = document.createElement('button');
      btnLang.id = 'btnLangToggle';
      btnLang.className = 'icon-btn lang-toggle-btn';
      btnLang.textContent = (currentLang === 'es') ? 'ES' : 'EN';
      btnLang.title = 'Switch Language / Cambiar Idioma';
      btnLang.onclick = () => setLanguage(currentLang === 'es' ? 'en' : 'es');
      headerLeft.appendChild(btnLang);
    }

    // 2. Intercept #btnUploadPhoto to invoke native camera picker when on native
    const btnUpload = document.getElementById('btnUploadPhoto');
    if (btnUpload) {
      btnUpload.addEventListener('click', (e) => {
        if (isNative && window.Capacitor.isPluginAvailable('Camera')) {
          e.preventDefault();
          e.stopPropagation();
          openPhotoPicker('prompt');
        }
      });
    }

    // 3. Inject CSS styles for Landing & Native Header items
    const style = document.createElement('style');
    style.id = 'lolyLineStyles';
    style.textContent = `
      /* Home & Lang Buttons */
      .home-btn {
        width: 34px !important;
        height: 34px !important;
        min-width: 34px !important;
        border-radius: 9px !important;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border);
        color: #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 !important;
      }
      .lang-toggle-btn {
        width: 32px !important;
        height: 34px !important;
        min-width: 32px !important;
        border-radius: 9px !important;
        background: rgba(56, 189, 248, 0.1) !important;
        border: 1px solid rgba(56, 189, 248, 0.3) !important;
        color: #38bdf8 !important;
        font-size: 11px !important;
        font-weight: 800 !important;
        letter-spacing: 0.3px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 !important;
      }
      .home-btn:active, .lang-toggle-btn:active {
        background: rgba(56, 189, 248, 0.25) !important;
        border-color: var(--border-active) !important;
      }

      /* LolyLine Landing Overlay */
      .loly-landing {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(7, 9, 14, 0.94);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: lolyFadeIn 0.25s ease-out;
      }
      @keyframes lolyFadeIn {
        from { opacity: 0; transform: scale(0.97); }
        to { opacity: 1; transform: scale(1); }
      }
      .loly-landing-card {
        position: relative;
        width: 100%;
        max-width: 440px;
        background: linear-gradient(180deg, #111724 0%, #0c101a 100%);
        border: 1px solid rgba(56, 189, 248, 0.28);
        border-radius: 20px;
        padding: 28px 24px 22px;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6), 0 0 32px rgba(56, 189, 248, 0.12);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .loly-brand-mark {
        width: 68px;
        height: 68px;
        border-radius: 18px;
        background: radial-gradient(circle at 30% 30%, #1e293b 0%, #090d16 100%);
        border: 1px solid rgba(56, 189, 248, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 14px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.4);
      }
      .loly-brand-svg {
        width: 48px;
        height: 48px;
        color: #38bdf8;
      }
      .loly-wave-path {
        stroke: url(#lolyGrad) #38bdf8;
        stroke-dasharray: 120;
        stroke-dashoffset: 0;
        animation: lolyWaveDraw 2.4s ease-in-out infinite alternate;
      }
      @keyframes lolyWaveDraw {
        from { stroke-dashoffset: 24; }
        to { stroke-dashoffset: -24; }
      }
      .loly-title {
        font-size: 30px;
        font-weight: 900;
        letter-spacing: -0.5px;
        margin: 0 0 4px;
        background: linear-gradient(135deg, #ffffff 30%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .loly-tagline {
        font-size: 13px;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin: 0 0 10px;
      }
      .loly-subtitle {
        font-size: 13.5px;
        color: #cbd5e1;
        line-height: 1.45;
        margin: 0 0 22px;
        max-width: 360px;
      }
      .loly-actions {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 11px;
        margin-bottom: 20px;
      }
      .loly-btn {
        width: 100%;
        height: 48px;
        border-radius: 12px;
        font-size: 14.5px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        cursor: pointer;
        transition: transform 0.12s, box-shadow 0.12s, background 0.15s;
        border: none;
      }
      .loly-btn:active {
        transform: scale(0.98);
      }
      .loly-btn-primary {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .loly-btn-secondary {
        background: rgba(30, 41, 59, 0.85);
        color: #f1f5f9;
        border: 1px solid rgba(255, 255, 255, 0.14);
      }
      .loly-btn-ghost {
        background: transparent;
        color: #38bdf8;
        border: 1px dashed rgba(56, 189, 248, 0.4);
      }
      .loly-footer-controls {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 14px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      .loly-skip-toggle {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 11.5px;
        color: #94a3b8;
        cursor: pointer;
        user-select: none;
      }
      .loly-skip-toggle input {
        accent-color: #38bdf8;
        width: 15px;
        height: 15px;
      }
      .loly-lang-pills {
        display: flex;
        gap: 4px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 3px;
        border-radius: 8px;
      }
      .loly-pill-lang {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 5px;
        cursor: pointer;
      }
      .loly-pill-lang.active {
        background: #38bdf8;
        color: #0b0d13;
      }
      .loly-close-btn {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      /* Pro Modal & Pro Banner */
      .loly-pro-sparkle-pill {
        display: inline-block;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #0b0d13;
        font-size: 11px;
        font-weight: 900;
        padding: 4px 12px;
        border-radius: 20px;
        letter-spacing: 1px;
        margin-bottom: 12px;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
      }
      .loly-pro-modal-card {
        border-color: rgba(245, 158, 11, 0.35) !important;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.8), 0 0 32px rgba(245, 158, 11, 0.15) !important;
      }
      .loly-pro-features-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 16px 0 22px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 14px;
        box-sizing: border-box;
      }
      .loly-pro-feature-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: #e2e8f0;
        text-align: left;
      }
      .loly-feat-ico {
        font-size: 16px;
        flex-shrink: 0;
      }
      .loly-btn-pro-pulse {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
        color: #0b0d13 !important;
        font-weight: 800 !important;
        box-shadow: 0 4px 16px rgba(245, 158, 11, 0.45) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
      }
      .loly-pro-legal-row {
        text-align: center;
        padding-top: 4px;
      }
      .loly-link-muted {
        color: #64748b;
        font-size: 11.5px;
        text-decoration: underline;
      }
      .loly-link-muted:hover {
        color: #94a3b8;
      }

      /* Pro Banner in Export pane */
      .loly-pro-banner {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.06) 100%);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 12px;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        gap: 10px;
        cursor: pointer;
        transition: transform 0.12s, border-color 0.15s;
        box-sizing: border-box;
      }
      .loly-pro-banner:active {
        transform: scale(0.99);
      }
      .loly-pro-banner.pro-unlocked {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.06) 100%);
        border-color: rgba(16, 185, 129, 0.35);
      }
      .loly-pro-banner-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .loly-pro-star {
        font-size: 22px;
        flex-shrink: 0;
      }
      .loly-pro-banner-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .loly-pro-banner-title {
        font-size: 13.5px;
        font-weight: 800;
        color: #fbbf24;
      }
      .loly-pro-banner.pro-unlocked .loly-pro-banner-title {
        color: #34d399;
      }
      .loly-pro-banner-desc {
        font-size: 11.5px;
        color: #94a3b8;
        line-height: 1.3;
      }
      .loly-pro-banner-btn {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #0b0d13;
        font-size: 11.5px;
        font-weight: 800;
        border: none;
        border-radius: 8px;
        padding: 7px 12px;
        cursor: pointer;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
      }
      .loly-pro-banner.pro-unlocked .loly-pro-banner-btn {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
        box-shadow: none;
      }
    `;
    document.head.appendChild(style);

    // 4. Inject Pro Banner in #paneExportar
    const exportGrid = document.querySelector('#paneExportar .export-cards-grid');
    if (exportGrid && !document.getElementById('lolyProBanner')) {
      const banner = document.createElement('div');
      banner.id = 'lolyProBanner';
      banner.className = 'loly-pro-banner';
      banner.innerHTML = `
        <div class="loly-pro-banner-left">
          <span class="loly-pro-star">✨</span>
          <div class="loly-pro-banner-info">
            <div class="loly-pro-banner-title" id="proBannerTitle">LolyLine Pro</div>
            <div class="loly-pro-banner-desc" id="proBannerDesc">SVG Master Vectorial y PNG Ultra sin marcas de agua</div>
          </div>
        </div>
        <button type="button" class="loly-pro-banner-btn" id="btnProBannerAction">Desbloquear</button>
      `;
      banner.onclick = () => showProModal('banner');
      exportGrid.insertBefore(banner, exportGrid.firstChild);
    }

    // 5. Initialize translations & Pro UI
    setLanguage(currentLang);
    updateProUi();

    // 6. Check if landing should be shown
    const skipLanding = localStorage.getItem('lolyline_skip_landing') === 'true';
    if (!skipLanding) {
      showLanding(true);
    }
  });

  // Export public interface on window.LolyLine
  window.LolyLine = {
    setLanguage,
    getLanguage: () => currentLang,
    exportFile: exportFileNativeOrWeb,
    openPhotoPicker,
    showLanding,
    closeLanding,
    isPro: () => BillingService.isPro(),
    showProModal,
    closeProModal,
    purchasePro: () => BillingService.purchasePro(),
    restorePurchases: () => BillingService.restorePurchases(),
    applyWatermark,
    updateProUi,
    isNative: () => isNative
  };

})();

