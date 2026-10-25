import assert from "node:assert/strict";
import { test } from "node:test";
import { PokeApiHttpError } from "../src/api/pokeapi.ts";
import {
  estadoFichaInicial,
  formatearMedida,
  idDesdeRuta,
  mensajeErrorFicha,
  reducirEstadoFicha,
} from "../src/pages/fichaEstado.ts";

test("valida de forma segura el id de la ruta", () => {
  assert.equal(idDesdeRuta("25"), 25);
  assert.equal(idDesdeRuta(undefined), null);
  assert.equal(idDesdeRuta(""), null);
  assert.equal(idDesdeRuta("0"), null);
  assert.equal(idDesdeRuta("-25"), null);
  assert.equal(idDesdeRuta("25/extra"), null);
  assert.equal(idDesdeRuta("9007199254740992"), null);
});

test("formatea altura y peso con una cifra decimal y coma", () => {
  assert.equal(formatearMedida(0.4, "m"), "0,4 m");
  assert.equal(formatearMedida(6, "kg"), "6,0 kg");
});

test("la ficha representa carga, resultado y error con estados explícitos", () => {
  const ficha = {
    id: 25,
    nombre: "Pikachu",
    sprite: "https://example.com/pikachu.png",
    tipos: ["electric"],
    alturaM: 0.4,
    pesoKg: 6,
    estadisticas: [],
  };
  const cargando = reducirEstadoFicha(estadoFichaInicial, {
    tipo: "iniciar",
  });
  const cargada = reducirEstadoFicha(cargando, {
    tipo: "resultado",
    ficha,
  });
  const error = reducirEstadoFicha(cargando, {
    tipo: "fallo",
    mensaje: "No se ha podido cargar la ficha.",
  });

  assert.deepEqual(estadoFichaInicial, { tipo: "cargando" });
  assert.deepEqual(cargando, { tipo: "cargando" });
  assert.deepEqual(cargada, { tipo: "cargada", ficha });
  assert.deepEqual(error, {
    tipo: "error",
    mensaje: "No se ha podido cargar la ficha.",
  });
});

test("distingue un Pokémon inexistente de un fallo de conexión", () => {
  assert.equal(
    mensajeErrorFicha(new PokeApiHttpError("/pokemon/99999", 404)),
    "No hay un Pokémon con ese número.",
  );
  assert.match(mensajeErrorFicha(new TypeError("network")), /Comprueba la conexión/);
});
