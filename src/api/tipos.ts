export type TipoId =
  | "normal"
  | "fire"
  | "water"
  | "grass"
  | "electric"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type AspectoTipo = {
  etiqueta: string;
  fondo: string;
  texto: string;
};

export const TIPOS: Record<TipoId, AspectoTipo> = {
  normal: { etiqueta: "Normal", fondo: "bg-tipo-normal", texto: "text-tinta" },
  fire: { etiqueta: "Fuego", fondo: "bg-tipo-fire", texto: "text-tinta" },
  water: { etiqueta: "Agua", fondo: "bg-tipo-water", texto: "text-tinta" },
  grass: { etiqueta: "Planta", fondo: "bg-tipo-grass", texto: "text-tinta" },
  electric: { etiqueta: "Eléctrico", fondo: "bg-tipo-electric", texto: "text-tinta" },
  ice: { etiqueta: "Hielo", fondo: "bg-tipo-ice", texto: "text-tinta" },
  fighting: { etiqueta: "Lucha", fondo: "bg-tipo-fighting", texto: "text-superficie" },
  poison: { etiqueta: "Veneno", fondo: "bg-tipo-poison", texto: "text-superficie" },
  ground: { etiqueta: "Tierra", fondo: "bg-tipo-ground", texto: "text-tinta" },
  flying: { etiqueta: "Volador", fondo: "bg-tipo-flying", texto: "text-tinta" },
  psychic: { etiqueta: "Psíquico", fondo: "bg-tipo-psychic", texto: "text-tinta" },
  bug: { etiqueta: "Bicho", fondo: "bg-tipo-bug", texto: "text-tinta" },
  rock: { etiqueta: "Roca", fondo: "bg-tipo-rock", texto: "text-tinta" },
  ghost: { etiqueta: "Fantasma", fondo: "bg-tipo-ghost", texto: "text-superficie" },
  dragon: { etiqueta: "Dragón", fondo: "bg-tipo-dragon", texto: "text-superficie" },
  dark: { etiqueta: "Siniestro", fondo: "bg-tipo-dark", texto: "text-superficie" },
  steel: { etiqueta: "Acero", fondo: "bg-tipo-steel", texto: "text-tinta" },
  fairy: { etiqueta: "Hada", fondo: "bg-tipo-fairy", texto: "text-tinta" },
};
