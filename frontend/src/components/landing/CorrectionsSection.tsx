import { ArrowRight, Check, ClipboardPenLine, SearchCheck } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const steps = [
  { number: '01', title: 'Solicitar', text: 'El empleado identifica la marcación y explica el ajuste requerido.' },
  { number: '02', title: 'Revisar', text: 'RRHH recibe el contexto y contrasta la solicitud con el historial.' },
  { number: '03', title: 'Resolver', text: 'La decisión queda registrada para mantener la trazabilidad del flujo.' },
];

export function CorrectionsSection() {
  return (
    <div className="border-y border-slate-200 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Correcciones de asistencia"
              title="Las excepciones siguen un proceso, no una cadena de mensajes."
              description="El empleado inicia la solicitud desde su historial y RRHH la revisa desde el panel administrativo."
            />

            <ol className="mt-8 space-y-3">
              {steps.map((step, index) => (
                <li key={step.number} className="relative flex gap-4 rounded-xl border border-slate-200 bg-[#fcfbf7] p-4">
                  <span className="font-mono text-xs font-semibold text-indigo-700">{step.number}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight aria-hidden="true" className="absolute -bottom-4 left-1/2 z-10 rotate-90 rounded-full border border-slate-200 bg-white p-1 text-slate-400" size={26} />
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.65)] sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white">
                  <ClipboardPenLine aria-hidden="true" size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Solicitud de corrección</p>
                  <p className="mt-0.5 text-xs text-slate-400">Lista para revisión</p>
                </div>
              </div>
              <span className="rounded-md bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-200">Pendiente</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Marcación</p>
                <p className="mt-2 text-sm font-semibold text-white">Ingreso de jornada</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Ajuste</p>
                <p className="mt-2 text-sm font-semibold text-white">Hora corregida</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Motivo</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Contexto proporcionado por el empleado para facilitar la evaluación.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-600 text-sm font-semibold text-slate-200">
                <SearchCheck aria-hidden="true" size={17} />
                Revisar contexto
              </div>
              <div className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white">
                <Check aria-hidden="true" size={17} />
                Resolver solicitud
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
