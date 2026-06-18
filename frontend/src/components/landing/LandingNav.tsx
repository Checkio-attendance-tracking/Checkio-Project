import { ArrowRight } from 'lucide-react';
import { Logo } from '../Logo';

const navigation = [
  { href: '#solucion', label: 'Solución' },
  { href: '#funcionalidades', label: 'Producto' },
  { href: '#roles', label: 'Roles' },
  { href: '#seguridad', label: 'Seguridad' },
];

export function LandingNav() {
  return (
    <>
      <a
        href="#contenido-principal"
        className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#fcfbf7]/95 backdrop-blur">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <a href="/landing" className="flex min-h-11 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Logo size={36} />
            <span className="text-lg font-bold tracking-tight text-slate-950">Checkio</span>
          </a>

          <div className="hidden items-center gap-7 md:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {item.label}
              </a>
            ))}
          </div>

          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Ingresar
            <ArrowRight aria-hidden="true" size={16} />
          </a>
        </nav>
      </header>
    </>
  );
}
