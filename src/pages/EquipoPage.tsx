import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  obtenerFicha,
  obtenerTipo,
  type PokemonFicha,
} from "../api/pokeapi.ts";
import { calcularCobertura, type Cobertura } from "../domain/cobertura.ts";
import InsigniaTipo from "../components/InsigniaTipo.tsx";
import { TIPOS } from "../api/tipos.ts";
import {
  CLAVE_EQUIPO,
  leerEquipo,
  quitarDelEquipo,
} from "../storage/equipo.ts";

function mensajeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function ListaCobertura({
  titulo,
  tipos,
  enlacesAmenaza = false,
}: {
  titulo: string;
  tipos: Cobertura["golpeaConVentaja"];
  enlacesAmenaza?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-linea bg-linear-to-br from-superficie via-superficie to-superficie-sombra p-5 shadow-[0_10px_24px_-18px_rgba(37,51,45,0.28),inset_0_1px_0_rgba(255,253,248,0.9)] sm:p-6">
      <h2 className="text-lg font-semibold text-tinta">{titulo}</h2>
      <ul aria-label={titulo} className="mt-4 flex flex-wrap gap-2">
        {tipos.map((tipo) => (
          <li key={tipo}>
            {enlacesAmenaza ? (
              <Link
                to={`/?amenaza=${tipo}`}
                aria-label={`Filtrar catálogo por amenaza ${TIPOS[tipo].etiqueta}`}
                className="inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
              >
                <InsigniaTipo tipo={tipo} />
              </Link>
            ) : (
              <InsigniaTipo tipo={tipo} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function TarjetaEquipo({
  pokemon,
  alQuitar,
}: {
  pokemon: PokemonFicha;
  alQuitar: (id: number) => void;
}) {
  return (
    <li className="flex min-w-0 items-center gap-4 rounded-2xl border border-linea bg-linear-to-b from-superficie via-superficie to-superficie-sombra p-3 shadow-[0_10px_24px_-18px_rgba(37,51,45,0.32),inset_0_1px_0_rgba(255,253,248,0.9)]">
      <div className="flex size-24 shrink-0 items-center justify-center rounded-xl border border-linea/70 bg-linear-to-br from-superficie-suave via-superficie to-superficie-sombra">
        <img
          src={pokemon.sprite}
          alt={pokemon.nombre}
          loading="lazy"
          className="size-20 object-contain drop-shadow-[0_12px_10px_rgba(37,51,45,0.12)]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-semibold text-tinta">
          {pokemon.nombre}
        </h2>
        <p className="font-mono text-sm text-tinta-suave">
          #{String(pokemon.id).padStart(3, "0")}
        </p>
      </div>
      <button
        type="button"
        onClick={() => alQuitar(pokemon.id)}
        className="min-h-11 shrink-0 rounded-xl border border-linea bg-linear-to-b from-superficie to-superficie-sombra px-4 font-semibold text-marca-fuerte transition-colors hover:bg-superficie-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca motion-reduce:transition-none"
      >
        Quitar
      </button>
    </li>
  );
}

export default function EquipoPage() {
  const [equipo, setEquipo] = useState<number[] | null>(null);
  const [pokemones, setPokemones] = useState<PokemonFicha[]>([]);
  const [cobertura, setCobertura] = useState<Cobertura | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorAlmacen, setErrorAlmacen] = useState("");
  const [errorApi, setErrorApi] = useState("");

  useEffect(() => {
    function sincronizarEquipo() {
      try {
        setEquipo(leerEquipo());
        setErrorAlmacen("");
      } catch (error) {
        setErrorAlmacen(
          `No se pudo leer el equipo guardado: ${mensajeError(error)}`,
        );
      }
    }

    function alCambiarAlmacenamiento(evento: StorageEvent) {
      if (evento.key === null || evento.key === CLAVE_EQUIPO) {
        sincronizarEquipo();
      }
    }

    sincronizarEquipo();
    window.addEventListener("storage", alCambiarAlmacenamiento);
    return () => window.removeEventListener("storage", alCambiarAlmacenamiento);
  }, []);

  useEffect(() => {
    if (equipo === null) {
      return;
    }
    if (equipo.length === 0) {
      setPokemones([]);
      setCobertura(null);
      setCargando(false);
      setErrorApi("");
      return;
    }

    let vigente = true;
    setPokemones([]);
    setCobertura(null);
    setCargando(true);
    setErrorApi("");

    void (async () => {
      const fichas = await Promise.all(equipo.map((id) => obtenerFicha(id)));
      if (!vigente) {
        return;
      }
      setPokemones(fichas);

      const tiposEquipo = [...new Set(fichas.flatMap(({ tipos }) => tipos))];
      const relaciones = await Promise.all(tiposEquipo.map(obtenerTipo));
      if (!vigente) {
        return;
      }
      setCobertura(
        calcularCobertura(
          relaciones.map(({ damage_relations }) => ({
            double_damage_to: damage_relations.double_damage_to.map(
              ({ name }) => name,
            ),
            double_damage_from: damage_relations.double_damage_from.map(
              ({ name }) => name,
            ),
          })),
        ),
      );
    })()
      .catch((error: unknown) => {
        if (vigente) {
          setErrorApi(
            `No se ha podido cargar el equipo o su cobertura: ${mensajeError(error)}`,
          );
        }
      })
      .finally(() => {
        if (vigente) {
          setCargando(false);
        }
      });

    return () => {
      vigente = false;
    };
  }, [equipo]);

  function quitar(id: number) {
    try {
      const resultado = quitarDelEquipo(id);
      setEquipo(resultado.equipo);
      setErrorAlmacen("");
    } catch (error) {
      setErrorAlmacen(
        `No se pudo actualizar el equipo guardado: ${mensajeError(error)}`,
      );
    }
  }

  return (
    <section aria-labelledby="equipo-titulo">
      <header className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-marca">
          Apartado extra
        </p>
        <h1
          id="equipo-titulo"
          className="mt-2 text-3xl font-semibold tracking-tight text-tinta sm:text-4xl"
        >
          Equipo Pokémon
        </h1>
      </header>

      {errorAlmacen && (
        <p role="alert" className="mb-5 font-medium text-tinta">
          {errorAlmacen}
        </p>
      )}
      {equipo === null && !errorAlmacen && (
        <p role="status" aria-live="polite" className="text-tinta-suave">
          Cargando equipo…
        </p>
      )}
      {equipo?.length === 0 && !errorAlmacen && (
        <p className="rounded-2xl border border-linea bg-linear-to-br from-superficie via-superficie to-superficie-sombra px-5 py-6 text-tinta shadow-[0_10px_24px_-18px_rgba(37,51,45,0.28),inset_0_1px_0_rgba(255,253,248,0.9)]">
          Tu equipo está vacío. Desde la ficha de un Pokémon puedes añadirlo.
        </p>
      )}
      {equipo !== null && equipo.length > 0 && (
        <>
          {cargando && (
            <p role="status" aria-live="polite" className="mb-5 text-tinta-suave">
              Cargando equipo y cobertura…
            </p>
          )}
          {errorApi && (
            <p role="alert" className="mb-5 font-medium text-tinta">
              {errorApi}
            </p>
          )}
          {pokemones.length > 0 && (
            <ul
              aria-label="Pokémon del equipo"
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {pokemones.map((pokemon) => (
                <TarjetaEquipo
                  key={pokemon.id}
                  pokemon={pokemon}
                  alQuitar={quitar}
                />
              ))}
            </ul>
          )}
          {cobertura && (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <ListaCobertura
                titulo="Golpea con ventaja"
                tipos={cobertura.golpeaConVentaja}
              />
              <ListaCobertura
                titulo="Recibe daño doble"
                tipos={cobertura.recibeDanioDoble}
                enlacesAmenaza
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
