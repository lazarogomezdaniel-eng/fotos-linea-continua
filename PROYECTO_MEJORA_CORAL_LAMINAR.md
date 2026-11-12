# Proyecto: Nuevo Algoritmo Coral Laminar Armónico (Estilo Franjas Coherentes / Algorigraph)

> Documento de continuidad para retomar en la próxima sesión sin re-explicar desde cero.

---

## 1. Objetivo Exacto
Reemplazar el núcleo interno de **Estilo 1 · Coral → Opción 2: Laminar Armónico** (`CORAL_MODE === 'laminar'`) manteniendo intacta **Opción 1: Clásico (Original)**.

### Estética buscada (referencia visual comentada por el usuario)
- **Grandes masas de curvas paralelas con curvatura compartida**: paquetes de 10–30 líneas adyacentes que giran y fluyen juntas como ondas empujadas a la vez (*wavefronts* / *stripe patterns* / reacción-difusión anisótropa), en lugar de codos y giros individuales de líneas sueltas.
- **Densidad compacta sin parches blancos excesivos**: incluso en luces y medios tonos la separación entre trazos es contenida y armónica; en sombras las franjas se comprimen y bifurcan suavemente con horquillas limpias.
- **Trazado final obligatorio**: **1 única polilínea continua cerrada, 0 auto-intersecciones (`0 cruces`)**.

---

## 2. Estado Actual del Proyecto (ya aplicado como medida temporal)
Mientras se implementa el motor nuevo, se dejó ajustado el preset por defecto exclusivamente cuando `CORAL_MODE === 'laminar'` (sin alterar Coral Clásico):
- **Escritorio (`index.html`)**: `MIN_R = 1.4`, `MAX_R = 3.2`, `TARGET_NODES = 44000` (`38000` si móvil).
- **Estudio Móvil (`mobile/index.html`)**: `MIN_R = 1.4`, `MAX_R = 3.2`, `TARGET_NODES = 50000`.
- **Service Workers**: `sw.js` (`linea-continua-v10`), `mobile/sw.js` (`linea-continua-studio-v11`).

### Ubicación del código actual a sustituir
- Función en escritorio: [`index.html`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/index.html#L3174) → `generateLaminarCoralPortrait(...)`
- Función en móvil: [`mobile/index.html`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/mobile/index.html#L5635) → `generateLaminarCoralPortrait(...)`
- Llamada en Web Worker: buscando `coralMode === 'laminar'` en ambos HTML.

---

## 3. Diagnóstico Exacto de Por Qué Fallaba la v1 Actual
1. **Exceso de espacios blancos (`~80%` vacío en zonas claras):**
   - `sepMult = 2.08` multiplicaba `wMap` hasta `dReq ≈ 9.5–11.5 px` entre ejes con `MAX_R = 4.8`, y la doble pared Euleriana (`0.252 * dReq`) dejaba otro hueco interior y exterior de `~5 px` cada uno.
2. **Giros individuales / dedos sueltos en vez de masas empujadas a la vez:**
   - **Penalización de rectitud tras 24 nodos**: `chainLen[u] < 24 ? ... : (0.78 + Math.abs(dot - 0.52) * 0.48)` premiaba girar `~58°` en lugar de continuar paralelo.
   - **Árbol de Prim sobre Grafo de Gabriel + vértices sueltos**: descartaba el orden de los *streamlines*, conectaba desde una sola raíz con espuelas laterales y rellenaba huecos con puntos aislados (`addVertex`) que el recorrido Euleriano convertía en deditos cortos.
   - **Campo `waveAng` de alta frecuencia**: senoide sintética independiente de la foto oscilando `±115°` cada ~100 px cuando la coherencia era baja, rompiendo la continuidad anatómica.
   - **Relajación débil sin acoplamiento**: 16–20 pasos limitados a `0.52 px/iter` no transmitían empuje colectivo entre 15–20 líneas vecinas.

---

## 4. Arquitectura Recomendada para la Nueva Implementación

### Pipeline objetivo (O(W·H) en píxeles + unión topológica limpia)
1. **Campo Director Armónico de Largo Alcance (`flowX, flowY`)**
   - Calcular tensor de estructura multiescala ponderado por `gradMag` y bordes de silueta (`silDist`), y **difundirlo iterativamente** (suavizado tensorial tipo Laplace/biharmónico sobre decenas de píxeles) para que mejillas, frente, cuello y pelo hereden tangentes suaves compartidas sin frecuencias nerviosas sintéticas.
2. **Campo Escalar de Ondas / Franjas Acopladas sobre la Rejilla `W×H`**
   - Dos opciones limpias (elegir una o prototipar en scratch antes de integrar):
     - **Opción 1 (Reacción-Difusión Anisótropa tipo Gray-Scott / Turing dirigido por tensor)**: evolución rápida en grilla reducida/completa (`~150–250` pasos con difusividad `D_parallel > D_perp` alineada a `(flowX, flowY)` y tasa modulada por `toneMap + step232Stencil` con rango dinámico compacto para no abrir huecos blancos). Produce de forma natural **masas paralelas empujadas simultáneamente + horquillas orgánicas limpias**.
     - **Opción 2 (Stripe Patterns / Síntesis periódica armónica de Knöppel-Crane sobre el campo director)**: optimización/difusión de fasores complejos `z = u + i·v` alineados a `flow` con frecuencia local `ω(x,y)` modulada suavemente por el tono, extrayendo `arg(z)` / `cos(φ)` en bloques paralelos coherentes con dislocaciones/bifurcaciones limpias.
3. **Extracción de Isolíneas + Unión en Una Sola Línea Continua (0 Cruces)**
   - Extraer contornos cerrados y abiertos de nivel `c` (`Marching Squares` subpíxel).
   - Conectar componentes mediante puentes mínimos entre pares de aristas/segmentos paralelos cercanos o inversión de tramo (*bridging* planar entre contornos vecinos sin cruzar paredes), asegurando **1 único tour continuo cerrado**.
   - Rematar con Chaikin moderado + `uncrossContinuousTour(...)` para garantizar **0 cruces** exactos.
4. **Control de Presupuesto de Tiempo y Móvil**
   - Mantener tiempo de cálculo típico `<= 1.5–2.5 s` en Web Worker.
   - Asegurar compatibilidad con todos los modos de tinta/color y fondo (blanco, crema, oscuro).

---

## 5. Flujo de Trabajo y Verificación para Retomar
1. Crear script rápido de pruebas en scratch comparando el generador nuevo sobre retrato de muestra y validando:
   - **0 cruces exactos** en segmentos consecutivos/no-consecutivos.
   - Tour **100% continuo** (1 solo trazo).
   - Ausencia de grandes lagunas blancas y presencia clara de paquetes paralelos coherentes.
2. Integrar `generateLaminarCoralPortrait` idéntico en [`index.html`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/index.html) y [`mobile/index.html`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/mobile/index.html).
3. Incrementar versión en [`sw.js`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/sw.js) y [`mobile/sw.js`](file:///Users/daniellazarogomez/FOTOS%20DE%20LNEA%20CONTINUA/mobile/sw.js).
4. Validar sin errores en navegador, hacer commit en `mobile-app`, merge a `main` y push a `origin`.

---

## 6. Prompt listo para copiar al abrir el nuevo chat
> *"Lee `PROYECTO_MEJORA_CORAL_LAMINAR.md` e implementa el nuevo motor de **Coral Laminar Armónico** basado en campo de ondas/franjas anisótropas acopladas + unión de isolíneas en un solo trazo continuo con 0 cruces, tanto en `index.html` como en `mobile/index.html`, manteniendo intacto Coral Clásico."*
