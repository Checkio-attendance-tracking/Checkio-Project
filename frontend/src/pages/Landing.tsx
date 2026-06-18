import { CorrectionsSection } from '../components/landing/CorrectionsSection';
import { CtaSection } from '../components/landing/CtaSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { GeofenceSection } from '../components/landing/GeofenceSection';
import { Hero } from '../components/landing/Hero';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LandingNav } from '../components/landing/LandingNav';
import { ProblemSection, SolutionSection } from '../components/landing/ProblemSolution';
import { RolesSection } from '../components/landing/RolesSection';
import { SecuritySection } from '../components/landing/SecuritySection';
import { FaqSection } from '../components/landing/FaqSection';

export function Landing() {
  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#fcfbf7] text-slate-950 antialiased selection:bg-indigo-200 selection:text-indigo-950">
      <LandingNav />
      <main id="contenido-principal">
        <Hero />
        <section id="problema" aria-label="Problemas del control de asistencia">
          <ProblemSection />
        </section>
        <section id="solucion" aria-label="Solución Checkio" className="scroll-mt-18">
          <SolutionSection />
        </section>
        <section id="funcionalidades" aria-label="Funcionalidades" className="scroll-mt-18">
          <FeaturesSection />
        </section>
        <section id="roles" aria-label="Roles del producto" className="scroll-mt-18">
          <RolesSection />
        </section>
        <section id="geocerca" aria-label="Geocerca y trazabilidad" className="scroll-mt-18">
          <GeofenceSection />
        </section>
        <section id="correcciones" aria-label="Correcciones de asistencia" className="scroll-mt-18">
          <CorrectionsSection />
        </section>
        <section id="seguridad" aria-label="Seguridad y privacidad" className="scroll-mt-18">
          <SecuritySection />
        </section>
        <section id="faq" aria-label="Preguntas Frecuentes" className="scroll-mt-18">
          <FaqSection />
        </section>
        <section id="cta" aria-label="Ingresar a Checkio">
          <CtaSection />
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
