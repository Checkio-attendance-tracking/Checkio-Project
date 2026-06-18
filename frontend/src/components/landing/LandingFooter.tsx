import { ArrowUpRight } from 'lucide-react';
import { Logo } from '../Logo';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#fcfbf7]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <Logo size={34} />
          <div>
            <p className="font-semibold text-slate-950">Checkio</p>
            <p className="mt-0.5 text-xs text-slate-500">Sistema de control de asistencia</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
          <a href="#solucion" className="min-h-11 content-center transition-colors hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500">Solución</a>
          <a href="#seguridad" className="min-h-11 content-center transition-colors hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500">Seguridad</a>
          <a href="#faq" className="min-h-11 content-center transition-colors hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500">Preguntas Frecuentes</a>
          <a href="/" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-indigo-700 transition-colors hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Ingresar
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <p>© {new Date().getFullYear()} Checkio. Todos los derechos reservados.</p>
            <p className="text-slate-400">Checkio registra ubicación únicamente durante el proceso de marcación. No realiza rastreo continuo en segundo plano.</p>
          </div>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-slate-900 transition-colors">Privacidad</a>
            <a href="/terms" className="hover:text-slate-900 transition-colors">Términos</a>
            <a href="mailto:soporte@checkio.pe" className="hover:text-slate-900 transition-colors">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
