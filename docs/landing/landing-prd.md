# Checkio - Product Requirements Document (PRD) de la Landing Page

## 1. Objetivo de la landing
Convertir visitantes (B2B) en leads o usuarios activos. Su propósito comercial es demostrar que Checkio reemplaza los antiguos y costosos biométricos físicos por una solución 100% digital, móvil, precisa (basada en geolocalización) y auditable.

## 2. Audiencia objetivo
- Dueños de negocios y gerentes de Pymes.
- Supervisores de operaciones y responsables de recursos humanos.
- Empresas en Perú (y LATAM) con trabajadores en oficina o trabajo de campo que requieren asegurar que las marcaciones se hagan en el lugar y hora correctos.

## 3. Propuesta de valor
"Control de asistencia geolocalizado en tiempo real. Rápido, 100% digital y sin necesidad de comprar hardware costoso."

## 4. Claims permitidos (Features verificadas visualmente)
- **Control territorial:** "Geocercas virtuales ajustables por sede."
- **Hora real protegida:** "Hora oficial verificada directamente desde nuestros servidores para evitar alteraciones en el teléfono."
- **Exportación en un clic:** "Plantillas de nómina XLSX automatizadas, incluyendo cálculo de horas extras."
- **Autogestión de empleados:** "Solicitudes de corrección directly en la app con un flujo de aprobación para RRHH."

## 5. Claims prohibidos (Riesgos comerciales)
- "A prueba de fraude" o "Antifraude total" (los sistemas operativos pueden sufrir spoofing de GPS nativo; es mejor usar "Alta fiabilidad" o "Restricción por geocerca").
- "Monitoreo 24/7" (Checkio no rastrea continuamente al usuario, solo registra lat/lng al momento exacto de la marcación. Hablar de rastreo continuo generaría rechazo legal/laboral).

## 6. Estructura de secciones
1. **Header**: Logo, links (Solución, Beneficios, Planes) y CTA "Ingresar" (redirige al login `/`).
2. **Hero**: Headline fuerte ("La evolución del control de asistencia"), Subheadline, 2 CTAs, y el mockup del celular con el reloj del empleado.
3. **Features Principales (La solución)**: 3 columnas o grid mostrando: Geolocalización, Reportes Excel, y Cero Hardware.
4. **Roles (El producto en acción)**: 
   - Visión del Administrador (Dashboard, Planillas, Correcciones).
   - Visión del Empleado (Reloj simple, Historial transparente).
5. **Geocerca y Seguridad**: Sección dedicada a explicar cómo los administradores configuran el radio permitido en el mapa.
6. **Casos de Uso**: "Perfecto para: Oficinas, Trabajo remoto, Equipos de construcción, etc."
7. **Pricing / Demo**: Llamado a la acción para contactar a ventas o iniciar prueba gratuita.
8. **Footer**: Links legales y de soporte.

## 7. Assets requeridos
Se utilizarán los screenshots finales planificados:
- `landing_hero_employee_mobile.png` (Hero section).
- `landing_admin_dashboard.png` (Contexto general).
- `landing_admin_geofence.png` (Sección seguridad/ubicación).
- `landing_admin_corrections.png` (Sección ahorro de tiempo).
- `landing_admin_employees.png` (Sección control jerárquico).

## 8. Arquitectura frontend propuesta
La landing vivirá dentro de la actual SPA de React + Vite en una ruta dedicada `/landing`, para permitir su despliegue inmediato sin crear un repositorio secundario.

**Directorio propuesto**:
```
frontend/src/
  pages/
    Landing.tsx
  components/landing/
    Hero.tsx
    FeaturesSection.tsx
    RolesSection.tsx
    GeofenceSection.tsx
    CtaSection.tsx
    Footer.tsx
```

## 9. Archivos a crear/modificar
- **Crear**: Todos los archivos `.tsx` descritos en la arquitectura en `src/components/landing/` y `src/pages/Landing.tsx`.
- **Modificar**: `src/App.tsx` para agregar la nueva ruta pública:
  ```tsx
  <Route path="/landing" element={<Landing />} />
  ```
  *(El root `/` seguirá siendo el Login para no romper el flujo actual de los usuarios ya activos).*

## 10. Criterios de aceptación
- [ ] La ruta `/landing` es accesible públicamente sin token de sesión.
- [ ] Todo el diseño está implementado en TailwindCSS respetando los colores de la marca (Indigo/Azul corporativo).
- [ ] Todos los botones de "Ingresar" redirigen a `/`.
- [ ] La página tiene *responsive design* garantizado (Mobile, Tablet, Desktop).
- [ ] Ningún dato expuesto luce como texto de prueba ("QA") ni usa lenguaje técnico en el copy.

## 11. Plan de implementación por fases
- **Fase 1: Enrutamiento y Estructura.** Crear carpetas, archivos y enlazar la nueva ruta pública en el Router principal.
- **Fase 2: Maquetación de UI (sin assets).** Construir el esqueleto de TailwindCSS utilizando placeholders grises para las imágenes.
- **Fase 3: Integración de Copy y Assets.** Reemplazar placeholders por los screenshots `.png` capturados localmente, y pegar los textos de marketing definitivos.
- **Fase 4: QA de Responsive y Enlaces.** Ajustar padding y layouts para vista móvil y asegurar que los links al login funcionen.

## 12. Riesgos y mitigaciones
- **Riesgo:** Conflicto de ruteo si el `useEffect` en `App.tsx` intenta forzar el login al visitar `/landing`.
  **Mitigación:** Asegurarse de que `/landing` esté completamente excluido de las validaciones de sesión (no usar el guard `<Navigate>` que requiere user para esta ruta específica).
- **Riesgo:** Peso y carga lenta debido a múltiples imágenes de alta resolución.
  **Mitigación:** Tratar todos los screenshots en formato `.webp` y utilizar atributos `loading="lazy"` para las imágenes debajo del pliegue.
