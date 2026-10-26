# Diseño — Visor Pokémon

La interfaz adopta una dirección de guía ilustrada: cálida, expresiva y contemporánea. No emula una consola ni una carcasa de hardware. La arquitectura, las rutas y los contratos de datos siguen siendo los definidos en esta especificación.

## Stack

- Vite con la plantilla `react-ts`.
- React Router 7: dependencia `react-router`, imports desde `react-router`.
- Tailwind CSS 4 mediante `@tailwindcss/vite`. No hay `tailwind.config.js` ni PostCSS.
- Fuentes locales: `@fontsource/ibm-plex-sans` y `@fontsource/ibm-plex-mono`.
- `fetch` contra `https://pokeapi.co/api/v2`. Sin cliente HTTP de terceros.

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Catálogo y búsqueda |
| `/pokemon/:id` | Ficha |
| `/equipo` | Equipo y cobertura. Apartado extra: no es la portada. |

Cualquier otra ruta no entra en el MVP. No hace falta una página 404 dedicada.

## Dirección visual

La app se siente como una guía ilustrada y coleccionable, no como un dispositivo físico. Los Pokémon y sus ilustraciones son el foco; la interfaz aporta calidez, personalidad y una jerarquía clara sin competir con ellos.

- Fondo general marfil cálido, superficies claras, tinta verde oscura y un acento botánico. El fondo de página no puede ser un color plano: combina una base marfil con veladuras amplias y muy sutiles en verde salvia y crema, mediante gradientes radiales o lineales de bajo contraste. Pueden añadirse grano o un patrón orgánico casi imperceptible con CSS, siempre detrás del contenido y sin imágenes externas.
- La composición es amplia y respirada. El contenido usa un ancho máximo aproximado de `max-w-7xl`, centrado; no queda reducido a una columna estrecha en pantallas grandes.
- Las superficies tienen radios generosos pero contenidos, bordes finos de bajo contraste, un degradado leve entre luz y sombra y sombras suaves para separar planos. Se admite un toque de skeuomorfismo cuidado —brillo superior tenue, borde interior fino o sombra inset muy ligera— para sugerir materiales y tactilidad. No se usan marcos negros gruesos, biseles de hardware ni neumorfismo blando.
- IBM Plex Sans lleva títulos y texto. IBM Plex Mono se reserva para números de Pokédex y datos breves, no para el nombre de marca.
- Los colores de tipo se usan en insignias compactas y en matices muy tenues del área de ilustración. No tiñen toda la interfaz ni sustituyen la paleta base.
- Ninguna superficie visual principal —fondo, cabecera, búsqueda o tarjetas— debe parecer un rectángulo de color sólido: usa variación tonal o capas de luz y sombra de bajo contraste, manteniendo texto e ilustraciones nítidos.
- Las transiciones son breves y discretas. Se respetan `prefers-reduced-motion`, el contraste y un foco visible para teclado; los controles táctiles tienen un área cómoda.

## Marco

Todo el sitio comparte la cabecera y el contenedor de contenido de `src/components/Marco.tsx`.

- El fondo de `body` es `bg-fondo text-tinta font-sans`.
- Una cabecera de marca contiene un emblema geométrico propio (sin logotipos oficiales), el nombre "Visor Pokémon" destacado y una frase breve de apoyo: "Tu guía ilustrada para explorar Pokémon". El conjunto no usa la estética de una etiqueta técnica ni una fuente monoespaciada para el título.
- La navegación presenta "Catálogo" (`/`) como destino principal y "Equipo" (`/equipo`) como una acción claramente reconocible, con apariencia de botón y un pequeño motivo gráfico propio. La ruta activa se distingue con fondo y contraste, no solo con un subrayado. En móvil, las dos opciones siguen visibles y cómodas de pulsar.
- La cabecera y el contenido comparten un ancho máximo `max-w-7xl` y quedan centrados. Hay separación generosa entre cabecera y contenido.
- El contenido de cada ruta se pinta directamente sobre el fondo ambiental, organizado en secciones y superficies claras según la pantalla. No hay carcasa, marco exterior ni una única pantalla encajada dentro de otro aparato.

