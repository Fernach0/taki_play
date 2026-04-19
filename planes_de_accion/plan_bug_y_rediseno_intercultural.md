# Plan de Acción: Bug UUID + Rediseño Intercultural
**Proyecto Taki Play — Interculturalidad**  
Versión 2.0 | Abril 2026

---

## Introducción

Este documento aborda dos desafíos simultáneos del proyecto:

1. **Bug funcional crítico:** el frontend envía un payload incorrecto al solicitar una canción, provocando un `400 Bad Request` en el backend por UUID inválido.
2. **Pivote de identidad visual:** migrar el diseño de una estética neón genérica a una identidad intercultural que honre y visibilice la diversidad musical de los pueblos kichwa, achuar y demás comunidades indígenas del Ecuador.

Ambas fases deben ejecutarse en paralelo: la Fase 1 restablece la funcionalidad, la Fase 2 transforma la experiencia.

---

---

# FASE 1 — Trazabilidad y Solución del Bug del UUID

## Contexto del Error

El backend recibe el payload de la cola (`AddToQueueDto`) y responde con:

```
400 Bad Request — "songId debe ser un UUID válido"
```

Esto indica que el campo `songId` llega al backend como `undefined`, `null`, una cadena vacía, o en un formato que no pasa la validación `@IsUUID()` del DTO. La trazabilidad debe seguir el dato desde su origen en la UI hasta el cuerpo de la petición HTTP.

---

## Paso 1.1 — Auditar el Componente de Origen (SongCard / Mesa Page)

**Dónde investigar:** `frontend/src/app/mesa/[qrCode]/page.tsx` y `frontend/src/components/client/SongCard.tsx`

**Qué verificar:**

- Confirmar que el objeto `Song` que se pasa al componente `SongCard` contiene el campo `id` con un valor UUID real (ej: `"3f7b2c1a-..."`).
- Verificar que el manejador del evento de "solicitar canción" (el `onClick` del botón o la tarjeta) capture correctamente el `song.id` y no algún campo relacionado como `song.title` o un índice numérico del array.
- Confirmar que no existe ningún mapeo intermedio que renombre `id` a otro campo (por ejemplo, si en algún punto se construye un objeto `{ songId: song.songId }` cuando el tipo real expone `song.id`).
- Revisar si el botón de solicitud está dentro de un `<form>` que intercepte el evento y envíe campos del formulario en lugar del objeto canción.

---

## Paso 1.2 — Auditar el Servicio de Cola en el Frontend

**Dónde investigar:** `frontend/src/services/queue.service.ts` y `frontend/src/types/queue.types.ts`

**Qué verificar:**

- Abrir el tipo `AddToQueueDto` definido en `queue.types.ts` y confirmar que los tres campos requeridos son: `songId`, `tableId` y `sessionId`, todos tipados como `string`.
- En `queue.service.ts`, revisar la función que ejecuta la mutación `addToQueue`. Confirmar que el objeto que construye y pasa a `api.post(...)` usa exactamente las claves `songId`, `tableId` y `sessionId` — no `song_id`, `id`, ni variantes en camelCase/snake_case distintas.
- Verificar que los tres valores son obtenidos antes de llamar al servicio:
  - `songId` proviene del objeto `Song` seleccionado.
  - `tableId` proviene del store de sesión (`sessionStore`).
  - `sessionId` proviene del store de sesión (`sessionStore`).
- Si alguno de los tres puede llegar como `undefined` (por ejemplo si el store aún no ha hidratado desde `sessionStorage`), ese es el origen del bug.

---

## Paso 1.3 — Auditar el Store de Sesión

**Dónde investigar:** `frontend/src/store/sessionStore.ts`

**Qué verificar:**

- Confirmar que los campos `tableId` y `sessionId` están siendo correctamente poblados cuando el cliente escanea el QR y se une a la mesa (acción `joinTable`).
- Verificar que el store usa `persist` con `sessionStorage` y que la hidratación del store ocurre **antes** de que el usuario pueda presionar el botón de solicitar canción. En Next.js 16 con SSR, el store puede estar vacío en el primer render hasta que el cliente monte el componente y rehidrate.
- Si la hidratación es asíncrona, confirmar que la página de mesa incluye un guard que deshabilita el botón de solicitud mientras `isJoined` es `false`.

---

## Paso 1.4 — Verificar el DTO y la Validación en el Backend

**Dónde investigar:** `backend/src/queue/dto/add-to-queue.dto.ts` y `backend/src/queue/queue.service.ts`

