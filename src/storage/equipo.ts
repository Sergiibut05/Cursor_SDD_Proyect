export const CLAVE_EQUIPO = "visor-equipo";
export const MAXIMO_EQUIPO = 6;

type AlmacenEquipo = Pick<Storage, "getItem" | "setItem">;

export type ResultadoEquipo = {
  equipo: number[];
  resultado: "añadido" | "duplicado" | "limite" | "quitado" | "sin-cambios";
};

function almacenamientoPredeterminado(): AlmacenEquipo {
  return window.localStorage;
}

function esIdValido(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0;
}

export function leerEquipo(
  almacenamiento: AlmacenEquipo = almacenamientoPredeterminado(),
): number[] {
  const valor = almacenamiento.getItem(CLAVE_EQUIPO);
  if (valor === null) {
    return [];
  }

  let contenido: unknown;
  try {
    contenido = JSON.parse(valor);
  } catch {
    return [];
  }

  if (
    !Array.isArray(contenido) ||
    !contenido.every(
      (id): id is number => typeof id === "number" && esIdValido(id),
    )
  ) {
    return [];
  }

  return [...new Set(contenido)].slice(0, MAXIMO_EQUIPO);
}

export function añadirAlEquipo(
  id: number,
  almacenamiento: AlmacenEquipo = almacenamientoPredeterminado(),
): ResultadoEquipo {
  if (!esIdValido(id)) {
    throw new Error("El identificador del Pokémon no es válido.");
  }

  const equipo = leerEquipo(almacenamiento);
  if (equipo.includes(id)) {
    return { equipo, resultado: "duplicado" };
  }
  if (equipo.length >= MAXIMO_EQUIPO) {
    return { equipo, resultado: "limite" };
  }

  const actualizado = [...equipo, id];
  almacenamiento.setItem(CLAVE_EQUIPO, JSON.stringify(actualizado));
  return { equipo: actualizado, resultado: "añadido" };
}

export function quitarDelEquipo(
  id: number,
  almacenamiento: AlmacenEquipo = almacenamientoPredeterminado(),
): ResultadoEquipo {
  const equipo = leerEquipo(almacenamiento);
  if (!equipo.includes(id)) {
    return { equipo, resultado: "sin-cambios" };
  }

  const actualizado = equipo.filter((pokemonId) => pokemonId !== id);
  almacenamiento.setItem(CLAVE_EQUIPO, JSON.stringify(actualizado));
  return { equipo: actualizado, resultado: "quitado" };
}
