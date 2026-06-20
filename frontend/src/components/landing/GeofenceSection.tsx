import { CheckCircle2, Crosshair, MapPin, ScanLine } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { motion } from 'framer-motion';

export function GeofenceSection() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading
            eyebrow="Geocerca y trazabilidad"
            title="La ubicación aporta contexto justo cuando importa."
            description="El administrador define una zona permitida y Checkio registra la ubicación al momento de cada marcación. No realiza rastreo continuo del empleado."
          />

          <ul className="mt-10 space-y-5">
            {[
              'Radio ajustable según la operación de cada sede.',
              'Validación de ubicación durante la marcación.',
              'Registro consultable junto con la hora oficial.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-4 text-base leading-relaxed text-slate-600">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-indigo-600" size={22} strokeWidth={1.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-6 shadow-sm">
            <p className="text-base font-bold tracking-tight text-slate-900">Privacidad operativa</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">La ubicación se solicita para registrar el evento de asistencia, no para seguir desplazamientos continuos ni invadir la privacidad personal fuera del horario laboral.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-[2.5rem] border border-slate-200/60 bg-white/80 p-4 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)] backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 mb-2">
            <div>
              <p className="text-base font-bold text-slate-900">Zona de marcación</p>
              <p className="mt-1 text-sm text-slate-500">Configuración visual de referencia</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <ScanLine aria-hidden="true" size={24} strokeWidth={1.5} />
            </div>
          </div>

          <div className="relative h-[400px] overflow-hidden rounded-[2rem] border border-slate-200/60 bg-slate-50">
            <div aria-hidden="true" className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
            <div aria-hidden="true" className="absolute left-[13%] top-[18%] h-px w-[70%] rotate-12 bg-white/90 shadow-[0_0_0_5px_rgba(255,255,255,0.5)]" />
            <div aria-hidden="true" className="absolute left-[18%] top-[66%] h-px w-[72%] -rotate-8 bg-white/90 shadow-[0_0_0_5px_rgba(255,255,255,0.5)]" />

            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_0_18px_rgba(79,70,229,0.03)] backdrop-blur-[1px]">
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-[4px] border-white bg-indigo-600 text-white shadow-xl"
                >
                  <MapPin aria-hidden="true" size={24} strokeWidth={2} />
                </motion.div>
                <span className="mt-3 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-md">Sede configurada</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md">
              <Crosshair aria-hidden="true" className="text-indigo-600" size={18} strokeWidth={2} />
              Radio ajustable
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