**Qué verificar:**

- Confirmar que `AddToQueueDto` usa `@IsUUID()` (y opcionalmente `@IsNotEmpty()`) en los tres campos: `songId`, `tableId`, `sessionId`.
- En `queue.service.ts`, confirmar que el método que recibe el DTO no está haciendo ninguna transformación de keys antes de usarlos en Prisma.
- Verificar que el `ValidationPipe` global en `main.ts` tiene activado `transform: true` — sin esto, los datos del body llegan como `Object` plano sin las transformaciones de clase, pero los decoradores de validación sí deben funcionar.
- Revisar los logs del servidor NestJS al momento del error: el mensaje de clase-validator generalmente indica exactamente qué campo falló y con qué valor llegó (incluyendo `undefined`). Capturar ese log completo es el diagnóstico más directo.

---

## Paso 1.5 — Diagnóstico con DevTools (Método más rápido)

**Herramienta:** Network tab del navegador (Chrome DevTools o Firefox)

**Procedimiento:**

1. Abrir la página de mesa en el navegador con DevTools abierto en la pestaña **Network**.
2. Intentar solicitar una canción.
3. Inspeccionar la petición `POST` al endpoint `/api/v1/queue` (o similar).
4. En la pestaña **Payload** de esa petición, revisar el JSON exacto que se envió.
5. Si el JSON muestra `{ "songId": null }`, `{ "songId": "" }` o si el campo simplemente no aparece, el bug está confirmado en el frontend (pasos 1.1 a 1.3).
6. Si el JSON muestra un UUID válido y aun así llega el 400, el bug está en el backend (paso 1.4) o en un middleware de transformación.

---

## Paso 1.6 — Solucionar el Warning de Accesibilidad en los Modales

**Dónde investigar:** `frontend/src/components/modals/ModalWrapper.tsx` y todos los modales que lo usan.

**Contexto del warning:**

Radix UI `Dialog` emite una advertencia en consola cuando el componente `Dialog.Content` no incluye un elemento descriptivo asociado. El estándar ARIA requiere que los diálogos modales tengan tanto un título (`aria-labelledby`) como una descripción (`aria-describedby`) para lectores de pantalla.

**Qué implementar:**

- En `ModalWrapper.tsx`, dentro de `Dialog.Content`, agregar el componente `Dialog.Description` de Radix UI inmediatamente después de `Dialog.Title`.
- El texto de `Dialog.Description` debe ser un párrafo corto que explique el propósito del modal (ejemplo: "Completa los campos para agregar una nueva canción al catálogo").
- Cada modal que use `ModalWrapper` puede pasar una prop `description` opcional. Si no se pasa, `ModalWrapper` puede mostrar un texto genérico o simplemente renderizar `Dialog.Description` con una cadena vacía y agregarle `className="sr-only"` (solo visible para lectores de pantalla) para satisfacer el requerimiento de Radix sin mostrar texto visible.
- Verificar en consola del navegador que el warning desaparece después del cambio.

---

---

# FASE 2 — Estrategia de Rediseño Intercultural

## Visión Conceptual

Taki Play no es una app genérica de karaoke: es un espacio digital que celebra la voz de los pueblos indígenas del Ecuador. El diseño debe reflejar esa identidad. La estética debe evocar la selva amazónica, los tejidos andinos, la cerámica kichwa, el cacao y el maíz sagrado — no una discoteca urbana.

El reto es fusionar esta identidad ancestral con la usabilidad moderna que requiere una app de karaoke de uso activo en un evento social.

---

## Paso 2.1 — Nueva Paleta de Colores: Cosmovisión Andina y Amazónica

**Principio guía:** Los colores provienen de la naturaleza, los pigmentos naturales usados en textiles y la tierra. No son colores saturados artificiales; tienen calidez y peso visual.

**Dónde aplicar:** `frontend/src/app/globals.css` — sección `@theme` con variables CSS personalizadas de Tailwind v4.

### Colores Base (Fondos)

| Rol | Nombre sugerido | Referencia Visual | Hex aproximado |
|-----|-----------------|-------------------|----------------|
| Fondo principal | `dark-tierra` | Tierra negra fértil, noche en la selva | `#0d0a07` |
| Superficie de cards | `dark-arcilla` | Arcilla oscura, cerámica precolombina | `#1a1208` |
| Borde sutil | `dark-caoba` | Madera de caoba, corteza de árbol | `#2e1f0e` |

### Colores de Acento (Identidad Cultural)

