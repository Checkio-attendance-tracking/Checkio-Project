import { CheckCircle2, Crosshair, MapPin, ScanLine } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

export function GeofenceSection() {
  return (
    <div className="bg-[#fcfbf7] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Geocerca y trazabilidad"
            title="La ubicación aporta contexto justo cuando importa."
            description="El administrador define una zona permitida y Checkio registra la ubicación al momento de cada marcación. No realiza rastreo continuo del empleado."
          />

          <ul className="mt-8 space-y-4">
            {[
              'Radio ajustable según la operación de cada sede.',
              'Validación de ubicación durante la marcación.',
              'Registro consultable junto con la hora oficial.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-cyan-700" size={19} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-sm font-semibold text-cyan-950">Privacidad operativa</p>
            <p className="mt-1 text-sm leading-6 text-cyan-900/80">La ubicación se solicita para registrar el evento de asistencia, no para seguir desplazamientos.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Zona de marcación</p>
              <p className="mt-0.5 text-xs text-slate-500">Configuración visual de referencia</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <ScanLine aria-hidden="true" size={19} />
            </div>
          </div>

          <div className="relative mt-3 h-[360px] overflow-hidden rounded-xl border border-slate-200 bg-[#e9f0ee]">
            <div aria-hidden="true" className="absolute inset-0 opacity-70 [background-image:linear-gradient(28deg,transparent_47%,#cbd5e1_48%,#cbd5e1_49%,transparent_50%),linear-gradient(118deg,transparent_47%,#d6e4dc_48%,#d6e4dc_50%,transparent_51%)] [background-size:96px_96px]" />
            <div aria-hidden="true" className="absolute left-[13%] top-[18%] h-px w-[70%] rotate-12 bg-white/90 shadow-[0_0_0_5px_rgba(255,255,255,0.5)]" />
            <div aria-hidden="true" className="absolute left-[18%] top-[66%] h-px w-[72%] -rotate-8 bg-white/90 shadow-[0_0_0_5px_rgba(255,255,255,0.5)]" />

            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-500 bg-indigo-500/10 shadow-[0_0_0_18px_rgba(79,70,229,0.05)]">
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-white shadow-xl">
                  <MapPin aria-hidden="true" size={22} />
                </div>
                <span className="mt-2 whitespace-nowrap rounded-md bg-slate-950 px-2.5 py-1.5 text-[11px] font-semibold text-white">Sede configurada</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-white/80 bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">
              <Crosshair aria-hidden="true" className="text-cyan-700" size={16} />
              Radio ajustable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
