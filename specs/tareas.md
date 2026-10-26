# Tareas — Visor Pokémon

Esta lista es solo el trabajo del Miembro 2: construir la aplicación y, cuando ya funcione, escribir en el README cómo se ejecuta.

Se hacen en orden. Una tarea por conversación, con `/implementar-tarea` y el id (`T1`, `T2`…). El repositorio ya trae la spec y la configuración del agente. La primera línea de aplicación es la T1. C1 queda para T9; no se implementa antes de completar las tareas anteriores.

## T1 — Esqueleto y marco visual

- Responsable: Miembro 2.
- Depende de: nada.
- Hecho cuando: la app arranca en local, las tres rutas comparten la cabecera de marca y la composición de guía ilustrada de `specs/diseno.md`, y cada ruta muestra su nombre como marcador de posición. Todavía no hay datos de PokeAPI. El aspecto usa los tokens de fondo, superficies, marca, acento y las dos fuentes; el fondo y las superficies tienen variaciones tonales sutiles con un toque táctil, no son rellenos planos ni una carcasa de dispositivo. No usa una paleta genérica.

Pasos:

1. El repo no está vacío. No borres `specs/`, `docs/`, `.cursor/`, `AGENTS.md` ni `README.md`.
2. Crea la plantilla en una carpeta temporal y trae al raíz solo lo de Vite: `npm create vite@latest vite-tmp -- --template react-ts`. Mueve `index.html`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js` si aparece, `public/` y `src/`. Borra `vite-tmp`.
3. Instala `react-router`, `tailwindcss`, `@tailwindcss/vite`, `@fontsource/ibm-plex-sans` y `@fontsource/ibm-plex-mono`.
4. Registra el plugin de Tailwind junto al de React en `vite.config.ts`. Sustituye `src/index.css` por el `@import` y el `@theme` de `specs/diseno.md`. Importa las fuentes en `src/main.tsx`.
5. Crea `Marco.tsx` con la cabecera de marca, navegación adaptable y contenedor amplio definidos en `specs/diseno.md`, además de las tres páginas como marcador de posición. En `App.tsx`, `BrowserRouter`, el marco y las rutas `/`, `/pokemon/:id` y `/equipo`. La ruta `/` es la de entrada.
6. `npm run dev` abre el marco. `npm run build` termina sin error.

## T2 — Cliente de PokeAPI

- Responsable: Miembro 2.
- Depende de: T1.
- Hecho cuando: existe `src/api/pokeapi.ts` con la caché en memoria, el mapeo a `PokemonResumen` y `PokemonFicha`, y `src/api/tipos.ts` con la tabla de `specs/diseno.md`. Aún no hace falta pintarlo. Una llamada de listado con offset 0 devuelve como máximo 20 resúmenes, y la ficha del id 25 cumple los números de R7.

## T3 — Catálogo

- Responsable: Miembro 2.
- Depende de: T2.
- Hecho cuando: R1, R2 y R3.

## T4 — Búsqueda

- Responsable: Miembro 2.
- Depende de: T3.
- Hecho cuando: R4, R5 y R6.

## T5 — Ficha

- Responsable: Miembro 2.
- Depende de: T4.
- Hecho cuando: R7 y R8. En esta tarea la ficha no añade ni quita del equipo: el botón y la página `/equipo` son la T6.

## T6 — Equipo y cobertura

- Responsable: Miembro 2.
- Depende de: T5.
- Hecho cuando: R9, R10, R11, R12, R13 y R14. Es un apartado extra: el catálogo y la ficha siguen usándose sin entrar en `/equipo`. La lógica de uniones vive en `src/domain/cobertura.ts` y la persistencia en `src/storage/equipo.ts`.

## T7 — README de la aplicación

- Responsable: Miembro 2.
- Depende de: T6.
- Hecho cuando: `README.md` explica cómo poner Visor Pokémon en marcha en local, con los comandos reales del proyecto. No reescribas la descripción de la práctica, la bibliografía ni los huecos de nombres.

Hay que dejar escrito:

1. Quitar la frase que dice que todavía no hay aplicación.
2. En "Cómo ejecutar": hace falta Node.js y npm, conexión a internet para PokeAPI, `npm install`, `npm run dev` y la dirección local que imprime Vite. También `npm run build` para generar la versión de producción.
3. Una línea por ruta: `/` catálogo y búsqueda, `/pokemon/:id` ficha, `/equipo` apartado extra.

## T8 — Publicación automática en GitHub Pages

- Responsable: Miembro 2.
- Depende de: T7.
- Hecho cuando: la aplicación se publica en GitHub Pages mediante GitHub Actions y se vuelve a desplegar automáticamente al hacer push a `main`. Las rutas `/`, `/pokemon/:id` y `/equipo` funcionan también al abrirlas directamente o recargar la página. El README explica la configuración manual única necesaria en GitHub.

Pasos:

1. Configura Vite y React Router para servir el proyecto desde la URL de Pages del repositorio, sin cambiar las rutas de la aplicación en local.
2. Añade un workflow de GitHub Actions que construya el proyecto y publique el artefacto en Pages al hacer push a `main`; también permite iniciarlo manualmente desde Actions.
3. Conserva la navegación de las rutas actuales cuando Pages sirve una ruta directa o se recarga.
4. Documenta en el README el ajuste manual de Pages a la fuente "GitHub Actions" y dónde consultar la URL y el resultado del despliegue.

## T9 — Búsqueda por coincidencias y filtro de cobertura (C1)

- Responsable: Miembro 2.
- Depende de: T8.
- Hecho cuando: C1 de `specs/requisitos.md` y `specs/diseno.md` está implementado. Al escribir se muestran hasta cinco sugerencias por prefijo; al confirmar, una coincidencia exacta abre la ficha y, si no existe, aparecen todos los resultados por prefijo en orden de Pokédex. El índice cubre toda la Pokédex y se reutiliza en memoria, sin una petición por tecla. Los controles de "Recibe daño doble" abren el catálogo filtrado por amenaza; "Quitar filtro" restablece el catálogo y la búsqueda y las sugerencias quedan desactivadas durante el filtro.

Pasos:

1. Extiende el cliente de PokeAPI para disponer de un índice de nombres de toda la Pokédex, con nombre visible en español cuando esté disponible y nombre de API como alternativa. Reutiliza datos en memoria y evita peticiones por tecla.
2. Añade sugerencias accesibles bajo el campo, limitadas a cinco y ordenadas por Pokédex. Seleccionar una abre `/pokemon/:id`.
3. Al enviar la consulta, abre la ficha si hay coincidencia exacta por nombre visible o slug de API; en caso contrario muestra todos los resultados que empiezan por la consulta, sin paginación. Si no hay resultados, conserva el catálogo y muestra el mensaje de R6.
4. Convierte los tipos de "Recibe daño doble" en controles que navegan al catálogo con `?amenaza={slug}`. Calcula los Pokémon que pueden golpear a esa amenaza con ventaja a partir de las relaciones de tipos de PokeAPI, muestra la unión sin paginación y ofrece "Quitar filtro".
5. Desactiva búsqueda y sugerencias con un filtro de amenaza activo. Verifica los estados de carga y error, las coincidencias y la navegación por teclado, además del comportamiento existente del catálogo, búsqueda exacta y cobertura.

## T10 — Tarjetas holográficas (extra)

- Responsable: Miembro 2.
- Depende de: T9.
- Hecho cuando: las tarjetas del catálogo cumplen la sección "Tarjeta holográfica (T10)" de `specs/diseno.md`. Con ratón, la tarjeta se inclina en 3D siguiendo el puntero y vuelve al reposo con suavidad; la lámina iridiscente del área de ilustración cambia con la posición del puntero y se tiñe hacia el color del primer tipo; un destello sigue al puntero sin restar legibilidad a número, nombre e insignias. Con teclado, el foco sigue siendo visible y la lámina hace un barrido breve. Sin hover, en táctil o con `prefers-reduced-motion`, no hay inclinación ni animación. R1, R2, R3, R6 y R7 siguen cumpliéndose: la tarjeta sigue siendo un único enlace a `/pokemon/:id` con el mismo contenido. `npm run build` y `npm run lint` terminan sin error.

Pasos:

1. Añade al componente de tarjeta las capas decorativas (lámina y destello) con `aria-hidden` y `pointer-events: none`, sin cambiar el contenido ni la estructura del enlace.
2. Escribe el cálculo puro de posición e inclinación (porcentajes del puntero, giro limitado) y la actualización de propiedades CSS mediante una referencia y `requestAnimationFrame`, sin estado de React por movimiento. Si el cálculo vive en un módulo aparte, cúbrelo con una prueba en `tests/` como las existentes.
3. Escribe en `src/index.css`, dentro de `@layer components`, los estilos de inclinación, lámina iridiscente, brillo, destello y profundidad, usando los tokens de `@theme` y el color de tipo.
4. Añade el barrido con `focus-visible` y desactiva inclinación y animaciones con `(hover: none)`, `(pointer: coarse)` y `prefers-reduced-motion: reduce`.
5. Comprueba en el navegador el catálogo, la búsqueda por prefijo y el filtro de amenaza: el efecto aparece, el clic abre la ficha, el texto se lee bien y el desplazamiento sigue fluido.

## T11 — Paleta holográfica según el tipo (extra)

- Responsable: Miembro 2.
- Depende de: T10.
- Hecho cuando: la lámina holográfica de cada tarjeta usa una paleta derivada del primer tipo del Pokémon, de modo que los colores varían perceptiblemente entre tipos sin perder el aspecto iridiscente ni la nitidez del sprite. El segundo tipo puede actuar como acento. La tarjeta conserva el mismo contenido, enlace y comportamiento de interacción, y solo cambia la paleta del efecto holográfico. `npm run build` y `npm run lint` terminan sin error.

Pasos:

1. Sustituye la secuencia arcoíris fija por franjas y brillos derivados de los tokens del primer tipo, pudiendo incorporar el segundo tipo como acento.
2. Conserva contraste y legibilidad del sprite y limita el cambio visual a las capas holográficas de la tarjeta.
3. Verifica el resultado con tarjetas de tipos distintos, incluyendo una de tipo único y otra de tipo doble.
