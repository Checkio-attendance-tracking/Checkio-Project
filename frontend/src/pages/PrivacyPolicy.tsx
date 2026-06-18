import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fcfbf7] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm sm:p-12">
        <Link to="/landing" className="mb-8 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la página principal
        </Link>
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">Política de Privacidad</h1>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p>
            En Checkio, entendemos que la privacidad de los datos es fundamental tanto para las empresas
            como para los empleados. Esta política detalla cómo recopilamos, usamos y protegemos la información.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Datos que registramos</h2>
          <p>
            Checkio registra datos de asistencia (hora de entrada y salida), dirección IP, detalles del
            navegador/dispositivo, y la ubicación geográfica (latitud y longitud) <strong>únicamente en el momento exacto</strong> en que el usuario marca su asistencia.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Uso de la ubicación</h2>
          <p>
            <strong>No realizamos rastreo continuo en segundo plano.</strong> La ubicación capturada se utiliza exclusivamente
            para compararla con la geocerca configurada por el administrador de su empresa y validar la asistencia en el sitio correcto.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Acceso y control</h2>
          <p>
            Los administradores de su empresa (roles de RRHH y Superadmin) tienen acceso a los registros
            para fines de auditoría laboral y control de planillas. Sus datos no son compartidos con terceros con fines de marketing.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Retención de datos</h2>
          <p>
            Conservamos sus datos de marcación y ubicación de acuerdo a los requerimientos legales laborales vigentes y las políticas de retención establecidas por su empleador.
          </p>
        </div>
      </div>
    </div>
  );
}
