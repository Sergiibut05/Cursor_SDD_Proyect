import { NavLink, Outlet } from 'react-router'

function Emblema() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      className="size-10 shrink-0"
    >
      <rect
        x="3"
        y="3"
        width="34"
        height="34"
        rx="10"
        fill="url(#emblema-fondo)"
        stroke="var(--color-marca-fuerte)"
        strokeWidth="1.2"
      />
      <path
        d="M20 8.5 28.5 14v12L20 31.5 11.5 26V14Z"
        fill="var(--color-marca-suave)"
        stroke="var(--color-marca)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="4.2" fill="var(--color-acento)" />
      <defs>
        <linearGradient id="emblema-fondo" x1="8" y1="4" x2="32" y2="36">
          <stop stopColor="var(--color-marca)" />
          <stop offset="1" stopColor="var(--color-marca-fuerte)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function MotivoEquipo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
      <path
        d="M8 1.8c1.8 2.2 4.8 3.4 4.8 7 0 2.6-2 4.6-4.8 5.4-2.8-.8-4.8-2.8-4.8-5.4 0-3.6 3-4.8 4.8-7Z"
        fill="currentColor"
      />
    </svg>
  )
}

const foco =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca'

export default function Marco() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 rounded-2xl border border-linea bg-linear-to-b from-superficie to-superficie-sombra px-4 py-4 shadow-[0_10px_28px_-16px_rgba(37,51,45,0.28),inset_0_1px_0_rgba(255,253,248,0.9)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Emblema />
          <div>
            <p className="font-sans text-xl font-semibold tracking-tight text-tinta">
              Visor Pokémon
            </p>
            <p className="text-sm text-tinta-suave">
              Tu guía ilustrada para explorar Pokémon
            </p>
          </div>
        </div>

        <nav aria-label="Principal" className="flex gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              [
                'inline-flex min-h-11 min-w-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors duration-150 sm:flex-none',
                foco,
                isActive
                  ? 'bg-marca-suave text-marca-fuerte shadow-[inset_0_1px_0_rgba(255,253,248,0.7)]'
                  : 'text-tinta hover:bg-superficie-suave',
              ].join(' ')
            }
          >
            Catálogo
          </NavLink>
          <NavLink
            to="/equipo"
            className={({ isActive }) =>
              [
                'inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors duration-150 sm:flex-none',
                foco,
                isActive
                  ? 'bg-marca-fuerte text-superficie shadow-[inset_0_1px_0_rgba(255,253,248,0.18)]'
                  : 'bg-marca text-superficie shadow-[inset_0_1px_0_rgba(255,253,248,0.22)] hover:bg-marca-fuerte',
              ].join(' ')
            }
          >
            <MotivoEquipo />
            Equipo
          </NavLink>
        </nav>
      </header>

      <main className="mt-10 sm:mt-12">
        <Outlet />
      </main>
    </div>
  )
}