| Rol | Nombre sugerido | Referencia Visual | Hex aproximado |
|-----|-----------------|-------------------|----------------|
| Acento primario | `inca-gold` | Oro del sol inca, maíz sagrado | `#d4a017` |
| Acento secundario | `selva-verde` | Follaje amazónico, hojas de helecho | `#4a7c59` |
| Acento terciario | `kichwa-rojo` | Achiote, tejido rojo en anacos | `#c0392b` |
| Acento cuaternario | `cielo-andino` | Cielo de los Andes a 4000m, turquesa maya | `#2980b9` |
| Acento suave | `chakra-ocre` | Ocre de pigmentos naturales, barro cocido | `#b5651d` |

### Colores de Estado (UI Funcional)

| Estado | Nombre sugerido | Hex aproximado |
|--------|-----------------|----------------|
| Éxito / Activo | `verde-kitu` | `#27ae60` |
| Error / Peligro | `rojo-sangay` | `#e74c3c` |
| Advertencia | `amarillo-paja` | `#f39c12` |
| Inactivo / Disabled | `gris-paramo` | `#5d6d7e` |

### Colores de Texto

| Rol | Descripción |
|-----|-------------|
| `text-primary` | Blanco cálido, no puro — ligeramente amarillento (`#f5f0e8`) para suavizar la lectura |
| `text-secondary` | Beige arenoso para información secundaria (`#c4a882`) |
| `text-muted` | Marrón grisáceo para placeholders y ayudas (`#7a6652`) |

---

## Paso 2.2 — Tipografía con Respeto a las Lenguas Originarias

**Principio:** El kichwa y el achuar utilizan caracteres del alfabeto latino extendido pero con reglas de lectura propias. La tipografía debe ser legible en títulos en estas lenguas, sin "romper" caracteres especiales.

**Recomendaciones:**

- **Tipografía principal (títulos y nombres de canciones):** Usar una fuente con serif humanista o de inspiración pre-colombina. Opciones disponibles en Google Fonts compatibles con el alfabeto kichwa/achuar: **Playfair Display** (elegante, evoca grabados ancestrales) o **Lora** (serif cálido, muy legible en idiomas con tildes y caracteres especiales).
- **Tipografía secundaria (interfaz, botones, etiquetas):** Una sans-serif limpia que no compita visualmente. **Inter** (ya disponible en el proyecto vía Geist) o **DM Sans** funcionan bien como contraparte funcional.
- **Tamaños mínimos:** Garantizar que los títulos en kichwa/achuar nunca queden por debajo de 14px en móvil. Los nombres de canciones en estas lenguas tienden a ser más largos.
- **No usar tipografías "decorativas nativas":** Evitar fuentes que imiten jeroglíficos o pictogramas indígenas para texto funcional — resultan ilegibles y pueden percibirse como apropiación estética. La autenticidad viene del color y la iconografía, no de simular escritura que no corresponde a esas culturas.

---

## Paso 2.3 — Iconografía: Símbolos con Significado Cultural

**Principio:** Reemplazar íconos genéricos de karaoke/música (micrófono neón, notas musicales abstractas) con símbolos que tengan resonancia cultural contextualizada.

**Recomendaciones por sección:**

| Sección | Ícono actual (genérico) | Propuesta intercultural |
|---------|------------------------|------------------------|
| Logo / Header | Nota musical abstracta | Chakana (cruz andina de 12 puntas) estilizada, o un cóndor simplificado |
| Idioma KICHWA | Bandera o texto | Chakana pequeña o símbolo solar |
| Idioma ACHUAR | Bandera o texto | Hoja de selva estilizada o espiral amazónica |
| Idioma ESPAÑOL | Bandera o texto | Guitarra simplificada (instrumento mestizo) |
| Cola de canciones | Lista genérica | Tejido / hilado (simula una secuencia de hilos) |
| Canción reproduciendo | Play button | Cóndor en vuelo o tambor (tinya) |
| Admin / DJ | Usuario genérico | Figura con sombrero de paja toquilla |
| Agregar canción | "+" genérico | "+" integrado en motivo geométrico andino |

**Fuente de íconos recomendada:** La librería `lucide-react` (ya instalada) puede complementarse con SVGs personalizados para los símbolos culturales más importantes. Los SVGs deben diseñarse con trazos simples (monoline) para funcionar en tamaños pequeños.

---

## Paso 2.4 — Rediseño de las Cards de Canciones (Vista Cliente)

**Dónde aplicar:** `frontend/src/components/client/SongCard.tsx`

