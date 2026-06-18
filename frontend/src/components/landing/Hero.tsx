import { ArrowDown, ArrowRight, CheckCircle2, Clock3, MapPin } from 'lucide-react';

const proofPoints = [
  { icon: MapPin, label: 'Marcación con ubicación' },
  { icon: Clock3, label: 'Hora oficial del servidor' },
  { icon: CheckCircle2, label: 'Historial consultable' },
];

export function Hero() {
  return (
    <div className="relative overflow-hidden border-b border-slate-200 bg-[#fcfbf7]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-28 lg:pt-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800">
            <span className="h-2 w-2 rounded-full bg-cyan-500" aria-hidden="true" />
            Control de asistencia para equipos en movimiento
          </div>

          <h1 className="mt-7 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.04]">
            Control de asistencia claro, desde cualquier lugar.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Checkio reúne marcaciones, ubicación registrada y hora oficial en un solo flujo digital para empleados y equipos de RRHH.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#solucion"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Ver cómo funciona
              <ArrowDown aria-hidden="true" size={17} />
            </a>
            <a
              href="mailto:contact.orbitalframeworks@gmail.com?subject=Demo%20Checkio%20-%20Solicitud%20de%20informaci%C3%B3n"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Agendar demo
              <ArrowRight aria-hidden="true" size={17} />
            </a>
          </div>

          <ul className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {proofPoints.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon aria-hidden="true" className="shrink-0 text-cyan-700" size={17} />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-3xl pb-20 sm:pb-24 lg:pb-16">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.5)]">
            <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">Panel RRHH</span>
            </div>
            <div className="relative aspect-[4/1] overflow-hidden bg-slate-50">
              <img
                src="/landing/landing_admin_dashboard.png"
                alt="Vista superior del panel de RRHH de Checkio con resumen de asistencia"
                width="1440"
                height="900"
                className="h-auto w-full object-cover object-top"
              />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
            </div>
          </div>

          <div className="absolute bottom-0 right-3 w-[42%] max-w-[220px] overflow-hidden rounded-[2rem] border-[5px] border-slate-950 bg-slate-950 shadow-[0_24px_60px_-25px_rgba(15,23,42,0.65)] sm:right-8 lg:right-10">
            <div className="relative aspect-[390/844] overflow-hidden rounded-[1.65rem] bg-white">
              <img
                src="/landing/landing_hero_employee_mobile.png"
                alt="Pantalla móvil de marcación de asistencia para empleados"
                width="390"
                height="844"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>

          <div className="absolute bottom-12 left-1 rounded-xl border border-cyan-200 bg-white px-4 py-3 shadow-lg sm:left-6 lg:bottom-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Flujo conectado</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Empleado → RRHH</p>
          </div>
        </div>
      </div>
    </div>
  );
}
