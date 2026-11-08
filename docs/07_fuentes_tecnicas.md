# Fuentes técnicas y criterios de uso

Consulta de referencia: **7 de noviembre de 2026**. Estas fuentes oficiales respaldan los mecanismos técnicos citados. La arquitectura y los parámetros comerciales del paquete son propuestas del proyecto. Codex debe volver a contrastar las instrucciones con las versiones que finalmente instale y registrar esas versiones.

No se han investigado marcas, dominios ni requisitos legales particulares del negocio. La documentación técnica no acredita disponibilidad del nombre Vainelú ni revisión legal de una tienda.

| Fuente oficial | Aplicación concreta en este paquete |
| --- | --- |
| [Next.js: instalación](https://nextjs.org/docs/app/getting-started/installation) y [App Router](https://nextjs.org/docs/app) | Base propuesta para un proyecto nuevo; comprobar requisitos y versiones al implementar |
| [Next.js: despliegue](https://nextjs.org/docs/app/getting-started/deploying) | Diferenciar la interfaz estática de las funciones que necesitan servidor |
| [Supabase: claves de API](https://supabase.com/docs/guides/getting-started/api-keys) | Separar clave publicable y clave secreta; la clave privilegiada no sustituye la autorización del solicitante |
| [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) | Limitar lecturas y escrituras de cada identidad, con datos privados protegidos |
| [Stripe: confirmación de pedidos](https://docs.stripe.com/checkout/fulfillment) | Confirmar el pago en servidor y hacer el procesamiento idempotente; la página de retorno no basta |
| [Stripe: webhooks](https://docs.stripe.com/webhooks) | Verificación de firma y cuerpo original, recepción duradera y tratamiento de reintentos |
| [Stripe: solicitudes idempotentes](https://docs.stripe.com/api/idempotent_requests) | Reintentos controlados de operaciones; complementar con restricciones propias en la base de datos |
| [Stripe: pruebas automatizadas](https://docs.stripe.com/automated-testing) | Probar nuestra aplicación y backend; comprobar aparte el checkout alojado en sandbox |
| [W3C: contraste mínimo WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Objetivo 4,5:1 para texto normal y 3:1 para texto grande |
| [Playwright: comparación visual](https://playwright.dev/docs/test-snapshots) | Crear una base de capturas del DOM revisada y detectar regresiones en un entorno controlado |

## Qué no se deriva de las fuentes

El nombre, la imagen aprobada y el color crema proceden de la conversación. La elección de proveedores, las 48 horas, las 80 raciones, el horizonte de 30 fechas, las variantes y los precios de ejemplo son decisiones de implementación o demostración, no recomendaciones comerciales de esos proveedores.

La tipografía y los códigos de color son aproximaciones propuestas para reproducir una maqueta generada. La adaptación móvil necesita revisión de la implementación porque no existe una maqueta móvil independiente aprobada.

Los enlaces son referencias de consulta. No copiar ejemplos de versiones preliminares o flujos distintos sin comprobar que corresponden al SDK, API y modo de pago utilizados.
