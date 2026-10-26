export type EstadoHolo = {
  /** Posición horizontal del puntero dentro de la tarjeta, de 0 a 100. */
  x: number;
  /** Posición vertical del puntero dentro de la tarjeta, de 0 a 100. */
  y: number;
  /** Giro alrededor del eje X, en grados. */
  rx: number;
  /** Giro alrededor del eje Y, en grados. */
  ry: number;
  /** Fuerza del efecto, de 0 (reposo) a 1. */
  intensidad: number;
};

export type Caja = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const GIRO_MAXIMO = 12;

export const REPOSO: EstadoHolo = { x: 50, y: 50, rx: 0, ry: 0, intensidad: 0 };

const FOTOGRAMA_MS = 1000 / 60;

export function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, valor));
}

export function objetivoDesdePuntero(
  clienteX: number,
  clienteY: number,
  caja: Caja,
  giroMaximo = GIRO_MAXIMO,
): EstadoHolo {
  if (caja.width <= 0 || caja.height <= 0) {
    return { ...REPOSO };
  }

  const x = limitar(((clienteX - caja.left) / caja.width) * 100, 0, 100);
  const y = limitar(((clienteY - caja.top) / caja.height) * 100, 0, 100);
  const dx = (x - 50) / 50;
  const dy = (y - 50) / 50;

  // El lado bajo el puntero se acerca al espectador.
  return {
    x,
    y,
    rx: dy * giroMaximo,
    ry: -dx * giroMaximo,
    intensidad: 1,
  };
}

/** Reposo que conserva el último punto de luz para que el destello se apague en su sitio. */
export function reposoDesde(estado: EstadoHolo): EstadoHolo {
  return { ...REPOSO, x: estado.x, y: estado.y };
}

/** Al entrar desde el reposo, la luz aparece donde está el puntero en vez de viajar desde el centro. */
export function estadoAlEntrar(actual: EstadoHolo, objetivo: EstadoHolo): EstadoHolo {
  if (actual.intensidad > 0.01) {
    return actual;
  }
  return { ...actual, x: objetivo.x, y: objetivo.y };
}

/** Fracción de avance por paso, independiente de la frecuencia de refresco. */
export function factorSuavizado(dtMs: number, porFotograma = 0.14): number {
  const fotogramas = limitar(dtMs, 0, 100) / FOTOGRAMA_MS;
  return 1 - Math.pow(1 - porFotograma, fotogramas);
}

export function interpolar(
  actual: EstadoHolo,
  objetivo: EstadoHolo,
  factor: number,
): EstadoHolo {
  const t = limitar(factor, 0, 1);
  const mezcla = (a: number, b: number) => a + (b - a) * t;
  return {
    x: mezcla(actual.x, objetivo.x),
    y: mezcla(actual.y, objetivo.y),
    rx: mezcla(actual.rx, objetivo.rx),
    ry: mezcla(actual.ry, objetivo.ry),
    intensidad: mezcla(actual.intensidad, objetivo.intensidad),
  };
}

export function haConvergido(actual: EstadoHolo, objetivo: EstadoHolo): boolean {
  return (
    Math.abs(actual.x - objetivo.x) < 0.05 &&
    Math.abs(actual.y - objetivo.y) < 0.05 &&
    Math.abs(actual.rx - objetivo.rx) < 0.02 &&
    Math.abs(actual.ry - objetivo.ry) < 0.02 &&
    Math.abs(actual.intensidad - objetivo.intensidad) < 0.004
  );
}

export const PROPIEDADES_HOLO = [
  "--holo-x",
  "--holo-y",
  "--holo-dx",
  "--holo-dy",
  "--holo-rx",
  "--holo-ry",
  "--holo-intensidad",
] as const;

export function variablesCss(
  estado: EstadoHolo,
): Record<(typeof PROPIEDADES_HOLO)[number], string> {
  return {
    "--holo-x": `${estado.x.toFixed(2)}%`,
    "--holo-y": `${estado.y.toFixed(2)}%`,
    "--holo-dx": ((estado.x - 50) / 50).toFixed(4),
    "--holo-dy": ((estado.y - 50) / 50).toFixed(4),
    "--holo-rx": `${estado.rx.toFixed(2)}deg`,
    "--holo-ry": `${estado.ry.toFixed(2)}deg`,
    "--holo-intensidad": estado.intensidad.toFixed(3),
  };
}