## Pantallas

**Catálogo.** Encabezado de página con título claro y una frase breve de contexto. La búsqueda se agrupa en una superficie destacada y contiene un campo de texto y el botón "Buscar". La rejilla se adapta al espacio: una columna en móviles estrechos, dos en móvil amplio, tres en tableta y cuatro en escritorio. Cada tarjeta es un enlace a `/pokemon/:id`, con una zona generosa para el sprite sobre un matiz suave, el número `#025` en mono, el nombre como dato principal y las insignias de tipo. Las tarjetas usan un fondo claro con variación tonal leve, radio medio/grande, borde fino con un reflejo interior discreto y sombra suave; en `hover` se elevan apenas y el sprite puede crecer ligeramente. El botón "Cargar más" queda después de la rejilla. Los estados de R3 y R6 aparecen junto a la búsqueda o al contenido relacionado, no en un modal.

**Ficha.** Composición editorial: ilustración oficial grande en una superficie con matiz suave y profundidad sutil, acompañada de número, nombre destacado e insignias. Altura y peso aparecen en un grupo de datos fácil de recorrer. Las seis estadísticas mantienen el orden de la API (PS, Ataque, Defensa, Ataque especial, Defensa especial, Velocidad), cada una con su nombre y su valor numérico claramente asociados. Un enlace "Volver al catálogo". El botón "Añadir al equipo" o "Quitar del equipo" es visible junto a la información, sin taparla. La ficha se lee igual si nadie pulsa ese botón.

**Equipo.** Apartado extra con encabezado y una lista de tarjetas claras de los Pokémon guardados, cada uno con sprite, nombre y un control "Quitar". Si no hay ninguno, el texto de R13 y nada más. Si hay alguno, dos grupos visualmente diferenciados de insignias: "Golpea con ventaja" y "Recibe daño doble".

## Datos

```ts
type PokemonResumen = {
  id: number;
  nombre: string;
  sprite: string;
  tipos: TipoId[];
};

type PokemonFicha = PokemonResumen & {
  alturaM: number;
  pesoKg: number;
  estadisticas: { clave: string; nombre: string; valor: number }[];
};

type TipoId =
  | "normal" | "fire" | "water" | "grass" | "electric" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";
```

- `alturaM` es el `height` de la API (decímetros) dividido entre 10. `pesoKg` es el `weight` (hectogramos) dividido entre 10. Se muestran con una cifra decimal y coma (`0,4 m`, `6,0 kg`).
- `nombre` es la entrada de `pokemon-species` → `names` cuyo `language.name` es `es`. Si no está, el `name` de `/pokemon/{id}` con guiones cambiados por espacios.
- El equipo es `number[]` de como mucho seis ids, sin repetidos, en `localStorage` bajo `visor-equipo`. Si el JSON no es un array de números, se trata como equipo vacío. La cobertura no se guarda: se calcula al abrir `/equipo`.

## PokeAPI

Base: `https://pokeapi.co/api/v2`.