**Concepto visual:** Cada card debe evocar una "ficha" de tejido andino o una loseta de cerámica precolombina, no una tarjeta de streaming moderno.

**Cambios de diseño a implementar:**

- **Borde de la card:** Cambiar el borde de neón puro a un borde con degradado que simule un marco de tejido. Usar el color `inca-gold` con opacidad media en lugar de `neon-purple`.
- **Fondo de la card:** Usar `dark-arcilla` con una textura visual sutil (se puede lograr con un patrón CSS de puntos o rombos en bajo contraste que evoque un tejido).
- **Badge de idioma:** Rediseñar los badges para usar los colores de acento culturales:
  - KICHWA → fondo `kichwa-rojo` suave, borde `inca-gold`
  - ACHUAR → fondo `selva-verde` suave, borde `selva-verde`
  - ESPAÑOL → fondo `chakra-ocre` suave, borde `chakra-ocre`
  - OTHER → fondo `gris-paramo`
- **Portada (cover image):** Si no hay imagen, el placeholder debe ser una forma geométrica andina (espiral o chakana) en lugar del ícono de nota musical genérico.
- **Hover state:** En lugar del borde de neón al hacer hover, usar una elevación sutil con sombra en `inca-gold` con baja opacidad — más cálido, menos eléctrico.
- **Tipografía en la card:** El título de la canción usa la fuente serif (Playfair Display / Lora), el artista usa la sans-serif en color `text-secondary`.

---

## Paso 2.5 — Rediseño del Dashboard Administrativo (Vista DJ)

**Dónde aplicar:** `frontend/src/app/dj/page.tsx`, `frontend/src/components/dj/DJHeader.tsx`, y todos los paneles en `frontend/src/components/dj/`

**Concepto visual:** El panel del DJ es el "backstage" de la fiesta. Debe ser funcional y claro, pero con la identidad del proyecto. Piensa en un panel de control con materiales naturales — madera, oro, cuero — en lugar de metal y neón.

**Cambios de diseño a implementar:**

### Header (DJHeader)
- El logo debe incorporar la Chakana o el símbolo solar estilizado junto al nombre "Taki Play".
- El subtítulo debajo del logo puede decir en kichwa: **"Taki" = Cantar, "Play" = Jugar** — una pequeña nota educativa que contextualiza el nombre.
- El fondo del header usa `dark-caoba` con una línea inferior en `inca-gold`.

### Tabs de Navegación
- Cambiar el indicador de tab activo de `neon-purple` a `inca-gold`.
- Las tabs inactivas usan `text-muted` y al hover cambian a `text-secondary`.
- Considerar añadir íconos culturales pequeños junto a cada tab (Cola → cóndor, Canciones → nota con chakana, Mesas → tejido, Admins → figura con sombrero).

### Panel de Cola (QueueDJPanel)
- Las cards de mesa usan borde `dark-caoba` en reposo y `inca-gold` cuando tienen canciones activas.
- La canción "PLAYING" tiene un resaltado en `inca-gold` (no rosa neón).
- Las canciones "PENDING" usan `selva-verde` en lugar de un color neutro.

### Panel de Canciones (SongsPanel)
- La barra de búsqueda usa borde `dark-caoba` con focus en `inca-gold`.
- La tabla usa filas alternas en `dark-tierra` y `dark-arcilla` para legibilidad.
- Los botones de acción (editar/eliminar) mantienen sus colores funcionales pero con la forma levemente redondeada y el ícono reemplazado por las propuestas del paso 2.3.

### Panel de Mesas (TablesPanel)
- Cada fila de mesa puede tener un pequeño indicador visual de estado: activa (punto `verde-kitu`) / inactiva (punto `gris-paramo`).

---

## Paso 2.6 — Rediseño de los Modales

**Dónde aplicar:** `frontend/src/components/modals/ModalWrapper.tsx`

**Cambios de diseño a implementar:**

- **Overlay (fondo oscuro):** Mantener el `backdrop-blur` pero cambiar el color del overlay a `rgba(13, 10, 7, 0.85)` — negro con tinte tierra, en lugar de negro puro.
- **Contenedor del modal:** Borde en `inca-gold` con opacidad media. El gradiente del borde puede ir de `inca-gold` a `kichwa-rojo` para los modales de acción importante (crear/editar) y de `inca-gold` a `selva-verde` para los modales informativos.
- **Header del modal:** Línea divisoria inferior usando un patrón de puntos en `inca-gold` que evoque un tejido.
- **Botón primario (confirmar):** Usar `inca-gold` como color de fondo con texto oscuro (`dark-tierra`), en lugar del botón morado neón.
- **Botón secundario (cancelar):** Borde `dark-caoba`, texto `text-secondary`.
- **Botón de peligro (eliminar):** Mantener `kichwa-rojo` — ya corresponde a la paleta cultural y funciona semánticamente.

