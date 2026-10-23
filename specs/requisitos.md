# Requisitos — Visor Pokémon

## Problema

Hace falta un sitio para buscar un Pokémon y leer su ficha, sin cuenta y sin instalar nada. Guardar un equipo es un extra, no la razón de abrir la aplicación.

## Usuario

Un compañero de clase que quiere consultar Pokémon en este ordenador. Si le apetece, puede apuntar algunos en un equipo; si no, el catálogo y las fichas se usan igual.

## Visión

Visor Pokémon es un catálogo para buscar Pokémon y abrir su ficha.

## Incluye

- Catálogo paginado, con nombre, número, sprite y tipos.
- Búsqueda por el nombre de la API.
- Ficha con sprite, tipos, altura, peso y seis estadísticas.
- Apartado extra, fuera del recorrido principal: un equipo de hasta seis, recordado en el navegador, con un panel de cobertura de tipos. Se llega desde la ficha o desde un enlace secundario. No usarlo no impide buscar ni ver fichas.

## No incluye

- Cuentas, servidor propio y base de datos.
- Combate, objetos, naturalezas, EVs, movimientos y evoluciones.
- Efectividad combinada de un Pokémon con dos tipos (no hay cálculo de ×4).
- Búsqueda por el nombre en español ni por texto parcial. PokeAPI identifica por el slug inglés.
- Variocolor, formas regionales y el logo o la marca de Nintendo.
- El filtro desde un hueco de cobertura. Eso es el cambio reservado, más abajo, y no forma parte del MVP.

## Supuestos

- Hay conexión a internet la primera vez que se consulta un dato. El equipo ya guardado se lee sin red; la cobertura, no, porque pide los tipos a PokeAPI.
- El idioma de la interfaz es el español. El nombre visible sale de PokeAPI en español cuando existe.

## Catálogo

- **R1.** Al abrir `/` se piden como máximo 20 Pokémon. Cada tarjeta muestra el número con tres cifras (`#025`), el nombre en español si `pokemon-species` lo trae y, si no, el nombre de la API, el sprite y una insignia por tipo.
- **R2.** "Cargar más" añade los 20 siguientes y mantiene los ya visibles. Cuando la API indica que no hay página siguiente, el control no sigue pidiendo datos.
- **R3.** Mientras llega la primera página se lee "Cargando…". Si la petición falla, se lee "No se ha podido cargar el catálogo." y no desaparece lo que ya estuviera en pantalla.

## Búsqueda

- **R4.** La búsqueda se lanza con Enter o con un botón, no en cada tecla. El texto se normaliza: sin espacios extremos, en minúsculas y con espacios internos convertidos en guiones. Con ese slug se pide `GET /pokemon/{slug}`.
- **R5.** Si la API responde, se abre la ficha de ese Pokémon.
- **R6.** Si no existe, se lee "No hay un Pokémon con ese nombre." y el catálogo que ya estaba cargado sigue visible.

## Ficha

- **R7.** Un clic en una tarjeta abre `/pokemon/:id`. En Pikachu (`25`) se ven el sprite, los tipos Eléctrico, 0,4 m, 6,0 kg y las seis estadísticas: PS 35, Ataque 55, Defensa 40, Ataque especial 50, Defensa especial 50, Velocidad 90.
- **R8.** Desde la ficha se vuelve al catálogo en un clic. Si había un equipo guardado, sigue guardado.

## Equipo (apartado extra)

El catálogo, la búsqueda y la ficha funcionan sin abrir esta sección.

- **R9.** Desde la ficha se puede añadir el Pokémon al equipo. El id queda en `localStorage` bajo la clave `visor-equipo` y sigue ahí después de recargar la página.
- **R10.** Desde la ficha, si ya está en el equipo, el mismo control lo quita. También se puede quitar desde `/equipo`.
- **R11.** Añadir un séptimo Pokémon no lo guarda y se lee "El equipo admite seis Pokémon."
- **R12.** Añadir un id que ya está no lo duplica y se lee "Ese Pokémon ya está en el equipo."
- **R13.** Con el equipo vacío, `/equipo` lee "Tu equipo está vacío. Desde la ficha de un Pokémon puedes añadirlo." y no muestra listas de cobertura.
- **R14.** Con uno o más Pokémon, el equipo muestra dos listas, con los nombres de tipo en español y en orden alfabético: "Golpea con ventaja" (unión de `double_damage_to` de los tipos del equipo) y "Recibe daño doble" (unión de `double_damage_from`). Un tipo puede salir en las dos. No se simula un combate.

## Cambio reservado

No se implementa con el MVP. Cuando el grupo abra esta fase, primero se actualizan los requisitos, el diseño y las tareas, y solo después el código.

- **C1.** En "Recibe daño doble", cada tipo es un control. Activarlo abre el catálogo filtrado a los Pokémon que tengan al menos un tipo capaz de golpear ese tipo con ventaja (`double_damage_to` lo incluye). Un control "Quitar filtro" devuelve el catálogo normal. Mientras el filtro está activo, la búsqueda queda desactivada.
