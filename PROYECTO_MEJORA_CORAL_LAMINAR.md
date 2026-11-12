# Proyecto: Nuevo Estilo Independiente — Ondas Paralelas Armónicas (Estilo Algorigraph)

> Documento de continuidad para retomar en la próxima sesión sin re-explicar desde cero.

---

## 1. Decisión de Producto (Confirmada por el Usuario)
- **NO modificar ni sustituir Estilo 1 · Coral**:
  - **Opción 1: Clásico (Original)** se mantiene intacta.
  - **Opción 2: Laminar Armónico** se mantiene intacta con sus nuevos valores por defecto (`MIN_R = 1.4`, `MAX_R = 3.2`, `44000` nodos en escritorio / `50000` en móvil), porque el resultado gusta mucho tal como quedó.
- **Crear un NUEVO ESTILO INDEPENDIENTE** en el selector/carrusel de estilos (siguiente número disponible tras Pop Geométrico, p. ej. **22. Ondas Paralelas / Franjas Armónicas**) en [`index.html`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/index.html) y [`mobile/index.html`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/mobile/index.html).

---

## 2. Estética Buscada para el Nuevo Estilo (Referencia `algorigraph`)
- **Grandes masas de curvas paralelas con curvatura compartida**: paquetes de 10–30 líneas adyacentes que fluyen y giran juntas en bloque como ondas empujadas a la vez, evitando giros o deditos individuales sueltos.
- **Densidad compacta y uniforme (sin grandes huecos blancos)**: en luces y medios tonos la separación entre trazos es contenida (`~1.8–3.2 px` efectivos); en sombras se comprime suavemente mediante horquillas limpias de bifurcación.
- **Trazado final obligatorio**: **1 única polilínea continua cerrada, 0 auto-intersecciones (`0 cruces`)**.

---

## 3. Aprendizajes Clave de la Referencia (Qué Evitar en el Nuevo Estilo)
Para no repetir los límites del enfoque basado en árbol (`generateLaminarCoralPortrait` en [`index.html`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/index.html#L3174) y [`mobile/index.html`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/mobile/index.html#L5635)):
1. **No construir el patrón con Árbol de Prim sobre Grafo de Gabriel + pared doble Euleriana**, ya que cualquier espuela o punto relleno suelto rompe las masas paralelas en deditos aislados y obliga a giros locales.
2. **No usar senoides sintéticas de alta frecuencia** para zonas lisas (`waveAng` oscilando cada ~100 px), sino difusión armónica suave del campo de orientación a partir de contornos y anatomía.
3. **No dejar rango dinámico de separación gigante** en luces (`sepMult = 2.08` con `MAX_R = 4.8`), manteniendo siempre densidad homogénea compacta.

---

## 4. Arquitectura Objetivo para el Nuevo Estilo

### Pipeline (`O(W·H)` en píxeles + unión topológica limpia)
1. **Campo Director Armónico de Largo Alcance (`flowX, flowY`)**
   - Tensor de estructura multiescala ponderado por `gradMag` y bordes de silueta (`silDist`), **difundido iterativamente** sobre decenas de píxeles (suavizado armónico/Laplace) para que mejillas, frente, cuello y pelo compartan tangentes coherentes sin cortes bruscos.
2. **Campo Escalar de Ondas / Franjas Acopladas sobre la Rejilla `W×H`**
   - Prototipar y elegir el más fiel y rápido en navegador:
     - **Reacción-Difusión Anisótropa (tipo Gray-Scott / Turing dirigido por tensor)**: evolución `~150–250` pasos con difusividad `D_parallel > D_perp` alineada a `(flowX, flowY)` y tasa modulada suavemente por `toneMap + step232Stencil`. Genera de forma natural **masas paralelas empujadas simultáneamente + horquillas limpias**.
     - **O Stripe Patterns (fasores complejos orientados a `flow`)** con frecuencia local modulada por el tono y dislocaciones armónicas limpias.
3. **Extracción de Isolíneas + Unión en 1 Sola Línea Continua (0 Cruces)**
   - Extraer contornos subpíxel (`Marching Squares`).
   - Unir componentes mediante puentes mínimos entre segmentos paralelos adyacentes sin cruzar paredes para lograr **1 único tour continuo cerrado**.
   - Rematar con Chaikin moderado + `uncrossContinuousTour(...)` garantizando **0 cruces exactos**.

---

## 5. Checklist de Integración al Implementarlo
1. Prototipar y verificar en scratch: **0 cruces exactos**, **1 solo trazo continuo**, masas paralelas coherentes y tiempo `<= 1.5–2.5 s`.
2. Añadir el nuevo motor y su entrada de estilo en [`index.html`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/index.html) (`<select id="engineMode">`, `MODE_DESCRIPTIONS`, `MODE_PRESETS`, Web Worker `onmessage`, sliders aplicables).
3. Añadir exactamente el mismo motor y tarjeta en [`mobile/index.html`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/mobile/index.html) (`#styleCarousel`, `#engineMode`, `MODE_DESCRIPTIONS`, `MODE_PRESETS`, Web Worker `onmessage`, `syncSlidersFromState` / reset).
4. Comprobar compatibilidad con modos de color y fondos (blanco, crema, oscuro).
5. Subir versión de Service Workers en [`sw.js`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/sw.js) y [`mobile/sw.js`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/mobile/sw.js).
6. Validar UI en navegador sin errores, commit en `mobile-app`, merge a `main` y push a `origin`.

---

## 6. Prompt listo para copiar al abrir el nuevo chat
> *"Lee `PROYECTO_MEJORA_CORAL_LAMINAR.md` y crea el nuevo estilo independiente de **Ondas Paralelas Armónicas (estilo Algorigraph)** en `index.html` y `mobile/index.html` usando un campo de ondas/franjas anisótropas acopladas + unión de isolíneas en un solo trazo continuo con 0 cruces, dejando Coral Clásico y Coral Laminar Armónico intactos."*
