import { ArrowUpRight } from 'lucide-react';
import { Logo } from '../Logo';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[2fr_1fr_1fr] lg:px-8 lg:py-16">
        <div>
          <div className="flex items-center gap-3">
            <Logo size={34} />
            <div>
              <p className="font-semibold text-slate-950">Checkio</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">by Orbital Frameworks</p>
            </div>
          </div>
          <p className="mt-6 max-w-xs text-sm leading-6 text-slate-500">
            Checkio registra ubicación únicamente durante el proceso de marcación. No realiza rastreo continuo en segundo plano.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-950">Producto</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><a href="#solucion" className="transition-colors hover:text-slate-950">Solución</a></li>
            <li><a href="#seguridad" className="transition-colors hover:text-slate-950">Seguridad</a></li>
            <li><a href="#faq" className="transition-colors hover:text-slate-950">Preguntas Frecuentes</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-950">Orbital Frameworks</h3>
          <p className="mt-2 pr-4 text-[13px] leading-5 text-slate-500">Soluciones digitales para operaciones y crecimiento empresarial.</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <a href="https://orbitalframeworks.qzz.io/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-slate-950">
                Web oficial
                <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/orbitalframeworkspe/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-slate-950">
                Instagram
                <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            </li>
            <li>
              <a href="mailto:contact.orbitalframeworks@gmail.com?subject=Demo%20Checkio%20-%20Solicitud%20de%20informaci%C3%B3n" className="transition-colors hover:text-slate-950">
                Contacto comercial
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-slate-200/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Checkio. Todos los derechos reservados. Desarrollado por Orbital Frameworks.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="transition-colors hover:text-slate-900">Privacidad</a>
            <a href="/terms" className="transition-colors hover:text-slate-900">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
