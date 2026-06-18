import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#fcfbf7] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm sm:p-12">
        <Link to="/landing" className="mb-8 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la página principal
        </Link>
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">Términos de Servicio</h1>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p>
            Al utilizar Checkio, usted y su organización aceptan estos términos de servicio.
            Checkio es una plataforma SaaS B2B diseñada para facilitar el registro de asistencia mediante geolocalización.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Uso del Servicio</h2>
          <p>
            El cliente se compromete a usar Checkio conforme a la legislación laboral aplicable en su jurisdicción.
            El cliente es el único responsable de asegurar el consentimiento de sus empleados respecto a las políticas de asistencia y ubicación.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Precisión de la Geolocalización</h2>
          <p>
            Checkio utiliza las APIs de geolocalización de los navegadores y dispositivos de los usuarios finales. 
            La precisión depende del hardware del usuario y de las condiciones del entorno (ej. interiores, clima).
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Disponibilidad y Soporte</h2>
          <p>
            Nos esforzamos por mantener la máxima disponibilidad del servicio, sin embargo, Checkio se provee "tal cual" sin garantías explícitas de tiempo de actividad ininterrumpido.
          </p>
        </div>
      </div>
    </div>
  );
}
