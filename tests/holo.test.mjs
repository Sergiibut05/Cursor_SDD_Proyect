import assert from "node:assert/strict";
import { test } from "node:test";
import {
  GIRO_MAXIMO,
  REPOSO,
  estadoAlEntrar,
  factorSuavizado,
  haConvergido,
  interpolar,
  objetivoDesdePuntero,
  reposoDesde,
  variablesCss,
} from "../src/components/holo.ts";

const caja = { left: 100, top: 200, width: 200, height: 300 };

test("el centro de la tarjeta da posición 50 % y ningún giro", () => {
  const estado = objetivoDesdePuntero(200, 350, caja);
  assert.equal(estado.x, 50);
  assert.equal(estado.y, 50);
  assert.equal(Math.abs(estado.rx), 0);
  assert.equal(Math.abs(estado.ry), 0);
  assert.equal(estado.intensidad, 1);
});

test("las esquinas dan porcentajes extremos y el giro máximo por eje", () => {
  const abajoDerecha = objetivoDesdePuntero(300, 500, caja);
  assert.equal(abajoDerecha.x, 100);
  assert.equal(abajoDerecha.y, 100);
  assert.equal(abajoDerecha.rx, GIRO_MAXIMO);
  assert.equal(abajoDerecha.ry, -GIRO_MAXIMO);

  const arribaIzquierda = objetivoDesdePuntero(100, 200, caja);
  assert.equal(arribaIzquierda.x, 0);
  assert.equal(arribaIzquierda.y, 0);
  assert.equal(arribaIzquierda.rx, -GIRO_MAXIMO);
  assert.equal(arribaIzquierda.ry, GIRO_MAXIMO);
});

test("un puntero fuera de la caja se limita y el giro nunca supera el máximo", () => {
  const fuera = objetivoDesdePuntero(-500, 5000, caja);
  assert.equal(fuera.x, 0);
  assert.equal(fuera.y, 100);
  assert.ok(Math.abs(fuera.rx) <= GIRO_MAXIMO);
  assert.ok(Math.abs(fuera.ry) <= GIRO_MAXIMO);
});

test("una caja sin tamaño devuelve el reposo", () => {
  assert.deepEqual(
    objetivoDesdePuntero(10, 10, { left: 0, top: 0, width: 0, height: 0 }),
    REPOSO,
  );
});

test("la interpolación avanza hacia el objetivo sin pasarse y converge", () => {
  const objetivo = objetivoDesdePuntero(300, 500, caja);
  let estado = REPOSO;
  const paso = factorSuavizado(1000 / 60);
  assert.ok(paso > 0 && paso < 1);

  estado = interpolar(estado, objetivo, paso);
  assert.ok(estado.rx > 0 && estado.rx < objetivo.rx);
  assert.ok(estado.intensidad > 0 && estado.intensidad < 1);
  assert.equal(haConvergido(estado, objetivo), false);

  for (let i = 0; i < 200; i += 1) {
    estado = interpolar(estado, objetivo, paso);
  }
  assert.equal(haConvergido(estado, objetivo), true);
});

test("el suavizado no depende de la frecuencia de refresco y se acota", () => {
  const a60 = factorSuavizado(1000 / 60);
  const dosA120 = 1 - (1 - factorSuavizado(1000 / 120)) ** 2;
  assert.ok(Math.abs(a60 - dosA120) < 1e-9);
  assert.equal(factorSuavizado(0), 0);
  assert.ok(factorSuavizado(10_000) < 1);
});

test("al salir se vuelve al reposo conservando el punto de luz", () => {
  const activo = objetivoDesdePuntero(150, 260, caja);
  const reposo = reposoDesde(activo);
  assert.equal(reposo.x, activo.x);
  assert.equal(reposo.y, activo.y);
  assert.equal(reposo.rx, 0);
  assert.equal(reposo.ry, 0);
  assert.equal(reposo.intensidad, 0);
});

test("al entrar desde el reposo la luz empieza en el puntero sin girar de golpe", () => {
  const objetivo = objetivoDesdePuntero(120, 220, caja);
  const inicio = estadoAlEntrar(REPOSO, objetivo);
  assert.equal(inicio.x, objetivo.x);
  assert.equal(inicio.y, objetivo.y);
  assert.equal(inicio.rx, 0);
  assert.equal(inicio.intensidad, 0);

  const enMarcha = { ...objetivo, intensidad: 0.5 };
  assert.equal(estadoAlEntrar(enMarcha, REPOSO), enMarcha);
});

test("las variables CSS llevan porcentajes, grados y desplazamientos de -1 a 1", () => {
  const variables = variablesCss(objetivoDesdePuntero(300, 350, caja));
  assert.equal(variables["--holo-x"], "100.00%");
  assert.equal(variables["--holo-y"], "50.00%");
  assert.equal(variables["--holo-dx"], "1.0000");
  assert.equal(variables["--holo-dy"], "0.0000");
  assert.equal(variables["--holo-rx"], "0.00deg");
  assert.equal(variables["--holo-ry"], `${(-GIRO_MAXIMO).toFixed(2)}deg`);
  assert.equal(variables["--holo-intensidad"], "1.000");
});
