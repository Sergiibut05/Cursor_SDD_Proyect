# Tareas — Visor Pokémon

Esta lista es solo el trabajo del Miembro 2: construir la aplicación y, cuando ya funcione, escribir en el README cómo se ejecuta.

Se hacen en orden. Una tarea por conversación, con `/implementar-tarea` y el id (`T1`, `T2`…). El repositorio ya trae la spec y la configuración del agente. La primera línea de aplicación es la T1.

El cambio de requisitos C1, en `specs/requisitos.md`, no es una tarea de esta lista y no se implementa.

## T1 — Esqueleto y marco

- Responsable: Miembro 2.
- Depende de: nada.
- Hecho cuando: la app arranca en local, las tres rutas pintan el marco de `specs/diseno.md` y, dentro de la pantalla, el nombre de la ruta. Todavía no hay datos de PokeAPI. El aspecto usa los tokens del diseño (carcasa, pantalla, piloto, las dos fuentes) y no una paleta genérica.

Pasos:

1. El repo no está vacío. No borres `specs/`, `docs/`, `.cursor/`, `AGENTS.md` ni `README.md`.
2. Crea la plantilla en una carpeta temporal y trae al raíz solo lo de Vite: `npm create vite@latest vite-tmp -- --template react-ts`. Mueve `index.html`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js` si aparece, `public/` y `src/`. Borra `vite-tmp`.
3. Instala `react-router`, `tailwindcss`, `@tailwindcss/vite`, `@fontsource/ibm-plex-sans` y `@fontsource/ibm-plex-mono`.
4. Registra el plugin de Tailwind junto al de React en `vite.config.ts`. Sustituye `src/index.css` por el `@import` y el `@theme` de `specs/diseno.md`. Importa las fuentes en `src/main.tsx`.
5. Crea `Marco.tsx` y las tres páginas como marcador de posición. En `App.tsx`, `BrowserRouter`, el marco y las rutas `/`, `/pokemon/:id` y `/equipo`. La ruta `/` es la de entrada.
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
