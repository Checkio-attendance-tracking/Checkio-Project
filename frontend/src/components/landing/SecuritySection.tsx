import { CheckCircle2, KeyRound, MapPinCheck, ShieldCheck } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const safeguards = [
  {
    icon: KeyRound,
    title: 'Acceso según responsabilidad',
    text: 'Los perfiles separan la marcación del empleado, la gestión de RRHH y la administración de organizaciones.',
  },
  {
    icon: MapPinCheck,
    title: 'Ubicación puntual',
    text: 'La geolocalización se registra con el evento de asistencia y se compara con la zona configurada.',
  },
  {
    icon: ShieldCheck,
    title: 'Decisiones trazables',
    text: 'Las solicitudes de corrección conservan el contexto necesario para revisar y resolver cada caso.',
  },
];

export function SecuritySection() {
  return (
    <div className="bg-[#fcfbf7] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Seguridad y privacidad"
          title="Controles concretos, explicados sin promesas absolutas."
          description="Checkio combina acceso por roles, validación territorial y trazabilidad para que el control sea comprensible tanto para la empresa como para sus empleados."
          align="center"
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {safeguards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                <Icon aria-hidden="true" size={22} />
              </div>
              <h3 className="mt-8 text-lg font-semibold text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-cyan-700" size={20} />
            <div>
              <p className="text-sm font-semibold text-slate-950">Principio de mínima exposición</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">La landing no muestra datos de clientes, identificadores internos ni información operativa sensible.</p>
            </div>
          </div>
          <a href="#geocerca" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Ver uso de ubicación
          </a>
        </div>
      </div>
    </div>
  );
}
