# Visor Pokémon

La especificación manda. El código la sirve.

Antes de implementar, lee `specs/requisitos.md`, `specs/diseno.md` y `specs/tareas.md`.

Una tarea de `specs/tareas.md` por conversación. La implementación se delega en el subagente `implementador`, que sigue la skill `seguir-spec`. No adelantes tareas posteriores ni el cambio de requisitos C1.

Cuando la tarea esté hecha, delega la comprobación en el subagente `revisor-spec`. Si un criterio no se cumple, no lo tapes cambiando el alcance: corrige el código, o para y di qué criterio falla.

El stack, el aspecto y el uso de PokeAPI están cerrados en `.cursor/rules/` y en `specs/diseno.md`. No los renegocies dentro de una tarea.
