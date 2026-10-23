---
name: seguir-spec
description: Implementa una tarea concreta de Visor Pokémon leyendo specs/tareas.md, specs/requisitos.md y specs/diseno.md. Úsala cuando haya que programar, continuar o corregir una tarea del proyecto (T1, T2, catálogo, ficha, equipo, PokeAPI). No amplía el alcance ni toca el cambio de requisitos C1.
---

# Seguir la spec

Implementa una sola tarea. La spec manda.

## Antes de editar

1. Lee la tarea pedida en `specs/tareas.md`. Si no te han dicho el id (`T1`, `T2`…), pregunta cuál es y no empieces.
2. Lee las secciones de `specs/diseno.md` que esa tarea cita.
3. Lee los criterios de `specs/requisitos.md` que la tarea marca como "Hecho cuando".
4. Si la tarea dice que no se haga todavía, no la hagas.

## Al implementar

5. Haz solo esa tarea. No adelantes la siguiente y no implementes el cambio de requisitos C1.
6. Si un archivo previsto en el diseño aún no existe y la tarea lo necesita, créalo con la forma que marca `specs/diseno.md`.
7. Si la spec no llega para decidir algo que cambia una pantalla, un dato o el alcance, para y dilo. No lo inventes en el código.

## Al terminar

8. Recorre los criterios de la tarea y di, uno a uno, si el código los cumple.
9. Pide el subagente `revisor-spec` para esa tarea. No arregles por tu cuenta lo que el revisor señale sin volver a mirar el criterio.
