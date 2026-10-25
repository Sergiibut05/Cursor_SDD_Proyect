import { Link } from "react-router";
import type { PokemonResumen } from "../api/pokeapi.ts";
import InsigniaTipo from "./InsigniaTipo.tsx";

type TarjetaPokemonProps = {
  pokemon: PokemonResumen;
};

const foco =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marca";

export default function TarjetaPokemon({ pokemon }: TarjetaPokemonProps) {
  return (
    <Link
      to={`/pokemon/${pokemon.id}`}
      className={[
        "group block h-full overflow-hidden rounded-2xl border border-linea bg-linear-to-b from-superficie via-superficie to-superficie-sombra p-3 shadow-[0_10px_24px_-18px_rgba(37,51,45,0.32),inset_0_1px_0_rgba(255,253,248,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(37,51,45,0.42),inset_0_1px_0_rgba(255,253,248,0.9)] motion-reduce:transform-none",
        foco,
      ].join(" ")}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-linea/70 bg-linear-to-br from-superficie-suave via-superficie to-superficie-sombra">
        <div
          aria-hidden="true"
          className="absolute size-36 rounded-full bg-marca-suave/70 blur-2xl transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none"
        />
        <img
          src={pokemon.sprite}
          alt={pokemon.nombre}
          loading="lazy"
          className="relative z-10 size-36 object-contain drop-shadow-[0_12px_10px_rgba(37,51,45,0.12)] transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"
        />
      </div>

      <div className="px-1 pb-1 pt-4">
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
    </Link>
  );
}
