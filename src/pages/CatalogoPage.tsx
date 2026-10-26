import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  buscarPokemon,
  coincidePorPrefijo,
  listarPokemonPorAmenaza,
  listarPokemon,
  normalizarBusqueda,
  normalizarCoincidencia,
  obtenerIndiceNombres,
  obtenerResumenes,
  PokemonNoEncontradoError,
  type PokemonIndice,
} from "../api/pokeapi.ts";
import { TIPOS, type TipoId } from "../api/tipos.ts";
import TarjetaPokemon from "../components/TarjetaPokemon.tsx";
import {
  estadoCatalogoInicial,
  puedeCargarMas,
  reducirCatalogo,
} from "./catalogoEstado.ts";

export default function CatalogoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const amenazaSolicitada = searchParams.get("amenaza");
  const amenaza =
    amenazaSolicitada && Object.hasOwn(TIPOS, amenazaSolicitada)
      ? (amenazaSolicitada as TipoId)
      : null;
  const [estado, dispatch] = useReducer(
    reducirCatalogo,
    estadoCatalogoInicial,
  );
  const [consulta, setConsulta] = useState("");
  const [indice, setIndice] = useState<PokemonIndice[] | null>(null);
  const [cargandoIndice, setCargandoIndice] = useState(false);
  const [errorIndice, setErrorIndice] = useState("");
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const [resultadosBusqueda, setResultadosBusqueda] = useState<
    Awaited<ReturnType<typeof obtenerResumenes>> | null
  >(null);
  const [pokemonesAmenaza, setPokemonesAmenaza] = useState<
    Awaited<ReturnType<typeof listarPokemonPorAmenaza>> | null
  >(null);
  const [cargandoAmenaza, setCargandoAmenaza] = useState(false);
  const [errorAmenaza, setErrorAmenaza] = useState("");
  const [estadoBusqueda, setEstadoBusqueda] = useState<
    "idle" | "loading" | "not-found" | "error"
  >("idle");
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const primeraCargaIniciada = useRef(false);
  const solicitudEnCurso = useRef(false);
  const busquedaEnCurso = useRef(false);
  const indiceSolicitado = useRef(false);
  const consultaNormalizada = normalizarCoincidencia(consulta);
  const sugerencias =
    !amenaza && consultaNormalizada && indice
      ? indice
          .filter((pokemon) =>
            coincidePorPrefijo(pokemon.nombre, consultaNormalizada),
          )
          .slice(0, 5)
      : [];

  const cargarPagina = useCallback(
    async (pagina: "inicial" | "siguiente", offset: number) => {
      if (solicitudEnCurso.current) {
        return;
      }

      solicitudEnCurso.current = true;
      dispatch({ tipo: "cargando", pagina });

      try {
        const respuesta = await listarPokemon(offset);
        dispatch({
          tipo: "pagina-cargada",
          pagina,
          items: respuesta.items,
          siguiente: respuesta.siguiente,
        });
      } catch {
        dispatch({ tipo: "error" });
      } finally {
        solicitudEnCurso.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    if (primeraCargaIniciada.current) {
      return;
    }
    primeraCargaIniciada.current = true;
    void cargarPagina("inicial", 0);
  }, [cargarPagina]);

  useEffect(() => {
    if (amenaza || !consulta.trim() || indiceSolicitado.current) {
      return;
    }

    indiceSolicitado.current = true;
    setCargandoIndice(true);
    setErrorIndice("");
    void obtenerIndiceNombres()
      .then((nombres) => {
        setIndice(nombres);
      })
      .catch((error: unknown) => {
        setErrorIndice(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        setCargandoIndice(false);
      });
  }, [amenaza, consulta]);

  useEffect(() => {
    if (!amenaza) {
      setPokemonesAmenaza(null);
      setCargandoAmenaza(false);
      setErrorAmenaza("");
      return;
    }

    let vigente = true;
    setConsulta("");
    setResultadosBusqueda(null);
    setEstadoBusqueda("idle");
    setErrorBusqueda("");
    setPokemonesAmenaza(null);
    setCargandoAmenaza(true);
    setErrorAmenaza("");

    void listarPokemonPorAmenaza(amenaza)
      .then((pokemones) => {
        if (vigente) {
          setPokemonesAmenaza(pokemones);
        }
      })
      .catch((error: unknown) => {
        if (vigente) {
          setErrorAmenaza(
            error instanceof Error ? error.message : String(error),
          );
        }
      })
      .finally(() => {
        if (vigente) {
          setCargandoAmenaza(false);
        }
      });

    return () => {
      vigente = false;
    };
  }, [amenaza]);

  function cargarMas() {
    if (!puedeCargarMas(estado)) {
      return;
    }
    void cargarPagina("siguiente", estado.offset);
  }

  async function enviarBusqueda(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amenaza || busquedaEnCurso.current || !consulta.trim()) {
      return;
    }

    busquedaEnCurso.current = true;
    setEstadoBusqueda("loading");
    setErrorBusqueda("");

    try {
      let nombres = indice;
      let apiSinCoincidencia = false;

      if (!nombres) {
        try {
          const pokemon = await buscarPokemon(consulta);
          navigate(`/pokemon/${pokemon.id}`);
          return;
        } catch (error) {
          if (!(error instanceof PokemonNoEncontradoError)) {
            throw error;
          }
          apiSinCoincidencia = true;
        }
        nombres = await obtenerIndiceNombres();
        setIndice(nombres);
      }

      const consultaVisible = normalizarCoincidencia(consulta);
      const consultaSlug = normalizarBusqueda(consulta);
      const exacto = nombres.find(
        (pokemon) =>
          normalizarCoincidencia(pokemon.nombre) === consultaVisible ||
          pokemon.nombreApi.toLocaleLowerCase("es") === consultaSlug,
      );

      if (exacto) {
        navigate(`/pokemon/${exacto.id}`);
        return;
      }

      if (!apiSinCoincidencia) {
        try {
          const pokemon = await buscarPokemon(consulta);
          navigate(`/pokemon/${pokemon.id}`);
          return;
        } catch (error) {
          if (!(error instanceof PokemonNoEncontradoError)) {
            throw error;
          }
        }
      }

      const coincidencias = nombres.filter((pokemon) =>
        coincidePorPrefijo(pokemon.nombre, consulta),
      );
      if (coincidencias.length === 0) {
        setResultadosBusqueda(null);
        setEstadoBusqueda("not-found");
        return;
      }

      const resultados = await obtenerResumenes(
        coincidencias.map(({ id }) => id),
      );
      setResultadosBusqueda(resultados);
      setEstadoBusqueda("idle");
    } catch (error) {
      setEstadoBusqueda("error");
      setErrorBusqueda(error instanceof Error ? error.message : String(error));
    } finally {
      busquedaEnCurso.current = false;
    }
  }

  function seleccionarSugerencia(id: number) {
    navigate(`/pokemon/${id}`);
  }

  function gestionarTeclasBusqueda(event: KeyboardEvent<HTMLInputElement>) {
    if (!sugerencias.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndiceActivo((activo) => (activo + 1) % sugerencias.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndiceActivo(
        (activo) => (activo <= 0 ? sugerencias.length : activo) - 1,
      );
    } else if (event.key === "Enter" && indiceActivo >= 0) {
      event.preventDefault();
      seleccionarSugerencia(sugerencias[indiceActivo].id);
    } else if (event.key === "Escape") {
      setIndiceActivo(-1);
    }
  }

  const itemsVisibles = amenaza
    ? (pokemonesAmenaza ?? estado.items)
    : (resultadosBusqueda ?? estado.items);

  return (
    <section aria-labelledby="catalogo-titulo">
      <header className="mb-7 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-marca">
          Guía ilustrada
        </p>
        <h1
          id="catalogo-titulo"
          className="mt-2 text-3xl font-semibold tracking-tight text-tinta sm:text-4xl"
        >
          Catálogo Pokémon
        </h1>
        <p className="mt-2 text-base leading-relaxed text-tinta-suave">
          Explora la Pokédex, una página a la vez.
        </p>
      </header>

      <div className="mb-8 rounded-2xl border border-linea bg-linear-to-br from-superficie via-superficie to-superficie-sombra p-4 shadow-[0_10px_24px_-18px_rgba(37,51,45,0.3),inset_0_1px_0_rgba(255,253,248,0.9)] sm:p-5">
        <form
          onSubmit={enviarBusqueda}
          role="search"
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <label
              htmlFor="busqueda-pokemon"
              className="mb-2 block text-sm font-semibold text-tinta"
            >
              Busca un Pokémon por su nombre
            </label>
            <input
              id="busqueda-pokemon"
              type="search"
              required
              value={consulta}
              onChange={(event) => {
                setConsulta(event.target.value);
                setEstadoBusqueda("idle");
                setErrorBusqueda("");
                setResultadosBusqueda(null);
                setIndiceActivo(-1);
              }}
              onKeyDown={gestionarTeclasBusqueda}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={sugerencias.length > 0}
              aria-controls="sugerencias-pokemon"
              aria-activedescendant={
                indiceActivo >= 0
                  ? `sugerencia-pokemon-${sugerencias[indiceActivo]?.id}`
                  : undefined
              }
              placeholder="Por ejemplo, pikachu"
              disabled={Boolean(amenaza) || estadoBusqueda === "loading"}
              className="min-h-12 w-full rounded-xl border border-linea bg-superficie px-4 text-base text-tinta shadow-[inset_0_1px_2px_rgba(37,51,45,0.06)] placeholder:text-tinta-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca disabled:cursor-wait disabled:opacity-70"
            />
          </div>
          <button
            type="submit"
            disabled={Boolean(amenaza) || estadoBusqueda === "loading"}
            className="min-h-12 rounded-xl bg-linear-to-b from-marca to-marca-fuerte px-6 py-3 font-semibold text-superficie shadow-[0_8px_18px_-12px_rgba(36,83,64,0.7),inset_0_1px_0_rgba(255,253,248,0.25)] transition-colors hover:from-marca-fuerte hover:to-marca focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-marca disabled:cursor-wait disabled:opacity-75 motion-reduce:transition-none"
          >
            {estadoBusqueda === "loading" ? "Buscando…" : "Buscar"}
          </button>
        </form>

        {amenaza && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-tinta-suave">
              Filtrado por amenaza: <span className="font-semibold text-tinta">{TIPOS[amenaza].etiqueta}</span>
            </p>
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="min-h-10 rounded-xl border border-linea bg-linear-to-b from-superficie to-superficie-sombra px-4 font-semibold text-marca-fuerte focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
            >
              Quitar filtro
            </button>
          </div>
        )}

        {!amenaza && consulta.trim() && cargandoIndice && (
          <p role="status" aria-live="polite" className="mt-3 text-sm text-tinta-suave">
            Cargando sugerencias…
          </p>
        )}
        {!amenaza && errorIndice && (
          <p role="alert" className="mt-3 text-sm font-medium text-tinta">
            No se pudieron cargar las sugerencias: {errorIndice}
          </p>
        )}
        {!amenaza && sugerencias.length > 0 && (
          <ul
            id="sugerencias-pokemon"
            role="listbox"
            aria-label="Sugerencias de Pokémon"
            className="mt-3 grid gap-1 rounded-xl border border-linea bg-linear-to-b from-superficie to-superficie-sombra p-2"
          >
            {sugerencias.map((pokemon, indiceSugerencia) => (
              <li
                id={`sugerencia-pokemon-${pokemon.id}`}
                key={pokemon.id}
                role="option"
                aria-selected={indiceActivo === indiceSugerencia}
                onClick={() => seleccionarSugerencia(pokemon.id)}
                className={`flex min-h-11 cursor-pointer items-center rounded-lg px-3 font-medium text-tinta ${
                    indiceActivo === indiceSugerencia
                      ? "bg-marca-suave"
                      : "hover:bg-superficie-suave"
                  }`}
              >
                <span className="font-mono text-sm text-tinta-suave">
                  #{String(pokemon.id).padStart(3, "0")}
                </span>
                <span className="ml-3">{pokemon.nombre}</span>
              </li>
            ))}
          </ul>
        )}

        {estadoBusqueda === "not-found" && (
          <p role="alert" className="mt-3 font-medium text-tinta">
            No hay un Pokémon con ese nombre.
          </p>
        )}
        {estadoBusqueda === "error" && (
          <p role="alert" className="mt-3 font-medium text-tinta">
            No se pudo realizar la búsqueda: {errorBusqueda}
          </p>
        )}
        {resultadosBusqueda && (
          <p className="mt-3 text-sm text-tinta-suave">
            {resultadosBusqueda.length} coincidencias por prefijo.
          </p>
        )}
      </div>

      {amenaza && cargandoAmenaza && (
        <p role="status" aria-live="polite" className="py-8 text-center text-tinta-suave">
          Cargando Pokémon con ventaja sobre {TIPOS[amenaza].etiqueta}…
        </p>
      )}

      {amenaza && errorAmenaza && (
        <p role="alert" className="mb-5 rounded-xl border border-linea bg-linear-to-b from-superficie to-superficie-sombra px-4 py-3 font-medium text-tinta">
          No se ha podido cargar el filtro de amenaza: {errorAmenaza}
        </p>
      )}

      {!amenaza && estado.cargandoInicial && (
        <p role="status" aria-live="polite" className="py-8 text-center text-tinta-suave">
          Cargando…
        </p>
      )}

      {!amenaza && estado.error && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-linea bg-linear-to-b from-superficie to-superficie-sombra px-4 py-3 font-medium text-tinta"
        >
          No se ha podido cargar el catálogo.
        </p>
      )}

      {itemsVisibles.length > 0 && (
        <ul
          aria-label="Pokémon del catálogo"
          aria-busy={amenaza ? cargandoAmenaza : estado.cargandoMas}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        >
          {itemsVisibles.map((pokemon) => (
            <li key={pokemon.id}>
              <TarjetaPokemon pokemon={pokemon} />
            </li>
          ))}
        </ul>
      )}

      {amenaza && !cargandoAmenaza && pokemonesAmenaza?.length === 0 && (
        <p className="rounded-xl border border-linea bg-linear-to-b from-superficie to-superficie-sombra px-4 py-3 text-tinta">
          No hay Pokémon con ventaja sobre {TIPOS[amenaza].etiqueta}.
        </p>
      )}

      {!amenaza &&
        resultadosBusqueda === null &&
        estado.siguiente !== null &&
        !estado.cargandoInicial && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={cargarMas}
            disabled={estado.cargandoMas}
            className="min-h-12 min-w-44 rounded-xl bg-linear-to-b from-marca to-marca-fuerte px-6 py-3 font-semibold text-superficie shadow-[0_8px_18px_-12px_rgba(36,83,64,0.7),inset_0_1px_0_rgba(255,253,248,0.25)] transition-colors hover:from-marca-fuerte hover:to-marca focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-marca disabled:cursor-wait disabled:opacity-75 motion-reduce:transition-none"
          >
            {estado.cargandoMas ? "Cargando…" : "Cargar más"}
          </button>
        </div>
      )}
    </section>
  );
}
