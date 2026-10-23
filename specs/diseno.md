# Diseño — Visor Pokémon

Las decisiones de aquí están cerradas. Una tarea no las cambia.

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

## Marco

Todo el sitio va dentro del mismo aparato, definido en `src/components/Marco.tsx`.

- El fondo de la página (`body`) es la carcasa: `bg-carcasa text-pantalla font-sans`.
- Arriba, una barra con un círculo `bg-piloto` (el único rojo de la interfaz), el texto `VISOR POKÉMON` en `font-mono` con tracking amplio, el enlace principal "Catálogo" (`/`) y, aparte, el enlace "Equipo" (`/equipo`). El enlace de la ruta activa lleva subrayado. Entrar en la app abre el catálogo.
- Debajo, la pantalla: `bg-pantalla text-tinta`, borde de 4 px `border-linea`, padding generoso, sin sombra y sin radio grande. El contenido de la ruta se pinta dentro.
- El conjunto tiene un ancho máximo cómodo de leer (`max-w-5xl`) y queda centrado.

## Pantallas

**Catálogo.** Rejilla de tarjetas. Cada tarjeta es un enlace a `/pokemon/:id` y muestra `#025` en mono, el nombre, el sprite y las insignias de tipo. Debajo de la rejilla, el botón "Cargar más". Encima, un campo de texto y un botón "Buscar". Los estados de R3 y R6 son texto dentro de la pantalla, no un modal.

**Ficha.** Sprite grande, número, nombre, insignias, altura, peso y las seis estadísticas en el orden de la API (PS, Ataque, Defensa, Ataque especial, Defensa especial, Velocidad), cada una con su nombre y su valor numérico. Un enlace "Volver al catálogo". A un lado, sin tapar esos datos, un botón "Añadir al equipo" o "Quitar del equipo" según el id esté guardado. La ficha se lee igual si nadie pulsa ese botón.

**Equipo.** Apartado extra. Lista de los Pokémon guardados, cada uno con sprite, nombre y un control "Quitar". Si no hay ninguno, el texto de R13 y nada más. Si hay alguno, dos grupos de insignias: "Golpea con ventaja" y "Recibe daño doble".

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
- Búsqueda: `GET /pokemon/{slug}` con el texto ya normalizado. Un 404 es el caso R6. Un 200 navega a `/pokemon/{id}`.
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

`InsigniaTipo` recibe un `TipoId` y pinta la etiqueta española con las clases de la tabla. No hay más componentes de los que hagan falta para estas tres pantallas.

## Tokens

En `src/index.css`, después de `@import "tailwindcss"`:

```css
@theme {
  --font-sans: "IBM Plex Sans", sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  --color-carcasa: #161311;
  --color-pantalla: #f4efe4;
  --color-tinta: #1c1915;
  --color-piloto: #e23d2b;
  --color-linea: #2a2420;

  --color-tipo-normal: #a8a77a;
  --color-tipo-fire: #ee8130;
  --color-tipo-water: #6390f0;
  --color-tipo-grass: #7ac74c;
  --color-tipo-electric: #f7d02c;
  --color-tipo-ice: #96d9d6;
  --color-tipo-fighting: #c22e28;
  --color-tipo-poison: #a33ea1;
  --color-tipo-ground: #e2bf65;
  --color-tipo-flying: #a98ff3;
  --color-tipo-psychic: #f95587;
  --color-tipo-bug: #a6b91a;
  --color-tipo-rock: #b6a136;
  --color-tipo-ghost: #735797;
  --color-tipo-dragon: #6f35fc;
  --color-tipo-dark: #705746;
  --color-tipo-steel: #b7b7ce;
  --color-tipo-fairy: #d685ad;
}
```

Eso crea utilidades `bg-carcasa`, `text-tinta`, `bg-tipo-fire` y el resto. Definir estos colores no borra la paleta por defecto de Tailwind: la rule `ui-dex` prohíbe usarla para pintar la app.

En `src/main.tsx` se importan los CSS de Fontsource (sans 400 y 600, mono 500) antes que `./index.css`.

## Tabla de tipos

El texto de la insignia es `tinta` sobre los fondos claros y `pantalla` sobre los oscuros.

| Slug | Etiqueta | Fondo | Texto |
| --- | --- | --- | --- |
| normal | Normal | `bg-tipo-normal` | tinta |
| fire | Fuego | `bg-tipo-fire` | pantalla |
| water | Agua | `bg-tipo-water` | pantalla |
| grass | Planta | `bg-tipo-grass` | tinta |
| electric | Eléctrico | `bg-tipo-electric` | tinta |
| ice | Hielo | `bg-tipo-ice` | tinta |
| fighting | Lucha | `bg-tipo-fighting` | pantalla |
| poison | Veneno | `bg-tipo-poison` | pantalla |
| ground | Tierra | `bg-tipo-ground` | tinta |
| flying | Volador | `bg-tipo-flying` | tinta |
| psychic | Psíquico | `bg-tipo-psychic` | pantalla |
| bug | Bicho | `bg-tipo-bug` | tinta |
| rock | Roca | `bg-tipo-rock` | tinta |
| ghost | Fantasma | `bg-tipo-ghost` | pantalla |
| dragon | Dragón | `bg-tipo-dragon` | pantalla |
| dark | Siniestro | `bg-tipo-dark` | pantalla |
| steel | Acero | `bg-tipo-steel` | tinta |
| fairy | Hada | `bg-tipo-fairy` | tinta |

## Cambio reservado

No se construye ahora. Cuando se active C1, el catálogo acepta `?amenaza={slug}`. Con ese parámetro se pide `GET /type/{slug}` y se leen los tipos de `damage_relations.double_damage_from`: son los que golpean a la amenaza con ventaja. De cada uno de esos tipos se usa el array `pokemon` que ya devuelve `GET /type/{ese-tipo}`, y la rejilla muestra la unión, sin la paginación normal. La búsqueda se pinta desactivada y "Quitar filtro" navega a `/`.