- Listado: `GET /pokemon?limit=20&offset={n}`. El id se saca de la `url` de cada resultado. El sprite de la tarjeta es `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`.
- Para los 20 de la página se pide `GET /pokemon/{id}` (ahí están los tipos) y después `GET /pokemon-species/{id}` (ahí está el nombre en español). No se pide la página siguiente hasta pulsar "Cargar más". Cuando `next` viene `null`, se acaba el listado.
- Ficha: los mismos dos endpoints. El sprite de la ficha es `sprites.other["official-artwork"].front_default` y, si viene vacío, `sprites.front_default`.
- Búsqueda exacta: `GET /pokemon/{slug}` con el texto ya normalizado. Un 404 no impide comprobar coincidencias parciales; un 200 navega a `/pokemon/{id}`.
- Búsqueda por prefijo (C1): las sugerencias y los resultados se comparan contra el nombre visible, español cuando `pokemon-species` lo trae y, si no, el nombre de la API. El índice cubre toda la Pokédex y se conserva en memoria durante la sesión; no se lanza una petición por tecla. Las sugerencias muestran hasta cinco coincidencias y permiten abrir la ficha. Al confirmar, una coincidencia exacta abre la ficha; si no, la rejilla muestra todas las coincidencias de prefijo en orden de Pokédex, sin paginación. Sin coincidencias se aplica el estado de R6.
- Cobertura: de cada Pokémon del equipo se toman sus tipos (datos ya pedidos o `GET /pokemon/{id}`). De cada slug distinto, una sola vez, `GET /type/{slug}`. "Golpea con ventaja" es la unión de `damage_relations.double_damage_to`. "Recibe daño doble" es la unión de `damage_relations.double_damage_from`. Se pintan con el nombre español de la tabla de tipos, ordenados alfabéticamente.
- Durante la sesión, una respuesta ya obtenida no se vuelve a pedir (un mapa en memoria por id y por tipo basta).

Etiquetas de las estadísticas, en este orden: `hp` PS, `attack` Ataque, `defense` Defensa, `special-attack` Ataque especial, `special-defense` Defensa especial, `speed` Velocidad.

## Piezas

```text
src/
  main.tsx                 # fuentes, estilos, arranque
  App.tsx                  # BrowserRouter, Marco, Routes
  index.css                # @import "tailwindcss" y @theme
  api/pokeapi.ts           # fetch, caché, mapeo a los tipos de arriba
  api/tipos.ts             # tabla slug → etiqueta, color y color de texto
  storage/equipo.ts        # leer, añadir y quitar ids
  domain/cobertura.ts      # uniones de double_damage_to / from
  components/Marco.tsx
  components/TarjetaPokemon.tsx
  components/InsigniaTipo.tsx
  pages/CatalogoPage.tsx
  pages/FichaPage.tsx
  pages/EquipoPage.tsx
```

`InsigniaTipo` recibe un `TipoId` y pinta la etiqueta española con las clases de la tabla. Las insignias tienen forma de píldora compacta, con contraste legible y sin bisel. No hay más componentes de los que hagan falta para estas tres pantallas.

## Tokens

En `src/index.css`, después de `@import "tailwindcss"`:

```css
@theme {
  --font-sans: "IBM Plex Sans", sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  --color-fondo: #f5f3ec;
  --color-fondo-salvia: #e8eee5;
  --color-superficie: #fffdf8;
  --color-superficie-suave: #edf2e9;
  --color-superficie-sombra: #f0ede5;
  --color-tinta: #25332d;
  --color-tinta-suave: #66736b;
  --color-linea: #e3e7de;
  --color-marca: #2f6b55;
  --color-marca-fuerte: #245340;
  --color-marca-suave: #e3efe6;
  --color-acento: #e8ad45;
  --color-acento-suave: #fff1cf;

  --color-tipo-normal: #a8a77a;
  --color-tipo-fire: #ee8130;
  --color-tipo-water: #739cf4;
  --color-tipo-grass: #7ac74c;
  --color-tipo-electric: #f7d02c;
  --color-tipo-ice: #96d9d6;
  --color-tipo-fighting: #c22e28;
  --color-tipo-poison: #a33ea1;
  --color-tipo-ground: #e2bf65;
  --color-tipo-flying: #a98ff3;
  --color-tipo-psychic: #f6799c;
  --color-tipo-bug: #a6b91a;
  --color-tipo-rock: #b6a136;
  --color-tipo-ghost: #735797;
  --color-tipo-dragon: #6f35fc;
  --color-tipo-dark: #705746;
  --color-tipo-steel: #b7b7ce;
  --color-tipo-fairy: #d685ad;
}
```

Eso crea utilidades como `bg-fondo`, `bg-fondo-salvia`, `bg-superficie`, `bg-superficie-sombra`, `text-tinta`, `bg-marca` y `bg-tipo-fire`. Definir estos colores no borra la paleta por defecto de Tailwind: la rule `ui-dex` prohíbe usarla para pintar la app. Los tokens sirven de base a los gradientes CSS sutiles del fondo y las superficies; no se sustituye el ambiente por un relleno plano.

