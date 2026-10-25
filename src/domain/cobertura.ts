import { TIPOS, type TipoId } from "../api/tipos.ts";

export type RelacionesDanio = {
  double_damage_to: readonly string[];
  double_damage_from: readonly string[];
};

export type Cobertura = {
  golpeaConVentaja: TipoId[];
  recibeDanioDoble: TipoId[];
};

function esTipoId(tipo: string): tipo is TipoId {
  return Object.hasOwn(TIPOS, tipo);
}

function unionOrdenada(
  listas: readonly (readonly string[])[],
): TipoId[] {
  const tipos = new Set<TipoId>();
  for (const lista of listas) {
    for (const tipo of lista) {
      if (esTipoId(tipo)) {
        tipos.add(tipo);
      }
    }
  }

  return [...tipos].sort((a, b) =>
    TIPOS[a].etiqueta.localeCompare(TIPOS[b].etiqueta, "es"),
  );
}

export function calcularCobertura(
  relaciones: readonly RelacionesDanio[],
): Cobertura {
  return {
    golpeaConVentaja: unionOrdenada(
      relaciones.map(({ double_damage_to }) => double_damage_to),
    ),
    recibeDanioDoble: unionOrdenada(
      relaciones.map(({ double_damage_from }) => double_damage_from),
    ),
  };
}
