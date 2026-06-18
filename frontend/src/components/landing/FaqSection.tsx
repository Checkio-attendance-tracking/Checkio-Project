import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const faqs = [
  {
    question: '¿Checkio rastrea la ubicación todo el tiempo?',
    answer: 'No. Checkio solo captura la ubicación exacta en el momento en que el empleado presiona el botón de marcar asistencia. No realizamos seguimiento en segundo plano ni fuera de su horario.',
  },
  {
    question: '¿El empleado necesita instalar una app?',
    answer: 'No es necesario. Checkio funciona perfectamente desde el navegador web del celular (Safari, Chrome, etc.). Sin embargo, pueden agregar un acceso directo a su pantalla de inicio para una experiencia como app.',
  },
  {
    question: '¿Qué pasa si un empleado olvida marcar?',
    answer: 'El sistema registrará la ausencia temporal, pero el empleado puede crear una solicitud de corrección manual directamente desde su panel. El administrador de RRHH recibirá la solicitud, la revisará y podrá aprobarla para corregir el historial.',
  },
  {
    question: '¿Se puede usar en varias sedes?',
    answer: 'Sí. Puedes crear múltiples empresas y, dentro de cada una, configurar múltiples zonas geolocalizadas (geocercas). Los empleados podrán marcar su ingreso siempre que estén dentro del radio de la sede asignada.',
  },
  {
    question: '¿Checkio elimina completamente el fraude?',
    answer: 'Checkio reduce drásticamente las marcaciones fuera del sitio al validar la ubicación mediante GPS. Aunque ninguna tecnología es 100% infalible, la combinación de geocerca, auditoría y seguridad previene la inmensa mayoría de las irregularidades sin hardware costoso.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="FAQ"
        title="Preguntas frecuentes"
        description="Todo lo que necesitas saber sobre el funcionamiento, privacidad y seguridad de Checkio."
        align="center"
      />

      <div className="mx-auto mt-16 max-w-3xl divide-y divide-slate-200">
        {faqs.map((faq, index) => (
          <div key={index} className="py-6">
            <button
              onClick={() => toggleOpen(index)}
              className="flex w-full items-center justify-between text-left focus:outline-none"
              aria-expanded={openIndex === index}
            >
              <span className="text-lg font-semibold text-slate-900">{faq.question}</span>
              <span className="ml-6 flex h-7 items-center">
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" aria-hidden="true" />
                )}
              </span>
            </button>
            {openIndex === index && (
              <div className="mt-4 pr-12">
                <p className="text-base text-slate-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
