# Entrega de Vainelú · 0.1.0

Fecha: 7 de noviembre de 2026. Proyecto nuevo en `/workspace/Vainelu_Codex`, creado sobre el paquete documental recibido, sin un repositorio de aplicación previo. No se ha publicado ni habilitado ninguna venta.

## Arranque y revisión

```bash
cd /workspace/Vainelu_Codex
npm ci
npm run dev
```

Abrir http://localhost:3000 y http://localhost:3000/admin. Para la compilación optimizada: `npm run build` y `npm start`. El servidor de revisión se ha dejado ejecutando la compilación optimizada en el puerto 3000, en **modo demo**.

Node 24.22.1; Next.js 16.4.5; React 19.3.1; TypeScript 5.9.3; Luxon 3.7.2; Supabase JS 2.119.0; Stripe SDK 23.1.0 (API predeterminada 2026-10-28.endive); Playwright 1.65.0. Dependencias fijadas en package-lock.json. Se usa CSS propio, sin Tailwind. Las versiones efectivamente instaladas están en [evidence/versions.txt](../evidence/versions.txt).

## Código y experiencia demo

Se implementaron portada, navegación adaptable, filtros y estado vacío, fichas con tres tamaños, precio por cantidad, mensaje limitado con vista previa, cesta con edición/eliminación y recuperación al recargar, fecha y franja de recogida simulada, formulario ficticio de invitado, confirmación explícita de simulación y consulta con enlace/token en ese navegador. La API recalcula los importes en céntimos y valida opciones y fechas; no acepta el precio enviado por el cliente. Los presupuestos se guardan aparte y no crean pedidos ni reservas.

La demo guarda datos en localStorage, sin servicios ni comunicaciones externas. La capacidad local no es una reserva compartida ni garantiza concurrencia entre pestañas. El panel permite cambiar estados, consultar solicitudes y cerrar fechas en el navegador. Las modificaciones de catálogo son borradores locales, sin publicación; el catálogo canónico demo se modifica en el archivo de configuración. Las confirmaciones no acreditan un cobro.

## Fidelidad visual y recursos

Se inspeccionó la referencia antes de implementar y se revisaron las tres vistas contra ella. Se conservan el fondo crema, texto cacao, botones caramelo, marca Vainelú, titular en dos líneas, foto protagonista a la derecha en escritorio, pasos, filtros y tarjetas horizontales. Se omiten las anotaciones de la lámina. Se añade un aviso propio de demostración.

Capturas de viewport, tomadas sin zoom sobre la compilación optimizada:

- [1536 × 1024](../evidence/home-1536.png)
- [768 × 1024](../evidence/home-768.png)
- [390 × 844](../evidence/home-390.png)

También se incluyen las versiones de página completa con sufijo `-full.png` y una [confirmación demo](../evidence/demo-confirmation.png). A 768 px se apilan las acciones y se muestran dos tarjetas por fila; a 390 px se apila la portada, los pasos y las tarjetas. No existe maqueta móvil independiente. La tipografía es una aproximación con Fredoka y Nunito Sans locales, con licencias OFL. Los controles e iconos son DOM real.

Las imágenes son extracciones limpias de las fotografías de la maqueta aportada, sin rótulos ni botones incrustados. No son fotografías verificadas del negocio. Se mantienen la referencia intacta y [la procedencia de los recursos](../public/ASSETS.md). Hay diferencias de recorte, fondo fotográfico, métricas tipográficas e iconos respecto a la imagen generada; no se declara igualdad de píxeles ni aprobación nueva del propietario.

## Persistencia y pagos: preparación separada

| Componente | Código disponible | Comprobación real |
| --- | --- | --- |
| Persistencia demo | Navegador local | Recarga, edición, presupuestos y consulta probados |
| PostgreSQL | Migración aplicada en PostgreSQL 17.11 local | Transacciones y dos conexiones concurrentes verificadas |
| Supabase | Tablas, RLS y funciones preparadas | Proyecto, claves, JWT y Storage reales no configurados |
| Administración | Panel demo y helper de autorización de servidor | Login y mutaciones conectadas con auditoría pendientes |
| Capacidad | Bloqueo del día y reserva en una transacción SQL | Último cupo probado localmente; dos instancias web contra Supabase pendientes |
| Pago | Adaptador Checkout test y endpoint de eventos | No se crearon sesiones ni se completó un checkout externo |
| Eventos | Firma sobre cuerpo original, recuperación de sesión y transacción SQL | Estados SQL probados; firma y entrega reales no verificadas |
| Reconciliación | Endpoint autenticado, recuperación/expiración de sesiones y retención ante ambigüedad | Sin proveedor conectado ni programación externa; recuperación de sesiones sin vincular pendiente |
| Notificaciones | Bandeja deduplicada en modo registro | Sin envíos; deduplicación SQL probada |
| Producción | Bloqueada | Datos comerciales incompletos y ninguna apertura autorizada |

