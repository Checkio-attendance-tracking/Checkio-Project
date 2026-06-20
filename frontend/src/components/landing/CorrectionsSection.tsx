import { Check, ClipboardPenLine, SearchCheck, CheckCircle2 } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const steps = [
  { number: '01', title: 'Solicitar', text: 'El empleado identifica la marcación y explica el ajuste requerido desde la app móvil.' },
  { number: '02', title: 'Revisar', text: 'RRHH recibe el contexto y contrasta la solicitud con el historial en tiempo real.' },
  { number: '03', title: 'Resolver', text: 'La decisión queda registrada en sistema para mantener la trazabilidad del flujo.' },
];

export function CorrectionsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 60%", "end 60%"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest > 0.65 && !isResolved) {
        setIsResolved(true);
      } else if (latest <= 0.65 && isResolved) {
        setIsResolved(false);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, isResolved]);

  return (
    <div className="border-t border-slate-200/60 py-24 sm:py-32" ref={containerRef}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Procesos"
              title="Las excepciones siguen un proceso estructurado."
              description="El empleado inicia la solicitud desde su historial y RRHH la revisa desde el panel administrativo, eliminando el desorden de mensajes por chat."
            />

            <div className="relative mt-12 pl-8 md:pl-12">
              {/* Background Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-slate-100" />
              {/* Animated Progress Line */}
              <motion.div 
                className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-indigo-500 origin-top"
                style={{ scaleY: lineHeight }}
              />
              
              <ol className="space-y-12">
                {steps.map((step) => (
                  <li key={step.number} className="relative">
                    <div className="absolute -left-8 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 ring-4 ring-white md:-left-12">
                      <div className="h-2 w-2 rounded-full bg-indigo-600" />
                    </div>
                    <span className="font-mono text-xs font-bold tracking-widest text-indigo-600">{step.number}</span>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-base leading-relaxed text-slate-600">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="sticky top-32 rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] md:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  animate={{ backgroundColor: isResolved ? "#10b981" : "#4f46e5" }}
                  transition={{ duration: 0.4 }}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                >
                  <ClipboardPenLine aria-hidden="true" size={24} strokeWidth={1.5} />
                </motion.div>
                <div>
                  <p className="text-lg font-bold tracking-tight text-slate-900">Solicitud de corrección</p>
                  <p className="mt-1 text-sm text-slate-500">{isResolved ? "Caso revisado y cerrado" : "Lista para revisión por RRHH"}</p>
                </div>
              </div>
              <motion.span 
                animate={{ 
                  backgroundColor: isResolved ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                  color: isResolved ? "#059669" : "#d97706"
                }}
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-widest self-start sm:self-auto"
              >
                {isResolved ? 'Resuelto' : 'Pendiente'}
              </motion.span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Marcación</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Ingreso de jornada</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Ajuste Solicitado</p>
                <p className="mt-2 text-base font-semibold text-slate-900">08:00 AM</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 sm:col-span-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Motivo</p>
                <p className="mt-2 text-base leading-relaxed text-slate-700">"El teléfono se reinició al momento de llegar a la sede, adjunto foto de llegada al supervisor."</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <motion.button 
                animate={{ opacity: isResolved ? 0.4 : 1 }}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <SearchCheck aria-hidden="true" size={18} strokeWidth={2} />
                Revisar contexto
              </motion.button>
              <motion.button 
                animate={{ 
                  backgroundColor: isResolved ? "#10b981" : "#0f172a",
                  scale: isResolved ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: 0.3 }}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-sm"
              >
                {isResolved ? (
                  <>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                      <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2} />
                    </motion.div>
                    Resuelto con éxito
                  </>
                ) : (
                  <>
                    <Check aria-hidden="true" size={18} strokeWidth={2} />
                    Aprobar solicitud
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
