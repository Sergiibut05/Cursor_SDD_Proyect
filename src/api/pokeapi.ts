import { TIPOS, type TipoId } from "./tipos.ts";

const BASE = "https://pokeapi.co/api/v2";
const SPRITE_TARJETA =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export type PokemonResumen = {
  id: number;
  nombre: string;
  sprite: string;
  tipos: TipoId[];
};

export type PokemonFicha = PokemonResumen & {
  alturaM: number;
  pesoKg: number;
  estadisticas: { clave: string; nombre: string; valor: number }[];
};

const ETIQUETAS_ESTADISTICA: { clave: string; nombre: string }[] = [
  { clave: "hp", nombre: "PS" },
  { clave: "attack", nombre: "Ataque" },
  { clave: "defense", nombre: "Defensa" },
  { clave: "special-attack", nombre: "Ataque especial" },
  { clave: "special-defense", nombre: "Defensa especial" },
  { clave: "speed", nombre: "Velocidad" },
];

type PokemonApi = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null };
    };
  };
};

type SpeciesApi = {
  names: { name: string; language: { name: string } }[];
};

export type TipoApi = {
  name: string;
  damage_relations: {
    double_damage_to: { name: string }[];
    double_damage_from: { name: string }[];
  };
  pokemon?: { pokemon: { name: string; url: string } }[];
};

type ListadoApi = {
  next: string | null;
  count?: number;
  results: { name: string; url: string }[];
};

export type PokemonIndice = {
  id: number;
  nombre: string;
  nombreApi: string;
};

export class PokeApiHttpError extends Error {
  readonly ruta: string;
  readonly status: number;

  constructor(ruta: string, status: number) {
    super(`PokeAPI ${ruta} respondió ${status}`);
    this.name = "PokeApiHttpError";
    this.ruta = ruta;
    this.status = status;
  }
}

export class PokemonNoEncontradoError extends Error {
  readonly slug: string;

  constructor(slug: string) {
    super(`No existe el Pokémon "${slug}".`);
    this.name = "PokemonNoEncontradoError";
    this.slug = slug;
  }
}

const cachePokemon = new Map<number, Promise<PokemonApi>>();
const cacheSpecies = new Map<number, Promise<SpeciesApi>>();
const cacheTipo = new Map<TipoId, Promise<TipoApi>>();
let indiceNombres: Promise<PokemonIndice[]> | null = null;

function idDesdeUrl(url: string): number {
  const limpia = url.replace(/\/$/, "");
  const id = Number(limpia.slice(limpia.lastIndexOf("/") + 1));
  if (!Number.isFinite(id)) {
    throw new Error(`No se pudo leer el id de ${url}`);
  }
  return id;
}

async function getJson<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(`${BASE}${ruta}`);
  if (!respuesta.ok) {
    throw new PokeApiHttpError(ruta, respuesta.status);
  }
  return (await respuesta.json()) as T;
}

export function normalizarBusqueda(texto: string): string {
  return texto.trim().toLowerCase().replace(/\s+/g, "-");
}

export function normalizarCoincidencia(texto: string): string {
  return texto.trim().toLocaleLowerCase("es");
}

export function coincidePorPrefijo(nombre: string, consulta: string): boolean {
  const prefijo = normalizarCoincidencia(consulta);
  return prefijo !== "" && normalizarCoincidencia(nombre).startsWith(prefijo);
}

export async function buscarPokemon(
  texto: string,
): Promise<{ id: number }> {
  const slug = normalizarBusqueda(texto);

  try {
    const pokemon = await getJson<{ id: number }>(`/pokemon/${slug}`);
    return { id: pokemon.id };
  } catch (error) {
    if (error instanceof PokeApiHttpError && error.status === 404) {
      throw new PokemonNoEncontradoError(slug);
    }
    throw error;
  }
}

async function obtenerPokemonApi(id: number): Promise<PokemonApi> {
  const guardado = cachePokemon.get(id);
  if (guardado) {
    return guardado;
  }
  const solicitud = getJson<PokemonApi>(`/pokemon/${id}`)
    .catch((error: unknown) => {
      cachePokemon.delete(id);
      throw error;
    });
  cachePokemon.set(id, solicitud);
  return solicitud;
}

async function obtenerSpeciesApi(id: number): Promise<SpeciesApi> {
  const guardado = cacheSpecies.get(id);
  if (guardado) {
    return guardado;
  }
  const solicitud = getJson<SpeciesApi>(`/pokemon-species/${id}`)
    .catch((error: unknown) => {
      cacheSpecies.delete(id);
      throw error;
    });
  cacheSpecies.set(id, solicitud);
  return solicitud;
}

async function enParalelo<T, R>(
  valores: readonly T[],
  limite: number,
  procesar: (valor: T) => Promise<R>,
): Promise<R[]> {
  const resultado = Array.from({ length: valores.length }) as R[];
  let siguiente = 0;

  await Promise.all(
    Array.from({ length: Math.min(limite, valores.length) }, async () => {
      while (siguiente < valores.length) {
        const indice = siguiente++;
        resultado[indice] = await procesar(valores[indice]);
      }
    }),
  );

  return resultado;
}

