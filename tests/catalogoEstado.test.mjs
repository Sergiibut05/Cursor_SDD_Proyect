import assert from "node:assert/strict";
import { test } from "node:test";
import {
  estadoCatalogoInicial,
  puedeCargarMas,
  reducirCatalogo,
} from "../src/pages/catalogoEstado.ts";

function pokemon(id) {
  return {
    id,
    nombre: `Pokemon ${id}`,
    sprite: `https://example.com/${id}.png`,
    tipos: ["grass"],
  };
}

test("la carga inicial está activa desde el primer estado y termina al resolver", () => {
  assert.equal(estadoCatalogoInicial.cargandoInicial, true);

  const cargado = reducirCatalogo(estadoCatalogoInicial, {
    tipo: "pagina-cargada",
    pagina: "inicial",
    items: [],
    siguiente: null,
  });
  assert.equal(cargado.cargandoInicial, false);
  assert.equal(cargado.error, false);

  const fallido = reducirCatalogo(estadoCatalogoInicial, { tipo: "error" });
  assert.equal(fallido.cargandoInicial, false);
  assert.equal(fallido.error, true);
});

test("el catálogo añade la página siguiente y se detiene cuando next es null", () => {
  const primeraPagina = [pokemon(1), pokemon(2)];
  let estado = reducirCatalogo(estadoCatalogoInicial, {
    tipo: "pagina-cargada",
    pagina: "inicial",
    items: primeraPagina,
    siguiente: "https://pokeapi.co/api/v2/pokemon?offset=2&limit=20",
  });

  assert.equal(puedeCargarMas(estado), true);

  estado = reducirCatalogo(estado, {
    tipo: "pagina-cargada",
    pagina: "siguiente",
    items: [pokemon(3)],
    siguiente: null,
  });

  assert.deepEqual(
    estado.items.map(({ id }) => id),
    [1, 2, 3],
  );
  assert.equal(estado.offset, 3);
  assert.equal(estado.siguiente, null);
  assert.equal(puedeCargarMas(estado), false);
});

test("un error al cargar más conserva los resultados ya visibles", () => {
  const siguiente = "https://pokeapi.co/api/v2/pokemon?offset=2&limit=20";
  let estado = reducirCatalogo(estadoCatalogoInicial, {
    tipo: "pagina-cargada",
    pagina: "inicial",
    items: [pokemon(1), pokemon(2)],
    siguiente,
  });
  estado = reducirCatalogo(estado, {
    tipo: "cargando",
    pagina: "siguiente",
  });
  estado = reducirCatalogo(estado, { tipo: "error" });

  assert.deepEqual(
    estado.items.map(({ id }) => id),
    [1, 2],
  );
  assert.equal(estado.siguiente, siguiente);
  assert.equal(estado.cargandoMas, false);
  assert.equal(estado.error, true);
});
