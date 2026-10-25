import { TIPOS, type TipoId } from "../api/tipos.ts";

type InsigniaTipoProps = {
  tipo: TipoId;
};

export default function InsigniaTipo({ tipo }: InsigniaTipoProps) {
  const aspecto = TIPOS[tipo];

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-semibold leading-none ${aspecto.fondo} ${aspecto.texto}`}
    >
      {aspecto.etiqueta}
    </span>
  );
}
