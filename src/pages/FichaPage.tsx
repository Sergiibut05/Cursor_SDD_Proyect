import { useEffect, useReducer, useState } from "react";
import { Link, useParams } from "react-router";
import {
  obtenerFicha,
  type PokemonFicha,
} from "../api/pokeapi.ts";
import InsigniaTipo from "../components/InsigniaTipo.tsx";
import {
  añadirAlEquipo,
  CLAVE_EQUIPO,
  leerEquipo,
  quitarDelEquipo,
} from "../storage/equipo.ts";
import {
  estadoFichaInicial,
  formatearMedida,
  idDesdeRuta,
  mensajeErrorFicha,
  mensajeIdInvalido,
  reducirEstadoFicha,
} from "./fichaEstado.ts";

function EnlaceCatalogo() {
  return (
    <Link
      to="/"
      className="inline-flex min-h-11 items-center rounded-xl px-3 font-semibold text-marca-fuerte transition-colors hover:bg-superficie-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
    >
      <span aria-hidden="true" className="mr-2 text-lg">
        ←
      </span>
      Volver al catálogo
    </Link>
  );
}

function EncabezadoFicha({ ficha }: { ficha: PokemonFicha }) {
  return (
    <header className="mb-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-marca">
        Ficha Pokémon
      </p>
      <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
        <h1
          id="ficha-titulo"
          className="text-3xl font-semibold tracking-tight text-tinta sm:text-4xl"
        >
          {ficha.nombre}
        </h1>
        <p className="font-mono text-base font-medium tracking-wide text-tinta-suave">
          #{String(ficha.id).padStart(3, "0")}
        </p>
      </div>
    </header>
  );
}

function DatosFicha({
  ficha,
  enEquipo,
  equipoDisponible,
  alCambiarEquipo,
  mensajeEquipo,
  errorEquipo,
}: {
  ficha: PokemonFicha;
  enEquipo: boolean;
  equipoDisponible: boolean;
  alCambiarEquipo: () => void;
  mensajeEquipo: string;
  errorEquipo: string;
}) {
  return (
    <section
      aria-label="Características"
      className="rounded-2xl border border-linea bg-linear-to-br from-superficie via-superficie to-superficie-sombra p-5 shadow-[0_10px_24px_-18px_rgba(37,51,45,0.28),inset_0_1px_0_rgba(255,253,248,0.9)] sm:p-6"
    >
      <h2 className="text-lg font-semibold text-tinta">A simple vista</h2>
      <ul aria-label="Tipos" className="mt-3 flex flex-wrap gap-2">
        {ficha.tipos.map((tipo) => (
          <li key={tipo}>
            <InsigniaTipo tipo={tipo} />
          </li>
        ))}
      </ul>

      <dl className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-linea/80 bg-linear-to-b from-superficie-suave/70 to-superficie/80 px-4 py-3">
          <dt className="text-sm text-tinta-suave">Altura</dt>
          <dd className="mt-1 font-mono text-lg font-medium text-tinta">
            {formatearMedida(ficha.alturaM, "m")}
          </dd>
        </div>
        <div className="rounded-xl border border-linea/80 bg-linear-to-b from-superficie-suave/70 to-superficie/80 px-4 py-3">
          <dt className="text-sm text-tinta-suave">Peso</dt>
          <dd className="mt-1 font-mono text-lg font-medium text-tinta">
            {formatearMedida(ficha.pesoKg, "kg")}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <button
          type="button"
          onClick={alCambiarEquipo}
          disabled={!equipoDisponible}
          className="min-h-12 rounded-xl bg-linear-to-b from-marca to-marca-fuerte px-5 py-3 font-semibold text-superficie shadow-[0_8px_18px_-12px_rgba(36,83,64,0.7),inset_0_1px_0_rgba(255,253,248,0.25)] transition-colors hover:from-marca-fuerte hover:to-marca focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-marca disabled:cursor-wait disabled:opacity-75 motion-reduce:transition-none"
        >
          {equipoDisponible
            ? enEquipo
              ? "Quitar del equipo"
              : "Añadir al equipo"
            : "Cargando equipo…"}
        </button>
        {mensajeEquipo && (
          <p role="status" aria-live="polite" className="mt-3 text-sm text-tinta">
            {mensajeEquipo}
          </p>
        )}
        {errorEquipo && (
          <p role="alert" className="mt-3 text-sm font-medium text-tinta">
            {errorEquipo}
          </p>
        )}
      </div>
    </section>
  );
}

