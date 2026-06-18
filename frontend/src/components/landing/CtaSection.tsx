import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function CtaSection() {
  return (
    <div className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-indigo-600 px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
          <div aria-hidden="true" className="absolute -right-20 -top-24 h-80 w-80 rounded-full border-[48px] border-cyan-300/15" />
          <div aria-hidden="true" className="absolute bottom-0 right-1/3 h-32 w-32 translate-y-1/2 rounded-full border-[24px] border-white/10" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
                <CheckCircle2 aria-hidden="true" size={18} />
                Control digital para la operación real
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                Menos conciliación manual. Más contexto para decidir.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-indigo-100 sm:text-lg">
                Revisa la experiencia actual de Checkio ingresando al sistema desde el flujo existente.
              </p>
            </div>

            <a
              href="/"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:w-fit"
            >
              Ingresar a Checkio
              <ArrowRight aria-hidden="true" size={17} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
