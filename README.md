# Visor Pokémon — práctica de SDD con Cursor

Visor Pokémon es un catálogo de Pokémon (PokeAPI) para buscar y ver la ficha. Quien quiera puede guardar un equipo desde la ficha; el catálogo se usa igual sin ese apartado. La práctica evalúa el desarrollo guiado por especificación con Cursor, no el tamaño de la aplicación.

La investigación está en [docs/metodologia.md](docs/metodologia.md). El producto está cerrado en [specs/requisitos.md](specs/requisitos.md), [specs/diseno.md](specs/diseno.md) y [specs/tareas.md](specs/tareas.md). El agente se configura con `AGENTS.md` y con la carpeta `.cursor/`.

La primera tarea de código es la T1 de `specs/tareas.md`.

## Equipo

- Miembro 1: Sergii Butrii
- Miembro 2: Cristian Sánchez
- Miembro 3: Daniel Meléndez

## Cómo ejecutar

Hace falta tener Node.js y npm instalados, además de conexión a internet para consultar PokeAPI.

Desde la raíz del proyecto, instala las dependencias:

```sh
npm install
```

Arranca la aplicación en modo desarrollo:

```sh
npm run dev
```

Abre la dirección local que imprime Vite en la terminal (normalmente `http://localhost:5173/`).

Para generar la versión de producción:

```sh
npm run build
```

Rutas:

- `/`: catálogo y búsqueda.
- `/pokemon/:id`: ficha del Pokémon.
- `/equipo`: apartado extra para guardar un equipo.

## Publicación en GitHub Pages

La publicación se ejecuta automáticamente en cada `push` a `main`. También se puede iniciar manualmente desde la pestaña **Actions**, seleccionando **Deploy to GitHub Pages** y pulsando **Run workflow**.

La primera vez, en GitHub abre **Settings > Pages** y cambia **Build and deployment > Source** a **GitHub Actions**. No hace falta configurar una rama ni una carpeta de publicación.

La URL del sitio aparece en **Settings > Pages** y en el entorno `github-pages` del despliegue. Para consultar el resultado o los errores, abre **Actions** y selecciona la ejecución del workflow **Deploy to GitHub Pages**.

## Bibliografía

La lista comentada está en [docs/metodologia.md](docs/metodologia.md). Enlaces directos:

- https://cursor.com/docs/customize-cursor
- https://cursor.com/docs/rules
- https://cursor.com/docs/skills
- https://cursor.com/docs/subagents
- https://cursor.com/docs/hooks
- https://cursor.com/docs/mcp
- https://cursor.com/docs/reference/ignore-file
- https://tailwindcss.com/docs/installation/using-vite
- https://pokeapi.co/docs/v2