En `src/main.tsx` se importan los CSS de Fontsource (sans 400 y 600, mono 500) antes que `./index.css`.

## Tabla de tipos

El texto de la insignia usa el color indicado para cada fondo y debe conservar contraste legible. La asociación cromática de cada tipo se mantiene, con los matices afinados para legibilidad; el estilo de píldora no cambia el dato ni su etiqueta.

| Slug | Etiqueta | Fondo | Texto |
| --- | --- | --- | --- |
| normal | Normal | `bg-tipo-normal` | `text-tinta` |
| fire | Fuego | `bg-tipo-fire` | `text-tinta` |
| water | Agua | `bg-tipo-water` | `text-tinta` |
| grass | Planta | `bg-tipo-grass` | `text-tinta` |
| electric | Eléctrico | `bg-tipo-electric` | `text-tinta` |
| ice | Hielo | `bg-tipo-ice` | `text-tinta` |
| fighting | Lucha | `bg-tipo-fighting` | `text-superficie` |
| poison | Veneno | `bg-tipo-poison` | `text-superficie` |
| ground | Tierra | `bg-tipo-ground` | `text-tinta` |
| flying | Volador | `bg-tipo-flying` | `text-tinta` |
| psychic | Psíquico | `bg-tipo-psychic` | `text-tinta` |
| bug | Bicho | `bg-tipo-bug` | `text-tinta` |
| rock | Roca | `bg-tipo-rock` | `text-tinta` |
| ghost | Fantasma | `bg-tipo-ghost` | `text-superficie` |
| dragon | Dragón | `bg-tipo-dragon` | `text-superficie` |
| dark | Siniestro | `bg-tipo-dark` | `text-superficie` |
| steel | Acero | `bg-tipo-steel` | `text-tinta` |
| fairy | Hada | `bg-tipo-fairy` | `text-tinta` |

## Tarjeta holográfica (T10)

Apartado extra de pulido visual. Las tarjetas del catálogo (`TarjetaPokemon`, también en resultados por prefijo y en el filtro de amenaza) se comportan como una carta coleccionable con lámina holográfica, a la manera de las cartas "holo" del juego de cartas. No cambia datos, rutas, textos ni contratos: solo el aspecto y la interacción de la tarjeta. La ficha y `/equipo` no llevan este efecto.

Referencia de técnica: el efecto holográfico en CSS popularizado por Simon Goellner (simeydotme, `pokemon-cards-css`, GPL-3.0). Se toma la idea —variables CSS que siguen al puntero, inclinación 3D, capas con degradados y `mix-blend-mode`— pero la implementación es propia; no se copia código ni imágenes de ese repositorio y no se añaden dependencias.

**En reposo.** La tarjeta se ve como hasta ahora: superficie clara, borde fino, sombra suave. Como única pista de que es "holo", el borde del área de ilustración puede llevar un filo iridiscente muy tenue y estático.

**Interacción con puntero fino** (`(hover: hover) and (pointer: fine)`):

- La tarjeta se inclina en 3D siguiendo la posición del puntero, con `perspective` en el contenedor y un giro máximo de unos 12° por eje. El movimiento se suaviza (interpolación por `requestAnimationFrame` o muelle sencillo), sin saltos al entrar ni al salir; al salir, vuelve al reposo con suavidad.
- La posición del puntero se expone como propiedades CSS personalizadas (por ejemplo `--holo-x`, `--holo-y` en porcentaje, `--holo-rx`, `--holo-ry` en grados y `--holo-intensidad` de 0 a 1). Se escriben directamente en el estilo del elemento mediante una referencia: el movimiento del puntero no provoca renders de React.
- **Lámina holográfica** sobre el área de ilustración, como la ventana de arte de una carta holo: un degradado iridiscente repetido (arcoíris suave en bandas diagonales) combinado con un patrón fino de brillo, con `mix-blend-mode` (`color-dodge`, `overlay` o `soft-light`) y su posición desplazada según el puntero, de modo que los colores "corran" al mover la carta. El matiz dominante se inclina hacia el color del primer tipo del Pokémon (`--color-tipo-*`), sin perder el arcoíris.
- **Destello** (glare): un brillo radial claro centrado en la posición del puntero que recorre toda la tarjeta, de baja opacidad sobre la zona de texto para que número, nombre e insignias sigan nítidos y legibles.
- **Profundidad:** el sprite flota ligeramente por delante de la lámina (desplazamiento en Z o paralaje leve) y la sombra de la tarjeta se desplaza en sentido contrario a la inclinación, siempre con sombras arbitrarias suaves.
- Toda la capa holográfica tiene `pointer-events: none` y `aria-hidden`; nunca intercepta el clic ni cambia el enlace.