function Estadisticas({ ficha }: { ficha: PokemonFicha }) {
  return (
    <section
      aria-labelledby="estadisticas-titulo"
      className="mt-6 rounded-2xl border border-linea bg-linear-to-br from-superficie via-superficie to-superficie-sombra p-5 shadow-[0_10px_24px_-18px_rgba(37,51,45,0.28),inset_0_1px_0_rgba(255,253,248,0.9)] sm:p-6"
    >
      <h2 id="estadisticas-titulo" className="text-lg font-semibold text-tinta">
        Estadísticas base
      </h2>
      <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ficha.estadisticas.map((estadistica) => (
          <div
            key={estadistica.clave}
            className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-linea/80 bg-linear-to-b from-superficie-suave/60 to-superficie/80 px-4 py-2"
          >
            <dt className="text-sm font-medium text-tinta">
              {estadistica.nombre}
            </dt>
            <dd className="font-mono text-base font-medium tabular-nums text-tinta">
              {estadistica.valor}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function FichaPage() {
  const { id: idRuta } = useParams();
  const id = idDesdeRuta(idRuta);
  const [equipo, setEquipo] = useState<number[] | null>(null);
  const [mensajeEquipo, setMensajeEquipo] = useState("");
  const [errorEquipo, setErrorEquipo] = useState("");
  const [estado, dispatch] = useReducer(
    reducirEstadoFicha,
    estadoFichaInicial,
  );

  useEffect(() => {
    function sincronizarEquipo() {
      try {
        setEquipo(leerEquipo());
        setErrorEquipo("");
      } catch (error) {
        setErrorEquipo(
          `No se pudo leer el equipo guardado: ${error instanceof Error ? error.message : String(error)}`,
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
    let vigente = true;

    if (id === null) {
      dispatch({ tipo: "fallo", mensaje: mensajeIdInvalido });
      return () => {
        vigente = false;
      };
    }

    dispatch({ tipo: "iniciar" });
    void obtenerFicha(id)
      .then((ficha) => {
        if (vigente) {
          dispatch({ tipo: "resultado", ficha });
        }
      })
      .catch((error: unknown) => {
        if (vigente) {
          dispatch({ tipo: "fallo", mensaje: mensajeErrorFicha(error) });
        }
      });

    return () => {
      vigente = false;
    };
  }, [id]);

  function cambiarEquipo(ficha: PokemonFicha) {
    if (equipo === null) {
      return;
    }

    try {
      const resultado = equipo.includes(ficha.id)
        ? quitarDelEquipo(ficha.id)
        : añadirAlEquipo(ficha.id);
      setEquipo(resultado.equipo);
      setErrorEquipo("");

      if (resultado.resultado === "añadido") {
        setMensajeEquipo("Pokémon añadido al equipo.");
      } else if (resultado.resultado === "quitado") {
        setMensajeEquipo("Pokémon quitado del equipo.");
      } else if (resultado.resultado === "duplicado") {
        setMensajeEquipo("Ese Pokémon ya está en el equipo.");
      } else if (resultado.resultado === "limite") {
        setMensajeEquipo("El equipo admite seis Pokémon.");
      }
    } catch (error) {
      setErrorEquipo(
        `No se pudo actualizar el equipo guardado: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (estado.tipo === "cargando") {
    return (
      <section aria-labelledby="ficha-cargando-titulo">
        <EnlaceCatalogo />
        <h1
          id="ficha-cargando-titulo"
          className="mt-5 text-2xl font-semibold text-tinta"
        >
          Ficha Pokémon
        </h1>
        <p role="status" aria-live="polite" className="mt-3 text-tinta-suave">
          Cargando ficha…
        </p>
      </section>
    );
  }

  if (estado.tipo === "error") {
    return (
      <section aria-labelledby="ficha-error-titulo">
        <EnlaceCatalogo />
        <div className="mt-5 rounded-2xl border border-linea bg-linear-to-br from-superficie via-superficie to-superficie-sombra px-5 py-6 shadow-[0_10px_24px_-18px_rgba(37,51,45,0.28),inset_0_1px_0_rgba(255,253,248,0.9)]">
          <h1
            id="ficha-error-titulo"
            className="text-2xl font-semibold text-tinta"
          >
            Ficha no disponible
          </h1>
          <p role="alert" className="mt-2 text-tinta-suave">
            {estado.mensaje}
          </p>
        </div>
      </section>
    );
  }

  const { ficha } = estado;

  return (
    <section aria-labelledby="ficha-titulo">
      <EnlaceCatalogo />
      <div className="mt-5">
        <EncabezadoFicha ficha={ficha} />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-3xl border border-linea bg-linear-to-br from-superficie-suave via-superficie to-superficie-sombra p-6 shadow-[0_14px_30px_-20px_rgba(37,51,45,0.36),inset_0_1px_0_rgba(255,253,248,0.94)] sm:min-h-96">
            <div
              aria-hidden="true"
              className="absolute size-64 rounded-full bg-marca-suave/70 blur-3xl sm:size-80"
            />
            <img
              src={ficha.sprite}
              alt={ficha.nombre}
              className="relative z-10 max-h-80 w-full object-contain drop-shadow-[0_18px_16px_rgba(37,51,45,0.16)] sm:max-h-96"
            />
          </div>

          <DatosFicha
            ficha={ficha}
            enEquipo={equipo?.includes(ficha.id) ?? false}
            equipoDisponible={equipo !== null}
            alCambiarEquipo={() => cambiarEquipo(ficha)}
            mensajeEquipo={mensajeEquipo}
            errorEquipo={errorEquipo}
          />
        </div>

        <Estadisticas ficha={ficha} />
      </div>
    </section>
  );
}
