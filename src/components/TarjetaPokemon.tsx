import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";
import { Link } from "react-router";
import type { PokemonResumen } from "../api/pokeapi.ts";
import InsigniaTipo from "./InsigniaTipo.tsx";
import {
  PROPIEDADES_HOLO,
  REPOSO,
  estadoAlEntrar,
  factorSuavizado,
  haConvergido,
  interpolar,
  objetivoDesdePuntero,
  reposoDesde,
  variablesCss,
  type EstadoHolo,
} from "./holo.ts";

type TarjetaPokemonProps = {
  pokemon: PokemonResumen;
};

const foco =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca";

const CONSULTA_HOLO =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function admiteHolo(): boolean {
  return window.matchMedia(CONSULTA_HOLO).matches;
}

type Animacion = {
  actual: EstadoHolo;
  objetivo: EstadoHolo;
  fotograma: number;
  ultimoTiempo: number;
};

export default function TarjetaPokemon({ pokemon }: TarjetaPokemonProps) {
  const enlaceRef = useRef<HTMLAnchorElement>(null);
  const animacionRef = useRef<Animacion>({
    actual: REPOSO,
    objetivo: REPOSO,
    fotograma: 0,
    ultimoTiempo: 0,
  });

  useEffect(() => {
    const animacion = animacionRef.current;
    return () => cancelAnimationFrame(animacion.fotograma);
  }, []);

  function pintar(estado: EstadoHolo) {
    const enlace = enlaceRef.current;
    if (!enlace) return;
    const variables = variablesCss(estado);
    for (const propiedad of PROPIEDADES_HOLO) {
      enlace.style.setProperty(propiedad, variables[propiedad]);
    }
  }

  function volverAlReposo() {
    const enlace = enlaceRef.current;
    if (!enlace) return;
    for (const propiedad of PROPIEDADES_HOLO) {
      enlace.style.removeProperty(propiedad);
    }
    delete enlace.dataset.holo;
  }

  function paso(tiempo: number) {
    const animacion = animacionRef.current;
    const dt = animacion.ultimoTiempo ? tiempo - animacion.ultimoTiempo : 1000 / 60;
    animacion.ultimoTiempo = tiempo;

    const siguiente = interpolar(animacion.actual, animacion.objetivo, factorSuavizado(dt));
    if (haConvergido(siguiente, animacion.objetivo)) {
      animacion.actual = animacion.objetivo;
      animacion.fotograma = 0;
      animacion.ultimoTiempo = 0;
      if (animacion.objetivo.intensidad === 0) {
        volverAlReposo();
      } else {
        pintar(animacion.objetivo);
      }
      return;
    }

    animacion.actual = siguiente;
    pintar(siguiente);
    animacion.fotograma = requestAnimationFrame(paso);
  }

  function arrancar() {
    const animacion = animacionRef.current;
    if (animacion.fotograma === 0) {
      animacion.ultimoTiempo = 0;
      animacion.fotograma = requestAnimationFrame(paso);
    }
  }

  function seguirPuntero(evento: PointerEvent<HTMLAnchorElement>) {
    const enlace = enlaceRef.current;
    if (!enlace || evento.pointerType === "touch" || !admiteHolo()) return;

    const animacion = animacionRef.current;
    const objetivo = objetivoDesdePuntero(
      evento.clientX,
      evento.clientY,
      enlace.getBoundingClientRect(),
    );
    animacion.actual = estadoAlEntrar(animacion.actual, objetivo);
    animacion.objetivo = objetivo;
    enlace.dataset.holo = "activa";
    arrancar();
  }

  function soltarPuntero() {
    const animacion = animacionRef.current;
    if (animacion.objetivo.intensidad === 0) return;
    animacion.objetivo = reposoDesde(animacion.objetivo);
    arrancar();
  }

  const tipoPrincipal = pokemon.tipos[0];
  const tipoSecundario = pokemon.tipos[1];
  const estiloTipo = tipoPrincipal
    ? ({
        "--holo-tipo": `var(--color-tipo-${tipoPrincipal})`,
        ...(tipoSecundario
          ? { "--holo-tipo-secundario": `var(--color-tipo-${tipoSecundario})` }
          : {}),
      } as CSSProperties)
    : undefined;

  return (
    <Link
      ref={enlaceRef}
      to={`/pokemon/${pokemon.id}`}
      style={estiloTipo}
      onPointerEnter={seguirPuntero}
      onPointerMove={seguirPuntero}
      onPointerLeave={soltarPuntero}
      className={["holo-tarjeta group block h-full rounded-2xl", foco].join(" ")}
    >
      <div className="holo-carta h-full rounded-2xl border border-linea bg-linear-to-b from-superficie via-superficie to-superficie-sombra p-3">
        <span aria-hidden="true" className="holo-destello" />

        <div className="holo-ventana relative z-[1] flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-linea/70 bg-linear-to-br from-superficie-suave via-superficie to-superficie-sombra">
          <div
            aria-hidden="true"
            className="holo-halo pointer-events-none absolute size-36 rounded-full bg-marca-suave/70 blur-2xl"
          />
          <span aria-hidden="true" className="holo-lamina" />
          <img
            src={pokemon.sprite}
            alt={pokemon.nombre}
            loading="lazy"
            className="holo-sprite relative z-10 size-36 object-contain"
          />
        </div>

        <div className="relative z-[1] px-1 pb-1 pt-4">
          <p className="font-mono text-sm font-medium tracking-wide text-tinta-suave">
            #{String(pokemon.id).padStart(3, "0")}
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold capitalize text-tinta group-hover:text-marca-fuerte">
            {pokemon.nombre}
          </h2>
          <ul
            aria-label={`Tipos de ${pokemon.nombre}`}
            className="mt-3 flex flex-wrap gap-2"
          >
            {pokemon.tipos.map((tipo) => (
              <li key={tipo}>
                <InsigniaTipo tipo={tipo} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Link>
  );
}
