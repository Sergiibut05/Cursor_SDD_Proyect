import assert from "node:assert/strict";
import { test } from "node:test";
import {
  añadirAlEquipo,
  CLAVE_EQUIPO,
  leerEquipo,
  MAXIMO_EQUIPO,
  quitarDelEquipo,
} from "../src/storage/equipo.ts";

function crearAlmacen(valor = null) {
  let contenido = valor;
  const escrituras = [];
  return {
    escrituras,
    getItem(clave) {
      assert.equal(clave, CLAVE_EQUIPO);
      return contenido;
    },
    setItem(clave, nuevoValor) {
      assert.equal(clave, CLAVE_EQUIPO);
      escrituras.push(nuevoValor);
      contenido = nuevoValor;
    },
  };
}

test("el equipo vacío y JSON malformado se leen como equipo vacío", () => {
  assert.deepEqual(leerEquipo(crearAlmacen()), []);
  assert.deepEqual(leerEquipo(crearAlmacen("{")), []);
  assert.deepEqual(leerEquipo(crearAlmacen('{"equipo":[25]}')), []);
});

test("solo acepta arrays de ids numéricos válidos y normaliza duplicados y límite", () => {
  assert.deepEqual(leerEquipo(crearAlmacen("[25,25,6,4.5]")), []);
  assert.deepEqual(leerEquipo(crearAlmacen("[-1]")), []);
  assert.deepEqual(
    leerEquipo(crearAlmacen("[25,25,6,4,3,2,1,7,8]")),
    [25, 6, 4, 3, 2, 1],
  );
});

test("añadir guarda ids únicos en localStorage y no persiste un duplicado", () => {
  const almacenamiento = crearAlmacen("[25]");

  assert.deepEqual(añadirAlEquipo(6, almacenamiento), {
    equipo: [25, 6],
    resultado: "añadido",
  });
  assert.deepEqual(añadirAlEquipo(25, almacenamiento), {
    equipo: [25, 6],
    resultado: "duplicado",
  });
  assert.deepEqual(almacenamiento.escrituras, ["[25,6]"]);
});

test("añadir un séptimo id no modifica el equipo guardado", () => {
  const equipo = Array.from({ length: MAXIMO_EQUIPO }, (_, indice) => indice + 1);
  const almacenamiento = crearAlmacen(JSON.stringify(equipo));

  assert.deepEqual(añadirAlEquipo(7, almacenamiento), {
    equipo,
    resultado: "limite",
  });
  assert.deepEqual(almacenamiento.escrituras, []);
});

test("quitar elimina el id y no escribe si no estaba guardado", () => {
  const almacenamiento = crearAlmacen("[25,6,4]");

  assert.deepEqual(quitarDelEquipo(6, almacenamiento), {
    equipo: [25, 4],
    resultado: "quitado",
  });
  assert.deepEqual(quitarDelEquipo(3, almacenamiento), {
    equipo: [25, 4],
    resultado: "sin-cambios",
  });
  assert.deepEqual(almacenamiento.escrituras, ["[25,4]"]);
});
