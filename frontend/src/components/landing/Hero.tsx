import { ArrowDown, ArrowRight, CheckCircle2, Clock3, MapPin } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const proofPoints = [
  { icon: MapPin, label: 'Marcación con ubicación' },
  { icon: Clock3, label: 'Hora oficial del servidor' },
  { icon: CheckCircle2, label: 'Historial consultable' },
];

export function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const rotateX = useTransform(useSpring(mouseY, { stiffness: 70, damping: 30 }), [-1, 1], [15, -5]);
  const rotateY = useTransform(useSpring(mouseX, { stiffness: 70, damping: 30 }), [-1, 1], [-25, -5]);

  return (
    <div className="relative overflow-hidden border-b border-slate-200">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-28 lg:pt-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-3 py-1.5 text-xs font-semibold text-indigo-800 backdrop-blur-sm shadow-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-500" aria-hidden="true" />
            Control de asistencia para equipos en movimiento
          </div>

          <h1 className="mt-7 text-4xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.04]">
            Control de asistencia que funciona solo. Sin equipos, sin fricción.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Checkio reúne marcaciones, ubicación registrada y hora oficial en un solo flujo digital para empleados y equipos de RRHH.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.a
              href="#solucion"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(79,70,229,0.2)] transition-colors hover:bg-indigo-700 hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Ver cómo funciona
              <ArrowDown aria-hidden="true" size={18} strokeWidth={2} />
            </motion.a>
            <motion.a
              href="mailto:contact.orbitalframeworks@gmail.com?subject=Demo%20Checkio%20-%20Solicitud%20de%20informaci%C3%B3n"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-200/60 bg-white/80 px-5 text-sm font-semibold text-slate-800 backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 shadow-sm hover:shadow-md"
            >
              Agendar demo
              <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </motion.a>
          </div>

          <ul className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {proofPoints.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon aria-hidden="true" className="shrink-0 text-cyan-600" size={18} strokeWidth={2} />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="relative mx-auto w-full max-w-3xl pb-20 sm:pb-24 lg:pb-16" style={{ perspective: 1200 }}>
          <motion.div 
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            className="relative h-full w-full"
          >
            <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 p-2 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.5)] backdrop-blur" style={{ transform: "translateZ(0px)" }}>
              <div className="flex items-center gap-1.5 border-b border-slate-100/60 px-3 py-2" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Panel RRHH</span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 sm:aspect-[16/9]">
                <img
                  src="/landing/landing_admin_dashboard.png"
                  alt="Vista superior del panel de RRHH de Checkio con resumen de asistencia"
                  width="1440"
                  height="900"
                  className="h-auto w-full object-cover object-top"
                />
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
              </div>
            </div>

            <div 
              className="absolute -bottom-6 right-2 w-[35%] max-w-[200px] overflow-hidden rounded-[2rem] border-[4px] border-slate-950 bg-slate-950 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.7)] sm:-bottom-10 sm:right-6 lg:-bottom-12 lg:right-8"
              style={{ transform: "translateZ(60px)" }}
            >
              <div className="relative aspect-[390/844] overflow-hidden rounded-[1.65rem] bg-white">
                <img
                  src="/landing/landing_hero_employee_mobile.png"
                  alt="Pantalla móvil de marcación de asistencia para empleados"
                  width="390"
                  height="844"
                  className="h-full w-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div 
              className="absolute bottom-10 left-2 rounded-2xl border border-cyan-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm sm:left-4 lg:bottom-6"
              style={{ transform: "translateZ(40px)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Flujo conectado</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Empleado → RRHH</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
