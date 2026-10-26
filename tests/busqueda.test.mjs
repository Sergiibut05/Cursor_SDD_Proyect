import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buscarPokemon,
  coincidePorPrefijo,
  normalizarCoincidencia,
  normalizarBusqueda,
  PokeApiHttpError,
  PokemonNoEncontradoError,
} from "../src/api/pokeapi.ts";
import {
  estadoCatalogoInicial,
  reducirCatalogo,
} from "../src/pages/catalogoEstado.ts";

test("normalizarBusqueda recorta, pasa a minúsculas y convierte espacios en guiones", () => {
  assert.equal(normalizarBusqueda("  Mr Mime  "), "mr-mime");
  assert.equal(normalizarBusqueda("  Tapu   Koko "), "tapu-koko");
  assert.equal(normalizarBusqueda("PIKACHU"), "pikachu");
});

test("coincidencias por prefijo ignoran mayúsculas y espacios extremos", () => {
  assert.equal(normalizarCoincidencia("  MR M  "), "mr m");
  assert.equal(coincidePorPrefijo("Mr Mime", "  mr"), true);
  assert.equal(coincidePorPrefijo("Mr Mime", "Mime"), false);
  assert.equal(coincidePorPrefijo("Pikachu", "  "), false);
});

test("normalizar texto durante la edición no dispara peticiones", () => {
  const fetchOriginal = globalThis.fetch;
  const llamadas = [];
  globalThis.fetch = async (input) => {
    llamadas.push(String(input));
    return Response.json({ id: 25 });
  };

  try {
    for (const texto of ["p", "pi", "pik", "pika"]) {
      normalizarBusqueda(texto);
    }
    assert.deepEqual(llamadas, []);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("buscarPokemon consulta el slug normalizado y devuelve el id para navegar", async () => {
  const fetchOriginal = globalThis.fetch;
  const llamadas = [];
  globalThis.fetch = async (input) => {
    llamadas.push(String(input));
    return Response.json({ id: 122, name: "mr-mime" });
  };

  try {
    const resultado = await buscarPokemon("  Mr   Mime ");

    assert.deepEqual(resultado, { id: 122 });
    assert.deepEqual(llamadas, ["https://pokeapi.co/api/v2/pokemon/mr-mime"]);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("buscarPokemon distingue un 404 de errores HTTP y de red", async () => {
  const fetchOriginal = globalThis.fetch;

  try {
    globalThis.fetch = async () => new Response(null, { status: 404 });
    await assert.rejects(
      buscarPokemon("missing-no"),
      (error) => error instanceof PokemonNoEncontradoError,
    );

    globalThis.fetch = async () => new Response(null, { status: 503 });
    await assert.rejects(
      buscarPokemon("pikachu"),
      (error) =>
        error instanceof PokeApiHttpError &&
        error.status === 503 &&
        error.message.includes("503"),
    );

    const networkError = new TypeError("Failed to fetch");
    globalThis.fetch = async () => {
      throw networkError;
    };
    await assert.rejects(
      buscarPokemon("pikachu"),
      (error) => error === networkError,
    );
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("un 404 de búsqueda conserva los Pokémon ya cargados en el catálogo", async () => {
  const catalogo = reducirCatalogo(estadoCatalogoInicial, {
    tipo: "pagina-cargada",
    pagina: "inicial",
    items: [
      {
        id: 25,
        nombre: "Pikachu",
        sprite: "https://example.com/25.png",
        tipos: ["electric"],
      },
    ],
    siguiente: "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
  });
  const itemsVisibles = catalogo.items;
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 404 });

  try {
    await assert.rejects(
      buscarPokemon("no-existe"),
      (error) => error instanceof PokemonNoEncontradoError,
    );

    assert.strictEqual(catalogo.items, itemsVisibles);
    assert.equal(catalogo.items[0].nombre, "Pikachu");
    assert.equal(catalogo.siguiente, "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20");
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
