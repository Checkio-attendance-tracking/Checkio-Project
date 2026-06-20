import { useState } from 'react';
import { Plus } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: '¿Qué datos registra Checkio?',
    answer: 'Checkio puede registrar datos de asistencia, hora, ubicación puntual al marcar, IP, navegador/dispositivo y solicitudes de corrección. La ubicación no se rastrea de forma continua.',
  },
  {
    question: '¿Checkio rastrea la ubicación todo el tiempo?',
    answer: 'No. Checkio solo captura la ubicación exacta en el momento en que el empleado presiona el botón de marcar asistencia. No realizamos seguimiento en segundo plano ni fuera de su horario laboral.',
  },
  {
    question: '¿El empleado necesita instalar una app?',
    answer: 'No es necesario. Checkio funciona perfectamente desde el navegador web del celular (Safari, Chrome, etc.). Sin embargo, pueden agregar un acceso directo a su pantalla de inicio para una experiencia como app nativa.',
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
    answer: 'Checkio reduce drásticamente las marcaciones fuera del sitio al validar la ubicación mediante GPS. Aunque ninguna tecnología es 100% infalible, la combinación de geocerca, auditoría y seguridad previene la inmensa mayoría de las irregularidades sin necesidad de hardware físico.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Preguntas frecuentes"
          description="Todo lo que necesitas saber sobre el funcionamiento, privacidad y seguridad de Checkio."
          align="center"
        />

        <div className="mx-auto mt-16 max-w-3xl divide-y divide-slate-200 border-t border-slate-200">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="py-6">
                <button
                  onClick={() => toggleOpen(index)}
                  className="group flex w-full items-center justify-between text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={`text-lg font-semibold tracking-tight transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                    {faq.question}
                  </span>
                  <span className="ml-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <Plus className={`h-5 w-5 ${isOpen ? 'text-indigo-600' : 'text-slate-500'}`} aria-hidden="true" strokeWidth={2} />
                    </motion.div>
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 pr-12 pb-2">
                        <p className="text-base leading-relaxed text-slate-600">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
