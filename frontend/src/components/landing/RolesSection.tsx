import { CheckCircle2, ClipboardCheck, LayoutDashboard, UserRound } from 'lucide-react';
import { SectionHeading } from './SectionHeading';


const roles = [
  {
    icon: UserRound,
    title: 'Empleado',
    label: 'Operación diaria',
    items: ['Marca ingreso, almuerzo y salida', 'Consulta su historial', 'Solicita correcciones con contexto'],
    color: 'slate',
  },
  {
    icon: ClipboardCheck,
    title: 'Recursos Humanos',
    label: 'Control y revisión',
    items: ['Revisa asistencia del equipo', 'Gestiona planilla y correcciones', 'Configura la geocerca de la empresa'],
    color: 'indigo',
  },
];

export function RolesSection() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-16">
          <SectionHeading
            eyebrow="Roles"
            title="Una vista adecuada para cada responsabilidad."
            description="Checkio separa la experiencia diaria de la administración de RRHH, asegurando que cada rol solo vea lo que necesita."
          />
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200/60 bg-white/60 px-5 py-3 text-sm font-semibold text-slate-700 backdrop-blur-sm shadow-sm">
            <LayoutDashboard aria-hidden="true" className="text-indigo-600" size={20} strokeWidth={1.5} />
            Accesos definidos por rol
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto">
          {roles.map(({ icon: Icon, title, label, items, color }) => {
            const isHighlight = color === 'indigo';
            return (
              <article
                key={title}
                className={`group flex flex-col justify-between rounded-[2.5rem] border p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] ${
                  isHighlight 
                    ? 'border-indigo-200/60 bg-gradient-to-b from-indigo-50/80 to-white shadow-sm' 
                    : 'border-slate-200/60 bg-white/80 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${
                      isHighlight ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                    }`}>
                      <Icon aria-hidden="true" size={26} strokeWidth={1.5} />
                    </div>
                    <div className="inline-flex items-center gap-4">
                      <span className={`h-px w-6 sm:w-10 ${isHighlight ? 'bg-indigo-300' : 'bg-slate-300'}`} aria-hidden="true" />
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${isHighlight ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {label}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h3>
                </div>
                
                <ul className="mt-8 space-y-4">
                  {items.map((item) => (
                    <li key={item} className="flex gap-3 text-base leading-relaxed text-slate-600">
                      <CheckCircle2 aria-hidden="true" className={`mt-0.5 shrink-0 ${isHighlight ? 'text-indigo-600' : 'text-cyan-600'}`} size={20} strokeWidth={1.5} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
