import type { PokemonResumen } from "../api/pokeapi.ts";

export type EstadoCatalogo = {
  items: PokemonResumen[];
  offset: number;
  siguiente: string | null;
  cargandoInicial: boolean;
  cargandoMas: boolean;
  error: boolean;
};

export type AccionCatalogo =
  | { tipo: "cargando"; pagina: "inicial" | "siguiente" }
  | {
      tipo: "pagina-cargada";
      pagina: "inicial" | "siguiente";
      items: PokemonResumen[];
      siguiente: string | null;
    }
  | { tipo: "error" };

export const estadoCatalogoInicial: EstadoCatalogo = {
  items: [],
  offset: 0,
  siguiente: null,
  cargandoInicial: true,
  cargandoMas: false,
  error: false,
};

export function puedeCargarMas(estado: EstadoCatalogo): boolean {
  return (
    estado.siguiente !== null &&
    !estado.cargandoInicial &&
    !estado.cargandoMas
  );
}

export function reducirCatalogo(
  estado: EstadoCatalogo,
  accion: AccionCatalogo,
): EstadoCatalogo {
  if (accion.tipo === "cargando") {
    return {
      ...estado,
      cargandoInicial: accion.pagina === "inicial",
      cargandoMas: accion.pagina === "siguiente",
      error: false,
    };
  }

  if (accion.tipo === "pagina-cargada") {
    const items =
      accion.pagina === "inicial"
        ? accion.items
        : [...estado.items, ...accion.items];

    return {
      items,
      offset: estado.offset + accion.items.length,
      siguiente: accion.siguiente,
      cargandoInicial: false,
      cargandoMas: false,
      error: false,
    };
  }

  return {
    ...estado,
    cargandoInicial: false,
    cargandoMas: false,
    error: true,
  };
}
