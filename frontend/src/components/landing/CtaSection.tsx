import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function CtaSection() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 px-6 py-16 text-white shadow-xl sm:px-10 lg:px-16 lg:py-20"
        >
          {/* Decorative Gradients */}
          <div aria-hidden="true" className="absolute -right-20 -top-24 h-80 w-80 rounded-full border-[48px] border-cyan-300/15" />
          <div aria-hidden="true" className="absolute bottom-0 right-1/3 h-32 w-32 translate-y-1/2 rounded-full border-[24px] border-white/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/40 via-transparent to-transparent" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-indigo-200">
                <CheckCircle2 aria-hidden="true" size={18} strokeWidth={2} />
                Control digital
              </div>
              <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl text-white">
                Menos conciliación manual.<br />Más contexto para decidir.
              </h2>
              <p className="mt-6 mb-10 max-w-2xl text-lg leading-relaxed text-indigo-100">
                Agenda una demostración personalizada para ver cómo Checkio puede adaptarse a la operación de tu empresa.
              </p>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="mailto:contact.orbitalframeworks@gmail.com?subject=Demo%20Checkio%20-%20Solicitud%20de%20informaci%C3%B3n"
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white px-8 text-base font-bold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:w-fit"
              >
                Hablar con Orbital Frameworks
                <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
              </motion.a>
            </div>

            <div className="flex flex-col lg:items-end">
              <div className="flex flex-col gap-4 rounded-2xl bg-indigo-900/40 p-6 text-sm text-indigo-100 backdrop-blur-md lg:max-w-sm border border-indigo-500/30">
                <p className="leading-relaxed">
                  <strong className="text-white">Checkio</strong> es desarrollado por <strong className="text-white">Orbital Frameworks</strong>. Construimos soluciones digitales para operaciones, control y crecimiento empresarial.
                </p>
                <div className="flex flex-col gap-3 font-medium sm:flex-row sm:gap-6 pt-2 border-t border-indigo-500/30">
                  <a href="https://orbitalframeworks.qzz.io/" target="_blank" rel="noreferrer" className="transition-colors hover:text-white flex items-center gap-1">
                    Visitar web <ArrowRight size={14} />
                  </a>
                  <a href="https://www.instagram.com/orbitalframeworkspe/" target="_blank" rel="noreferrer" className="transition-colors hover:text-white flex items-center gap-1">
                    Instagram <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
