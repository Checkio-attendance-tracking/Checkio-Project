import { Building2, CheckCircle2, ClipboardCheck, LayoutDashboard, UserRound } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const roles = [
  {
    icon: UserRound,
    title: 'Empleado',
    label: 'Operación diaria',
    items: ['Marca ingreso, almuerzo y salida', 'Consulta su historial', 'Solicita correcciones con contexto'],
  },
  {
    icon: ClipboardCheck,
    title: 'RRHH / Admin',
    label: 'Control y revisión',
    items: ['Revisa asistencia del equipo', 'Gestiona planilla y correcciones', 'Configura la geocerca de la empresa'],
  },
  {
    icon: Building2,
    title: 'Superadmin',
    label: 'Gestión de organizaciones',
    items: ['Administra empresas registradas', 'Controla accesos administrativos', 'Supervisa capacidad por organización'],
  },
];

export function RolesSection() {
  return (
    <div className="border-y border-slate-200 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Roles"
            title="Una vista adecuada para cada responsabilidad."
            description="Checkio separa la experiencia diaria, la administración de RRHH y la gestión de organizaciones sin mezclar tareas."
          />
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <LayoutDashboard aria-hidden="true" className="text-indigo-600" size={18} />
            Accesos definidos por rol
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {roles.map(({ icon: Icon, title, label, items }, index) => (
            <article
              key={title}
              className={`rounded-2xl border p-6 ${index === 1 ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${index === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  <Icon aria-hidden="true" size={22} />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
              </div>
              <h3 className="mt-8 text-xl font-semibold text-slate-950">{title}</h3>
              <ul className="mt-5 space-y-3">
                {items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <CheckCircle2 aria-hidden="true" className="mt-1 shrink-0 text-cyan-700" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
