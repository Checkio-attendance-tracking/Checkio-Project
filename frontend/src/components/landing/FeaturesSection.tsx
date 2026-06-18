import { Clock3, FileSpreadsheet, History, MapPin, RadioTower, Smartphone } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

export function FeaturesSection() {
  return (
    <div className="bg-[#fcfbf7] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Producto"
          title="Las piezas necesarias para una operación verificable."
          description="Cada función resuelve una parte concreta del control de asistencia y mantiene el contexto accesible para quien lo necesita."
          align="center"
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 md:col-span-2 lg:col-span-4 lg:row-span-2">
            <div className="relative z-10 max-w-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                <MapPin aria-hidden="true" size={22} />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">Geocercas ajustables por sede</h3>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Define el punto central y el radio permitido para que cada marcación se contraste con la zona configurada.
              </p>
            </div>
            <div className="relative mt-10 h-48 overflow-hidden rounded-xl border border-slate-200 bg-[#eef4f6]">
              <div aria-hidden="true" className="absolute inset-0 opacity-60 [background-image:linear-gradient(35deg,transparent_45%,#cbd5e1_46%,#cbd5e1_48%,transparent_49%),linear-gradient(125deg,transparent_45%,#dbeafe_46%,#dbeafe_49%,transparent_50%)] [background-size:80px_80px]" />
              <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-400 bg-indigo-500/10" />
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-lg">
                  <MapPin aria-hidden="true" size={20} />
                </div>
                <span className="mt-2 rounded-md bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white">Zona autorizada</span>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white md:col-span-1 lg:col-span-2">
            <Clock3 aria-hidden="true" className="text-cyan-300" size={23} />
            <p className="mt-8 font-mono text-4xl font-semibold tabular-nums tracking-tight">08:30</p>
            <h3 className="mt-3 text-lg font-semibold">Hora oficial protegida</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">La hora se verifica desde el servidor para evitar depender del reloj del teléfono.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-cyan-50 p-6 md:col-span-1 lg:col-span-2">
            <FileSpreadsheet aria-hidden="true" className="text-cyan-800" size={23} />
            <h3 className="mt-8 text-lg font-semibold text-slate-950">Planilla XLSX</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">Exporta la información del periodo con el cálculo de horas extras incluido.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 md:col-span-1 lg:col-span-2">
            <History aria-hidden="true" className="text-indigo-600" size={23} />
            <h3 className="mt-8 text-lg font-semibold text-slate-950">Historial visible</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Cada empleado puede consultar sus marcaciones y detectar omisiones.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 md:col-span-1 lg:col-span-2">
            <Smartphone aria-hidden="true" className="text-indigo-600" size={23} />
            <h3 className="mt-8 text-lg font-semibold text-slate-950">Sin hardware dedicado</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">La experiencia funciona desde dispositivos con navegador y acceso a ubicación.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-indigo-50 p-6 md:col-span-2 lg:col-span-2">
            <RadioTower aria-hidden="true" className="text-indigo-700" size={23} />
            <h3 className="mt-8 text-lg font-semibold text-slate-950">Actividad centralizada</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">RRHH consulta el estado del equipo y las excepciones desde el panel administrativo.</p>
          </article>
        </div>
      </div>
    </div>
  );
}
