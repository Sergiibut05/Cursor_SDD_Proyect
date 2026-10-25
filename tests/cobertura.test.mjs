import assert from "node:assert/strict";
import { test } from "node:test";
import { calcularCobertura } from "../src/domain/cobertura.ts";

test("une relaciones, elimina duplicados, ordena por etiqueta e incluye intersección", () => {
  const cobertura = calcularCobertura([
    {
      double_damage_to: ["water", "fire", "water", "unknown"],
      double_damage_from: ["grass", "fire"],
    },
    {
      double_damage_to: ["grass", "water"],
      double_damage_from: ["fire", "ground"],
    },
  ]);

  assert.deepEqual(cobertura, {
    golpeaConVentaja: ["water", "fire", "grass"],
    recibeDanioDoble: ["fire", "grass", "ground"],
  });
  assert.ok(
    cobertura.golpeaConVentaja.some((tipo) =>
      cobertura.recibeDanioDoble.includes(tipo),
    ),
  );
});

test("sin relaciones devuelve ambas listas vacías", () => {
  assert.deepEqual(calcularCobertura([]), {
    golpeaConVentaja: [],
    recibeDanioDoble: [],
  });
});