async function cargarIndiceNombres(): Promise<PokemonIndice[]> {
  const listado = await getJson<ListadoApi>("/pokemon?limit=100000&offset=0");
  const entradas = [...listado.results]
    .map((resultado) => ({
      id: idDesdeUrl(resultado.url),
      nombreApi: resultado.name,
    }))
    .sort((a, b) => a.id - b.id);

  return enParalelo(entradas, 8, async ({ id, nombreApi }) => {
    try {
      const species = await obtenerSpeciesApi(id);
      return { id, nombre: nombreDe(species, nombreApi), nombreApi };
    } catch (error) {
      if (error instanceof PokeApiHttpError && error.status === 404) {
        return { id, nombre: nombreApi.replaceAll("-", " "), nombreApi };
      }
      throw error;
    }
  });
}

export function obtenerIndiceNombres(): Promise<PokemonIndice[]> {
  if (indiceNombres) {
    return indiceNombres;
  }

  const solicitud = cargarIndiceNombres().catch((error: unknown) => {
    indiceNombres = null;
    throw error;
  });
  indiceNombres = solicitud;
  return solicitud;
}

export async function obtenerResumenes(
  ids: readonly number[],
): Promise<PokemonResumen[]> {
  const idsUnicos = [...new Set(ids)].sort((a, b) => a - b);
  return enParalelo(idsUnicos, 8, async (id) => {
    const pokemon = await obtenerPokemonApi(id);
    const species = await obtenerSpeciesApi(id).catch((error: unknown) => {
      if (error instanceof PokeApiHttpError && error.status === 404) {
        return { names: [] };
      }
      throw error;
    });
    return aResumen(pokemon, species);
  });
}

export async function listarPokemonPorAmenaza(
  amenaza: TipoId,
): Promise<PokemonResumen[]> {
  const relacionesAmenaza = await obtenerTipo(amenaza);
  const tiposQueLaGolpean = relacionesAmenaza.damage_relations.double_damage_from
    .map(({ name }) => name)
    .filter(esTipoId);
  const relacionesAtaque = await Promise.all(
    tiposQueLaGolpean.map(obtenerTipo),
  );
  const ids = new Set<number>();

  for (const tipo of relacionesAtaque) {
    for (const entrada of tipo.pokemon ?? []) {
      ids.add(idDesdeUrl(entrada.pokemon.url));
    }
  }

  return obtenerResumenes([...ids]);
}

function esTipoId(valor: string): valor is TipoId {
  return Object.hasOwn(TIPOS, valor);
}

function tiposDe(pokemon: PokemonApi): TipoId[] {
  return [...pokemon.types]
    .sort((a, b) => a.slot - b.slot)
    .map((entrada) => entrada.type.name)
    .filter(esTipoId);
}

function nombreDe(species: SpeciesApi, nameApi: string): string {
  const enEspanol = species.names.find((entrada) => entrada.language.name === "es");
  if (enEspanol?.name) {
    return enEspanol.name;
  }
  return nameApi.replaceAll("-", " ");
}

function spriteFicha(pokemon: PokemonApi): string {
  return (
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default ??
    ""
  );
}

function estadisticasDe(pokemon: PokemonApi): PokemonFicha["estadisticas"] {
  return ETIQUETAS_ESTADISTICA.map(({ clave, nombre }) => {
    const estadistica = pokemon.stats.find((entrada) => entrada.stat.name === clave);
    return { clave, nombre, valor: estadistica?.base_stat ?? 0 };
  });
}

function aResumen(pokemon: PokemonApi, species: SpeciesApi): PokemonResumen {
  return {
    id: pokemon.id,
    nombre: nombreDe(species, pokemon.name),
    sprite: `${SPRITE_TARJETA}/${pokemon.id}.png`,
    tipos: tiposDe(pokemon),
  };
}

export async function listarPokemon(offset: number): Promise<{
  items: PokemonResumen[];
  siguiente: string | null;
}> {
  const listado = await getJson<ListadoApi>(`/pokemon?limit=20&offset=${offset}`);
  const items = await Promise.all(
    listado.results.slice(0, 20).map(async (resultado) => {
      const id = idDesdeUrl(resultado.url);
      const pokemon = await obtenerPokemonApi(id);
      const species = await obtenerSpeciesApi(id);
      return aResumen(pokemon, species);
    }),
  );
  return { items, siguiente: listado.next };
}

export async function obtenerFicha(id: number): Promise<PokemonFicha> {
  const pokemon = await obtenerPokemonApi(id);
  const species = await obtenerSpeciesApi(id);
  const resumen = aResumen(pokemon, species);
  return {
    ...resumen,
    sprite: spriteFicha(pokemon),
    alturaM: pokemon.height / 10,
    pesoKg: pokemon.weight / 10,
    estadisticas: estadisticasDe(pokemon),
  };
}

export async function obtenerTipo(slug: TipoId): Promise<TipoApi> {
  const guardado = cacheTipo.get(slug);
  if (guardado) {
    return guardado;
  }

  const solicitud = getJson<TipoApi>(`/type/${slug}`)
    .then((tipo) => {
      cacheTipo.set(slug, Promise.resolve(tipo));
      return tipo;
    })
    .catch((error: unknown) => {
      cacheTipo.delete(slug);
      throw error;
    });
  cacheTipo.set(slug, solicitud);
  return solicitud;
}