**Teclado.** Con `focus-visible`, la tarjeta muestra el foco visible de siempre y la lámina hace un barrido automático breve y suave (sin depender del puntero), de modo que el efecto no dependa solo de `hover`.

**Táctil y sin hover.** Sin inclinación ni seguimiento: el desplazamiento de la página no se ve afectado. Basta el reposo con el filo iridiscente.

**Movimiento reducido.** Con `prefers-reduced-motion: reduce` no hay inclinación, paralaje ni barridos animados. Durante `hover` o foco puede verse la lámina estática con baja opacidad.

**Límites.** Sin `backdrop-blur`, sin `shadow-lg`/`shadow-xl`/`shadow-2xl` y sin la paleta por defecto de Tailwind; los colores salen de los tokens de `@theme` y de la tabla de tipos. Sin imágenes externas: todo se dibuja con CSS. Sin librerías nuevas. El catálogo sigue fluido con 20 o más tarjetas visibles (solo la tarjeta bajo el puntero anima).

**Piezas.** La lógica de interacción vive en `src/components/TarjetaPokemon.tsx` o en un módulo pequeño junto a ella (por ejemplo `src/components/holo.ts` con el cálculo puro de posición e inclinación). Los estilos de las capas viven en `src/index.css`, en una capa `@layer components`, usando las variables anteriores.

## Variación cromática holográfica (T11)

El arcoíris fijo de la lámina holográfica se sustituye por una paleta propia de cada Pokémon, derivada del color de su primer tipo. Las franjas y los brillos deben variar de forma perceptible entre tipos, conservar el carácter iridiscente y mantener contraste suficiente para que el sprite siga siendo nítido. Si el Pokémon tiene un segundo tipo, puede usarse como acento; la paleta no debe depender de colores aleatorios ni alterar el contenido de la tarjeta. Se reutilizan los tokens `--color-tipo-*` existentes y el cambio queda limitado a la tarjeta holográfica.

## C1 — Búsqueda y filtro por cobertura

La implementación corresponde a T9 de `specs/tareas.md`. El catálogo acepta `?amenaza={slug}`. Con ese parámetro se pide `GET /type/{slug}` y se leen los tipos de `damage_relations.double_damage_from`: son los que golpean a la amenaza con ventaja. De cada uno de esos tipos se usa el array `pokemon` que ya devuelve `GET /type/{ese-tipo}`, y la rejilla muestra la unión, sin la paginación normal. La búsqueda y las sugerencias se muestran desactivadas; "Quitar filtro" navega a `/`.

Sin filtro de amenaza, el campo muestra sugerencias al escribir. El índice de nombres incluye toda la Pokédex y los nombres en español disponibles; se reutiliza durante la sesión y no se consulta PokeAPI por cada tecla. Las coincidencias ignoran mayúsculas y espacios extremos, y se limitan a nombres que empiezan por la consulta. Se muestran hasta cinco sugerencias, cada una enlazada a la ficha. Al enviar la búsqueda, una coincidencia exacta por nombre visible o slug abre la ficha; en otro caso, se muestran todos los resultados por prefijo en orden de Pokédex y sin paginación. Si no hay resultados, se conserva el catálogo y se muestra el estado de R6.
