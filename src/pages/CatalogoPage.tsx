import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router";
import {
  buscarPokemon,
  listarPokemon,
  PokemonNoEncontradoError,
} from "../api/pokeapi.ts";
import TarjetaPokemon from "../components/TarjetaPokemon.tsx";
import {
  estadoCatalogoInicial,
  puedeCargarMas,
  reducirCatalogo,
} from "./catalogoEstado.ts";

export default function CatalogoPage() {
  const navigate = useNavigate();
  const [estado, dispatch] = useReducer(
    reducirCatalogo,
    estadoCatalogoInicial,
  );
  const [consulta, setConsulta] = useState("");
  const [estadoBusqueda, setEstadoBusqueda] = useState<
    "idle" | "loading" | "not-found" | "error"
  >("idle");
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const primeraCargaIniciada = useRef(false);
  const solicitudEnCurso = useRef(false);
  const busquedaEnCurso = useRef(false);

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

  function cargarMas() {
    if (!puedeCargarMas(estado)) {
      return;
    }
    void cargarPagina("siguiente", estado.offset);
  }

  async function enviarBusqueda(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busquedaEnCurso.current || !consulta.trim()) {
      return;
    }

    busquedaEnCurso.current = true;
    setEstadoBusqueda("loading");
    setErrorBusqueda("");

    try {
      const pokemon = await buscarPokemon(consulta);
      navigate(`/pokemon/${pokemon.id}`);
    } catch (error) {
      if (error instanceof PokemonNoEncontradoError) {
        setEstadoBusqueda("not-found");
      } else {
        setEstadoBusqueda("error");
        setErrorBusqueda(
          error instanceof Error ? error.message : String(error),
        );
      }
    } finally {
      busquedaEnCurso.current = false;
    }
  }

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
              }}
              placeholder="Por ejemplo, pikachu"
              disabled={estadoBusqueda === "loading"}
              className="min-h-12 w-full rounded-xl border border-linea bg-superficie px-4 text-base text-tinta shadow-[inset_0_1px_2px_rgba(37,51,45,0.06)] placeholder:text-tinta-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca disabled:cursor-wait disabled:opacity-70"
            />
          </div>
          <button
            type="submit"
            disabled={estadoBusqueda === "loading"}
            className="min-h-12 rounded-xl bg-linear-to-b from-marca to-marca-fuerte px-6 py-3 font-semibold text-superficie shadow-[0_8px_18px_-12px_rgba(36,83,64,0.7),inset_0_1px_0_rgba(255,253,248,0.25)] transition-colors hover:from-marca-fuerte hover:to-marca focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-marca disabled:cursor-wait disabled:opacity-75 motion-reduce:transition-none"
          >
            {estadoBusqueda === "loading" ? "Buscando…" : "Buscar"}
          </button>
        </form>

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
      </div>

      {estado.cargandoInicial && (
        <p role="status" aria-live="polite" className="py-8 text-center text-tinta-suave">
          Cargando…
        </p>
      )}

      {estado.error && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-linea bg-linear-to-b from-superficie to-superficie-sombra px-4 py-3 font-medium text-tinta"
        >
          No se ha podido cargar el catálogo.
        </p>
      )}

      {estado.items.length > 0 && (
        <ul
          aria-label="Pokémon del catálogo"
          aria-busy={estado.cargandoMas}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        >
          {estado.items.map((pokemon) => (
            <li key={pokemon.id}>
              <TarjetaPokemon pokemon={pokemon} />
            </li>
          ))}
        </ul>
      )}

      {estado.siguiente !== null && !estado.cargandoInicial && (
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
