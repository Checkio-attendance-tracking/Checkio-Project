import { KeyRound, MapPinCheck, ShieldCheck } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { motion } from 'framer-motion';

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
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <SectionHeading
            eyebrow="Seguridad y privacidad"
            title="Controles concretos y trazables."
            description="Checkio combina acceso por roles, validación territorial y trazabilidad para que el control sea comprensible tanto para la empresa como para sus empleados."
            align="center"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {safeguards.map(({ icon: Icon, title, text }, index) => (
            <motion.article 
              initial={{ opacity: 0, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={title} 
              className="group flex flex-col justify-between rounded-[2rem] border border-slate-200/60 bg-white/80 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]"
            >
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  <Icon aria-hidden="true" size={26} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">{title}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{text}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col gap-6 rounded-[2rem] border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-white p-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/60">
              <ShieldCheck aria-hidden="true" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">Nota de privacidad</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 max-w-3xl">
                Checkio registra ubicación únicamente durante el proceso de marcación. No realiza rastreo continuo en segundo plano. Los datos de asistencia, ubicación y dispositivo se usan para validar registros laborales y brindar trazabilidad a la empresa administradora.
              </p>
            </div>
          </div>
          <a href="/privacy" className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Ver política
          </a>
        </motion.div>
      </div>
    </div>
  );
}
