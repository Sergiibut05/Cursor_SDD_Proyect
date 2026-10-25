import { PokeApiHttpError, type PokemonFicha } from "../api/pokeapi.ts";

export type EstadoFicha =
  | { tipo: "cargando" }
  | { tipo: "cargada"; ficha: PokemonFicha }
  | { tipo: "error"; mensaje: string };

export type AccionFicha =
  | { tipo: "iniciar" }
  | { tipo: "resultado"; ficha: PokemonFicha }
  | { tipo: "fallo"; mensaje: string };

export const estadoFichaInicial: EstadoFicha = { tipo: "cargando" };
export const mensajeIdInvalido =
  "La dirección no contiene un identificador de Pokémon válido.";

export function idDesdeRuta(valor: string | undefined): number | null {
  if (valor === undefined || !/^\d+$/.test(valor)) {
    return null;
  }

  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function formatearMedida(
  valor: number,
  unidad: "m" | "kg",
): string {
  const numero = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(valor);
  return `${numero} ${unidad}`;
}

export function mensajeErrorFicha(error: unknown): string {
  if (error instanceof PokeApiHttpError && error.status === 404) {
    return "No hay un Pokémon con ese número.";
  }
  return "No se ha podido cargar la ficha. Comprueba la conexión e inténtalo de nuevo.";
}

export function reducirEstadoFicha(
  _estado: EstadoFicha,
  accion: AccionFicha,
): EstadoFicha {
  if (accion.tipo === "iniciar") {
    return { tipo: "cargando" };
  }
  if (accion.tipo === "resultado") {
    return { tipo: "cargada", ficha: accion.ficha };
  }
  return { tipo: "error", mensaje: accion.mensaje };
}
