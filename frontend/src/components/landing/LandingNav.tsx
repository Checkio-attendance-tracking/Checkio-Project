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
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <a href="/landing" className="flex min-h-12 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Logo size={36} />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight tracking-tight text-slate-950">Checkio</span>
              <span className="mt-0.5 text-[10px] font-bold uppercase leading-none tracking-widest text-slate-400">by Orbital Frameworks</span>
            </div>
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
            href="mailto:contact.orbitalframeworks@gmail.com?subject=Demo%20Checkio%20-%20Solicitud%20de%20informaci%C3%B3n"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Solicitar demo
            <ArrowRight aria-hidden="true" size={16} />
          </a>
        </nav>
      </header>
    </>
  );
}
