import assert from "node:assert/strict";
import { test } from "node:test";
import {
  listarPokemon,
  obtenerFicha,
  obtenerTipo,
} from "../src/api/pokeapi.ts";

test("listarPokemon mapea como máximo 20 resultados", async () => {
  const llamadas = [];
  const fetchOriginal = globalThis.fetch;
  const resultados = Array.from({ length: 21 }, (_, indice) => {
    const id = indice + 1;
    return {
      name: `pokemon-${id}`,
      url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
    };
  });

  globalThis.fetch = async (input) => {
    const url = String(input);
    llamadas.push(url);

    if (url.endsWith("/pokemon?limit=20&offset=0")) {
      return Response.json({
        next: "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
        results: resultados,
      });
    }

    const pokemonId = url.match(/\/pokemon\/(\d+)$/)?.[1];
    if (pokemonId) {
      return Response.json({
        id: Number(pokemonId),
        name: `pokemon-${pokemonId}`,
        height: 4,
        weight: 60,
        types: [],
        stats: [],
        sprites: { front_default: null },
      });
    }

    const speciesId = url.match(/\/pokemon-species\/(\d+)$/)?.[1];
    if (speciesId) {
      return Response.json({
        names: [
          {
            name: `pokemon-${speciesId}`,
            language: { name: "es" },
          },
        ],
      });
    }

    throw new Error(`URL inesperada: ${url}`);
  };

  try {
    const resultado = await listarPokemon(0);

    assert.equal(resultado.items.length, 20);
    assert.deepEqual(
      resultado.items.map(({ id }) => id),
      Array.from({ length: 20 }, (_, indice) => indice + 1),
    );
    assert.equal(
      llamadas.some((url) => url.endsWith("/pokemon/21")),
      false,
    );
    assert.equal(
      llamadas.some((url) => url.endsWith("/pokemon-species/21")),
      false,
    );
    assert.equal(
      resultado.siguiente,
      "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
    );
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("listarPokemon conserva el nombre de API si la especie no tiene nombre español", async () => {
  const fetchOriginal = globalThis.fetch;

  globalThis.fetch = async (input) => {
    const url = String(input);

    if (url.endsWith("/pokemon?limit=20&offset=252")) {
      return Response.json({
        next: null,
        results: [
          {
            name: "treecko",
            url: "https://pokeapi.co/api/v2/pokemon/252/",
          },
        ],
      });
    }

    if (url.endsWith("/pokemon/252")) {
      return Response.json({
        id: 252,
        name: "treecko",
        height: 5,
        weight: 50,
        types: [{ slot: 1, type: { name: "grass" } }],
        stats: [],
        sprites: { front_default: null },
      });
    }

    if (url.endsWith("/pokemon-species/252")) {
      return Response.json({
        names: [{ name: "Treecko", language: { name: "en" } }],
      });
    }

    throw new Error(`URL inesperada: ${url}`);
  };

  try {
    const resultado = await listarPokemon(252);

    assert.deepEqual(resultado.items, [
      {
        id: 252,
        nombre: "treecko",
        sprite:
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/252.png",
        tipos: ["grass"],
      },
    ]);
    assert.equal(resultado.siguiente, null);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("obtenerFicha mapea a Pikachu y reutiliza la caché", async () => {
  const llamadas = [];
  const fetchOriginal = globalThis.fetch;
  const sprite =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png";

  globalThis.fetch = async (input) => {
    const url = String(input);
    llamadas.push(url);

    if (url.endsWith("/pokemon/25")) {
      return Response.json({
        id: 25,
        name: "pikachu",
        height: 4,
        weight: 60,
        types: [{ slot: 1, type: { name: "electric" } }],
        stats: [
          { base_stat: 35, stat: { name: "hp" } },
          { base_stat: 55, stat: { name: "attack" } },
          { base_stat: 40, stat: { name: "defense" } },
          { base_stat: 50, stat: { name: "special-attack" } },
          { base_stat: 50, stat: { name: "special-defense" } },
          { base_stat: 90, stat: { name: "speed" } },
        ],
        sprites: {
          front_default: "https://example.com/pikachu.png",
          other: { "official-artwork": { front_default: sprite } },
        },
      });

    }

    if (url.endsWith("/pokemon-species/25")) {
      return Response.json({
        names: [
          { name: "Pikachu", language: { name: "es" } },
          { name: "Pikachu English", language: { name: "en" } },
        ],
      });
    }

    throw new Error(`URL inesperada: ${url}`);
  };

  try {
    const ficha = await obtenerFicha(25);

    assert.equal(ficha.id, 25);
    assert.equal(ficha.nombre, "Pikachu");
    assert.equal(ficha.sprite, sprite);
    assert.deepEqual(ficha.tipos, ["electric"]);
    assert.equal(ficha.alturaM, 0.4);
    assert.equal(ficha.pesoKg, 6);
    assert.deepEqual(ficha.estadisticas, [
      { clave: "hp", nombre: "PS", valor: 35 },
      { clave: "attack", nombre: "Ataque", valor: 55 },
      { clave: "defense", nombre: "Defensa", valor: 40 },
      { clave: "special-attack", nombre: "Ataque especial", valor: 50 },
      { clave: "special-defense", nombre: "Defensa especial", valor: 50 },
      { clave: "speed", nombre: "Velocidad", valor: 90 },
    ]);

    const llamadasTrasPrimeraFicha = llamadas.length;
    await obtenerFicha(25);

    assert.equal(llamadas.length, llamadasTrasPrimeraFicha);
    assert.equal(
      llamadas.filter((url) => url.endsWith("/pokemon/25")).length,
      1,
    );
    assert.equal(
      llamadas.filter((url) => url.endsWith("/pokemon-species/25")).length,
      1,
    );
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("obtenerTipo reutiliza una petición concurrente y la caché de API", async () => {
  const llamadas = [];
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async (input) => {
    llamadas.push(String(input));
    return Response.json({
      name: "ghost",
      damage_relations: {
        double_damage_to: [{ name: "psychic" }],
        double_damage_from: [{ name: "dark" }],
      },
    });
  };

  try {
    const [primero, segundo] = await Promise.all([
      obtenerTipo("ghost"),
      obtenerTipo("ghost"),
    ]);
    const tercero = await obtenerTipo("ghost");

    assert.deepEqual(primero, segundo);
    assert.deepEqual(tercero, primero);
    assert.deepEqual(llamadas, ["https://pokeapi.co/api/v2/type/ghost"]);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
