import { Clock3, FileSpreadsheet, History, MapPin, RadioTower, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export function FeaturesSection() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-4 justify-center mb-4">
            <span className="h-px w-6 bg-slate-300 sm:w-10" aria-hidden="true" />
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-500 md:text-sm">
              Producto
            </p>
            <span className="h-px w-6 bg-slate-300 sm:w-10" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl lg:text-5xl">
            Las piezas para una operación verificable.
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Cada función resuelve una parte concreta del control de asistencia y mantiene el contexto accesible para quien lo necesita.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3 md:auto-rows-[280px]">
          
          {/* 1. Geocercas (Hero Feature) */}
          <motion.article 
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white/90 p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] md:col-span-2 lg:col-span-2 lg:row-span-2"
          >
            <div className="relative z-10 max-w-md">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                <MapPin aria-hidden="true" size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">Geocercas ajustables por sede</h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Define el punto central y el radio permitido para que cada marcación se contraste con la zona configurada en tiempo real.
              </p>
            </div>
            
            <div className="relative mt-8 h-48 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50">
              <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:linear-gradient(35deg,transparent_45%,#94a3b8_46%,#94a3b8_48%,transparent_49%),linear-gradient(125deg,transparent_45%,#bfdbfe_46%,#bfdbfe_49%,transparent_50%)] [background-size:60px_60px]" />
                <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-300 bg-indigo-400/10 shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]" />
                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-xl">
                    <MapPin aria-hidden="true" size={22} />
                  </div>
                  <span className="mt-3 rounded-lg bg-slate-900/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">Zona Segura</span>
                </div>
              </div>
            </div>
          </motion.article>

          {/* 2. Hora Oficial */}
          <motion.article 
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-slate-900 p-8 shadow-sm transition-all hover:shadow-md lg:col-span-1 lg:row-span-1"
          >
            <div>
              <Clock3 aria-hidden="true" className="text-cyan-400" size={28} strokeWidth={1.5} />
              <h3 className="mt-6 text-lg font-bold tracking-tight text-white">Hora protegida</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Verificada en servidor, sin depender del reloj local del teléfono.</p>
            </div>
            <p className="mt-6 font-mono text-5xl font-light tabular-nums tracking-tighter text-white opacity-90 transition-transform duration-500 group-hover:scale-105 group-hover:text-cyan-300 origin-left">
              08:30
            </p>
          </motion.article>

          {/* 3. Planilla XLSX */}
          <motion.article 
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-cyan-100/60 bg-gradient-to-br from-cyan-50 to-white p-8 shadow-sm transition-all hover:shadow-md lg:col-span-1 lg:row-span-1"
          >
            <div>
              <FileSpreadsheet aria-hidden="true" className="text-cyan-700" size={28} strokeWidth={1.5} />
              <h3 className="mt-6 text-lg font-bold tracking-tight text-slate-900">Planilla XLSX</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Exporta tu información con cálculo de horas extras incluido.</p>
            </div>
            <div className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-white border border-cyan-100 shadow-sm transition-transform duration-500 group-hover:scale-105">
              <span className="text-xs font-bold text-cyan-700 tracking-wider">↓ DESCARGAR</span>
            </div>
          </motion.article>

          {/* 4. Historial Visible */}
          <motion.article 
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm transition-all hover:shadow-md lg:col-span-1 lg:row-span-1"
          >
            <div>
              <History aria-hidden="true" className="text-indigo-600" size={28} strokeWidth={1.5} />
              <h3 className="mt-6 text-lg font-bold tracking-tight text-slate-900">Historial visible</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Cada empleado audita sus propias marcaciones.</p>
            </div>
            <div className="mt-4 flex gap-2 transition-transform duration-500 group-hover:translate-x-2">
              <div className="h-2 w-full rounded-full bg-slate-100" />
              <div className="h-2 w-2/3 rounded-full bg-indigo-100" />
            </div>
          </motion.article>

          {/* 5. Sin hardware */}
          <motion.article 
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm transition-all hover:shadow-md lg:col-span-1 lg:row-span-1"
          >
            <div>
              <Smartphone aria-hidden="true" className="text-indigo-600" size={28} strokeWidth={1.5} />
              <h3 className="mt-6 text-lg font-bold tracking-tight text-slate-900">Cero equipos</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Funciona desde cualquier navegador moderno.</p>
            </div>
            <div className="mt-4 flex items-center justify-center transition-transform duration-500 group-hover:-translate-y-2">
              <div className="h-16 w-10 rounded-xl border-4 border-slate-200 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
              </div>
            </div>
          </motion.article>

          {/* 6. Actividad Centralizada */}
          <motion.article 
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative flex flex-col md:flex-row overflow-hidden rounded-[2.5rem] border border-indigo-100/60 bg-gradient-to-r from-indigo-50/80 to-white p-8 shadow-sm transition-all hover:shadow-md lg:col-span-4 lg:row-span-1 items-center gap-8"
          >
            <div className="flex-1">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100">
                <RadioTower aria-hidden="true" size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">Actividad Centralizada</h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600 max-w-2xl">
                RRHH consulta el estado del equipo, atiende omisiones y audita excepciones desde un único panel administrativo. Todo sincronizado en milisegundos.
              </p>
            </div>
            <div className="hidden md:flex flex-1 justify-end">
              <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">RC</div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900 leading-none">Recepcionista</p>
                      <p className="text-[11px] text-slate-500 mt-1">Sede Principal • 08:32 AM</p>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">A TIEMPO</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">OP</div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900 leading-none">Jefe de Operaciones</p>
                      <p className="text-[11px] text-slate-500 mt-1">Sede Norte • 09:15 AM</p>
                    </div>
                  </div>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">TARDANZA</span>
                </div>
              </div>
            </div>
          </motion.article>

        </div>
      </div>
    </div>
  );
}