---

## Paso 2.7 — Rediseño de la Página Principal y Vista de Mesa (Cliente)

**Dónde aplicar:** `frontend/src/app/page.tsx` y `frontend/src/app/mesa/[qrCode]/page.tsx`

### Página Principal (Landing)
- El fondo puede incorporar una imagen de muy baja opacidad que muestre un tejido andino o una fotografía de un músico indígena, como hero visual.
- El título "Taki Play" en tipografía Playfair Display con color `inca-gold`.
- La instrucción de escanear el QR en `text-secondary`.
- Agregar una línea de contextualización cultural: "Música de los pueblos kichwa, achuar y más" en español y en kichwa.

### Página de Mesa (Vista Cliente)
- El encabezado de la mesa usa el nombre y número en `inca-gold`, con un motivo de tejido como separador visual.
- Los filtros de idioma (SongFilters) usan chips con los colores culturales de cada idioma (del paso 2.4).
- El panel de cola (QueuePanel) en móvil usa `dark-arcilla` como fondo con borde superior en `inca-gold`.
- La canción "Reproduciendo ahora" tiene un indicador de animación en forma de onda de sonido (simula las cuerdas de una guitarra o las ondas del río) en lugar de un pulso de neón.

---

## Paso 2.8 — Actualización del `globals.css` (Tailwind v4 @theme)

**Dónde aplicar:** `frontend/src/app/globals.css`

**Proceso de actualización:**

1. Reemplazar todos los tokens `--color-neon-*` con los nuevos tokens culturales definidos en el paso 2.1.
2. Agregar los tokens de tipografía: `--font-serif` apuntando a Playfair Display o Lora.
3. Actualizar las utilidades `.neon-text` a `.oro-text` (gradiente de `inca-gold` a `chakra-ocre`).
4. Agregar una utilidad `.tejido-border` que aplique el patrón de borde en `inca-gold`.
5. Revisar todos los componentes que usan clases `neon-*` en Tailwind y reemplazarlas con las equivalentes culturales.

**Orden de actualización de componentes (de menos a más visible):**
1. `globals.css` — tokens base
2. `ModalWrapper.tsx` — los modales están en todas las vistas
3. `Button.tsx` y `Badge.tsx` — componentes atómicos usados en todo el sistema
4. `SongCard.tsx` — vista cliente
5. `DJHeader.tsx` y tabs del dashboard
6. Paneles del DJ (`TablesPanel`, `SongsPanel`, `QueueDJPanel`)
7. Páginas principales (`page.tsx`, `mesa/[qrCode]/page.tsx`)

---

## Resumen de Prioridades

| Prioridad | Tarea | Tipo | Complejidad |
|-----------|-------|------|-------------|
| 🔴 Crítica | Diagnosticar UUID bug con DevTools (Paso 1.5) | Bug | Baja |
| 🔴 Crítica | Auditar `sessionStore` y el componente `SongCard` (Pasos 1.1, 1.3) | Bug | Media |
| 🟡 Alta | Corregir warning de accesibilidad en modales (Paso 1.6) | Bug/A11y | Baja |
| 🟡 Alta | Actualizar paleta en `globals.css` (Paso 2.8) | Rediseño | Media |
| 🟡 Alta | Rediseñar `Badge.tsx` con colores culturales (Paso 2.4) | Rediseño | Baja |
| 🟢 Media | Rediseñar `SongCard.tsx` (Paso 2.4) | Rediseño | Media |
| 🟢 Media | Rediseñar `ModalWrapper.tsx` (Paso 2.6) | Rediseño | Media |
| 🟢 Media | Actualizar `DJHeader.tsx` y tabs (Paso 2.5) | Rediseño | Media |
| 🔵 Normal | Tipografía con Google Fonts (Paso 2.2) | Rediseño | Baja |
| 🔵 Normal | Iconografía cultural con SVGs (Paso 2.3) | Rediseño | Alta |
| 🔵 Normal | Landing page + vista de mesa (Paso 2.7) | Rediseño | Media |

---

*Taki Play — "Música que nace de la Pachamama, tecnología que la lleva al mundo"*
