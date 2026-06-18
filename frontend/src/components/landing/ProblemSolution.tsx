import { ArrowRight, Cable, Files, Fingerprint, MapPinned, Smartphone, TimerReset } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const problems = [
  {
    icon: Fingerprint,
    title: 'Hardware que inmoviliza',
    text: 'Los biométricos físicos requieren compra, instalación y mantenimiento por sede.',
  },
  {
    icon: Files,
    title: 'Registros fragmentados',
    text: 'Archivos y controles separados hacen más lenta la revisión de asistencia.',
  },
  {
    icon: TimerReset,
    title: 'Correcciones manuales',
    text: 'Resolver omisiones por mensajes sueltos dificulta conservar el contexto de cada decisión.',
  },
];

const solutionSteps = [
  { icon: Smartphone, number: '01', title: 'El empleado marca', text: 'Registra su jornada desde una experiencia simple y adaptable a móvil.' },
  { icon: MapPinned, number: '02', title: 'Checkio valida', text: 'Contrasta la ubicación con la geocerca y usa la hora oficial del servidor.' },
  { icon: Cable, number: '03', title: 'RRHH consolida', text: 'Consulta actividad, atiende correcciones y prepara la planilla desde un solo lugar.' },
];

export function ProblemSection() {
  return (
    <div className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <SectionHeading
            eyebrow="El problema"
            title="Controlar asistencia no debería depender de más equipos ni más archivos."
            description="Cuando cada sede trabaja con herramientas distintas, RRHH termina conciliando información en lugar de gestionar excepciones."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {problems.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-xl border border-slate-200 bg-[#fcfbf7] p-5">
                <Icon aria-hidden="true" className="text-indigo-600" size={22} />
                <h3 className="mt-8 text-base font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SolutionSection() {
  return (
    <div className="border-y border-slate-200 bg-slate-950 py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">La solución</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Un flujo, desde la marcación hasta la revisión.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Checkio conecta la experiencia diaria del empleado con las tareas operativas de RRHH, sin añadir hardware dedicado.
            </p>
          </div>

          <ol className="grid gap-px overflow-hidden rounded-xl border border-slate-700 bg-slate-700 md:grid-cols-3">
            {solutionSteps.map(({ icon: Icon, number, title, text }, index) => (
              <li key={number} className="relative bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                  <Icon aria-hidden="true" className="text-cyan-300" size={23} />
                  <span className="font-mono text-xs text-slate-500">{number}</span>
                </div>
                <h3 className="mt-10 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                {index < solutionSteps.length - 1 && (
                  <ArrowRight aria-hidden="true" className="absolute -right-3 top-1/2 z-10 hidden rounded-full bg-indigo-500 p-1 text-white md:block" size={24} />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
