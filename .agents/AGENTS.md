# Reglas y Consideraciones de Diseño para Checkio

## 1. Auditoría de Completitud
- Nunca asumas que una refactorización masiva está terminada sin haber auditado manualmente cada uno de los componentes mencionados en el requerimiento original. 
- Revisa componente por componente antes de declarar un "goal" como finalizado.

## 2. Responsividad y "Mobile-First"
- Al usar CSS Grid, evita alturas fijas (e.g. `auto-rows-[280px]`) que puedan causar desbordamientos (cortes) en dispositivos móviles cuando el contenido de texto varía. Prefiere alturas adaptables en móvil (`auto-rows-auto`) y restringe las alturas fijas solo para pantallas más grandes (`md:auto-rows-[280px]`).
- Ten cuidado extremo con `overflow-hidden` combinado con posicionamiento absoluto en móvil; siempre comprueba que la caja delimitadora tenga el aspect ratio y padding correcto para no decapitar o mutilar gráficos flotantes.

## 3. Privacidad y Datos de Prueba (Seed Data)
- **Cero nombres propios:** Nunca utilices nombres que suenen a personas reales (e.g., "Carlos Mendoza", "Ana López") en los mockups de diseño, interfaces demostrativas o seed data público para evitar posibles infracciones de privacidad o conflictos reales.
- Usa en su lugar roles o títulos genéricos (e.g., "Recepcionista", "Jefe de Operaciones", "Analista").

## 4. Roles y Seguridad de la Información
- No expongas en el lado público (Landing Page, marketing, etc.) la existencia de roles estrictamente internos y de mantenimiento (como "Superadmin").
- Limita la explicación de producto únicamente a los roles relevantes para el cliente final (e.g., "Empleado" y "RRHH / Admin").

## 5. Ética en el Diseño Web (Social Proof)
- No diseñes secciones de "Social Proof" (Marquesina de logos, "Empresas que confían en nosotros") si no existen clientes reales de respaldo. Vender información falsa o inflar la tracción del producto va en contra de las políticas éticas del desarrollo de la plataforma.