El esquema SQL conserva instantáneas, hashes de tokens, referencias separadas de credenciales, idempotencia por operación, unicidad de sesiones/eventos y capacidad que sigue consumiéndose mientras permanezca retenida. Un pago posterior a la liberación queda en revisión; un evento repetido no duplica la notificación ni retrocede un pago confirmado. Las funciones privilegiadas están revocadas a visitantes y usuarios ordinarios.

El endpoint de webhook devuelve error reintentable si no puede persistir el cambio. No se confirma pago desde la URL de retorno. El adaptador solo acepta claves test y no puede activar producción. Estos son mecanismos implementados, no evidencia de una integración terminada.

## Pruebas ejecutadas

- `npm run build`: compilación optimizada correcta, con comprobación TypeScript. [Registro](../evidence/build.txt).
- `npm run typecheck`: correcto. [Registro](../evidence/typecheck.txt).
- `npm test`: seis casos de dominio superados: precio manipulado, variantes/cantidades inválidas, límite exacto de 48 horas, horizonte, cierres, ambos cambios estacionales y bloqueo de modo. [Registro](../evidence/domain-tests.txt).
- `npm run test:db`: migración y nueve grupos de invariantes superados en PostgreSQL 17.11, con esquemas locales sustitutos de Auth y Storage. Incluye dos conexiones simultáneas al último cupo, reintento y conflicto de idempotencia, token inválido, importes de pago incompatibles, eventos repetidos, conservación de instantáneas, liberación repetida, pago tardío y revocación RLS. [Registro](../evidence/database-tests.txt). No equivale a Supabase conectado ni a eventos firmados del proveedor.
- `npm run test:e2e`: seis pruebas de Chromium sobre la compilación optimizada: capturas y ausencia de desbordamiento en tres tamaños; edición y persistencia de cesta; consulta demo con token alterado; presupuesto independiente; API que recalcula, rechaza origen ajeno y fecha pasada; líneas distintas, eliminación y cierre de fecha; endpoints conectados cerrados sin configuración. [Registro](../evidence/browser-tests.txt) y [resultado estructurado](../evidence/browser-results.json).
- Arranque separado con `APP_MODE=test` en puerto 3001: la interfaz muestra bloqueo y la API demo devuelve 503, sin alternativa silenciosa. [Registro](../evidence/mode-test.txt).

La matriz original incluye escenarios más amplios que estos ensayos. Se mantienen NO EJECUTADO o BLOQUEADO cuando no se completó el caso entero; se añaden filas específicas para los resultados locales acreditados. No se ha realizado una auditoría completa de accesibilidad ni la prueba de ampliación de texto, la de archivos o la de devolución.

## Bloqueos y trabajo restante

1. No hay credenciales de un proyecto Supabase de pruebas ni de un sandbox Stripe en el entorno. El conector Stripe disponible devuelve que requiere reautenticación. No se han creado cuentas, contratado servicios ni solicitado secretos por chat.
2. Antes de conectar test faltan la unión del catálogo persistido a la interfaz, la API pública de cotización/creación/consulta y su sesión de invitado, login administrativo, mutaciones autorizadas con auditoría y control de versión, gestión de archivos y devoluciones, y límites de frecuencia compartidos. Los adaptadores y la migración sirven como base; introducir credenciales no completa estas piezas por sí solo. [Procedimiento y límites](../supabase/README.md).
3. El checkout externo exige prueba manual independiente en sandbox. La firma, reintentos reales, pérdida de eventos, expiración y reconciliación se verificarán contra los servicios. No se ha usado un webhook simulado para afirmar ese éxito.
4. Faltan datos comerciales verificados, ingredientes y alérgenos, fotos propias, identidad, fiscalidad, condiciones, privacidad, contacto, recepción y agenda del negocio. `config/business.example.json` permanece sin inventarlos. No hay venta real, reparto ni comunicaciones activas.

## Estado

Código creado y demo ejecutable y probada: **sí**, con los límites locales indicados. Esquema y mecanismos SQL probados localmente: **sí**. Integración compartida de pruebas terminada: **no**. Checkout externo verificado: **no**. Producción lista: **no**. Publicación o apertura real: **no solicitada ni realizada**.
