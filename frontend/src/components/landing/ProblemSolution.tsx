import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cable, Files, Fingerprint, MapPinned, Smartphone, TimerReset } from 'lucide-react';

const content = {
  caos: [
    {
      icon: Fingerprint,
      title: 'Hardware que inmoviliza',
      text: 'Los biométricos físicos requieren compra, instalación y mantenimiento por sede. Te anclan a un solo lugar.',
      color: 'text-red-500',
      bg: 'bg-red-50/50',
      border: 'border-red-100',
    },
    {
      icon: Files,
      title: 'Registros fragmentados',
      text: 'Archivos y controles separados hacen más lenta la revisión. Conciliar hojas de cálculo es una pérdida de tiempo.',
      color: 'text-orange-500',
      bg: 'bg-orange-50/50',
      border: 'border-orange-100',
    },
    {
      icon: TimerReset,
      title: 'Correcciones manuales',
      text: 'Resolver omisiones por mensajes sueltos dificulta conservar el contexto de cada decisión y genera caos.',
      color: 'text-purple-500',
      bg: 'bg-purple-50/50',
      border: 'border-purple-100',
    },
  ],
  solucion: [
    {
      icon: Smartphone,
      title: 'El empleado marca',
      text: 'Registra su jornada desde una experiencia simple y adaptable a móvil. Sin filas ni equipos rotos.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-100',
    },
    {
      icon: MapPinned,
      title: 'Checkio valida',
      text: 'Contrasta la ubicación con la geocerca y usa la hora oficial del servidor para garantizar total precisión.',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50/50',
      border: 'border-cyan-100',
    },
    {
      icon: Cable,
      title: 'RRHH consolida',
      text: 'Consulta actividad, atiende correcciones y prepara la planilla desde un solo lugar. Con un clic.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
    },
  ]
};

export function ProblemSolution() {
  const [activeTab, setActiveTab] = useState<'caos' | 'solucion'>('solucion');

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between mb-16">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-4">
              <span className="h-px w-6 bg-slate-300 sm:w-10" aria-hidden="true" />
              <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-500 md:text-sm">
                Realidad vs Ideal
              </p>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl lg:text-5xl">
              Controlar asistencia no debería ser un trabajo manual.
            </h2>
          </div>

          <div className="flex self-start rounded-xl bg-slate-200/60 p-1 backdrop-blur-sm md:self-end border border-slate-300/50">
            <button
              onClick={() => setActiveTab('caos')}
              className={`relative px-5 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'caos' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {activeTab === 'caos' && (
                <motion.div layoutId="tab-indicator" className="absolute inset-0 rounded-lg bg-white shadow-sm border border-slate-200/60" />
              )}
              <span className="relative z-10">El Caos Habitual</span>
            </button>
            <button
              onClick={() => setActiveTab('solucion')}
              className={`relative px-5 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'solucion' ? 'text-indigo-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {activeTab === 'solucion' && (
                <motion.div layoutId="tab-indicator" className="absolute inset-0 rounded-lg bg-indigo-50 shadow-sm border border-indigo-100" />
              )}
              <span className="relative z-10">El Método Checkio</span>
            </button>
          </div>
        </div>

        <div className="relative min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="grid gap-6 sm:grid-cols-3"
            >
              {content[activeTab].map(({ icon: Icon, title, text, color, bg, border }, index) => (
                <motion.article 
                  key={title}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                  className={`group overflow-hidden rounded-3xl border ${border} ${bg} p-8 backdrop-blur-sm transition-all hover:shadow-md hover:bg-white/90`}
                >
                  <div className={`mb-6 inline-flex rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-900/5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                    <Icon aria-hidden="true" className={color} size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>
                  <p className="text-base leading-relaxed text-slate-600">{text}</p>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
