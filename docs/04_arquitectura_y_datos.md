# Arquitectura propuesta para Vainelú

## Objetivo y decisiones de partida

Construir una tienda web para un único negocio de tartas, con compra como invitado y un panel privado para su responsable. Esta arquitectura es una propuesta de implementación para Codex. El nombre Vainelú y la referencia visual crema están confirmados; los proveedores, las reglas comerciales y los datos reales del negocio todavía deben configurarse.

Si no existe un repositorio para este proyecto, crear uno independiente. No reutilizar repositorios, usuarios ni datos de otros proyectos del propietario. Si se recibe un repositorio compatible de Vainelú, inspeccionar primero su estructura e instrucciones y conservar las decisiones que ya funcionen.

La propuesta para un proyecto nuevo es Next.js con App Router, React, TypeScript y Tailwind; Supabase para PostgreSQL, autenticación administrativa y almacenamiento de imágenes; y Stripe Checkout alojado para pagos de prueba. Seleccionar versiones estables compatibles al comenzar, consultar su documentación vigente y fijarlas mediante el archivo de bloqueo. No instalar versiones mayores arbitrarias en un proyecto existente.

## Límites entre componentes

La interfaz presenta productos, recoge opciones y mantiene el carrito. El servidor valida las opciones, calcula el precio, comprueba las fechas y crea el pedido. PostgreSQL conserva el estado canónico. El navegador nunca decide que un pedido está pagado ni concede permisos administrativos.

Separar el código de catálogo, precios, disponibilidad, pedidos, pagos, archivos y notificaciones. Encapsular cada integración externa detrás de una interfaz pequeña que permita sustituirla por un adaptador de demostración. Mantener las reglas de negocio en funciones de dominio reutilizables; las páginas y los manejadores HTTP no deben contener cálculos alternativos del mismo total.

Organizar el repositorio con rutas públicas, rutas administrativas, componentes de interfaz, módulos de dominio, adaptadores de servicios, migraciones, datos de demostración y pruebas. La distribución de carpetas debe facilitar estas responsabilidades sin añadir microservicios innecesarios.

## Tres modos de funcionamiento

| Modo | Datos y servicios | Comportamiento exigido |
| --- | --- | --- |
| `demo` | Catálogo ficticio y adaptadores locales; sin comunicaciones externas | Permitir recorrer la experiencia y simular resultados. Identificar cada confirmación como demostración. Usar exclusivamente datos de contacto ficticios. No afirmar persistencia compartida si el adaptador no la ofrece. |
| `test` | Proyecto de pruebas de Supabase y entorno de prueba de Stripe | Conservar pedidos de prueba compartidos entre sesiones, ejecutar controles reales de acceso y verificar los pagos de prueba mediante webhooks. |
| `production` | Configuración real separada | Habilitar sólo después de completar la configuración del negocio, la verificación técnica y la decisión de lanzamiento del propietario. |

El modo se define en configuración controlada por el servidor, nunca mediante un parámetro del cliente. Las credenciales de prueba y producción no se mezclan. Un fallo de integración debe mostrarse como error recuperable; no se permite convertirlo silenciosamente en una venta simulada. La documentación entregada no autoriza a activar cobros o notificaciones reales.

## Identidad y acceso

El visitante puede consultar el catálogo y comprar sin crear una cuenta. Su carrito puede persistir localmente para mejorar la experiencia, pero sólo contiene una selección provisional. Los pedidos, los pagos y la capacidad pertenecen al servidor.

El personal utiliza Supabase Auth y una tabla de miembros autorizados. No crear un registro público que permita autoconcederse el papel de administrador. Para el primer propietario, documentar un procedimiento controlado de alta. Verificar la identidad en el servidor con el mecanismo recomendado por la versión del SDK y comprobar después la pertenencia administrativa; ocultar un botón no constituye autorización.

Activar políticas RLS con acceso denegado por defecto. La lectura pública se limita al catálogo publicado. Los visitantes no tienen acceso directo a las tablas de pedidos, pagos, reservas, contactos o auditoría. Las operaciones administrativas requieren el papel correspondiente. No confiar en campos de perfil que el usuario pueda editar para asignar privilegios.

Preferir `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para el cliente y `SUPABASE_SECRET_KEY` exclusivamente en el servidor, según la configuración vigente de Supabase. No elegir claves heredadas como valor predeterminado de una instalación nueva. Una clave secreta no sustituye la autorización del solicitante: las rutas privilegiadas deben comprobarla antes de ejecutar operaciones. No incluir secretos en el repositorio, respuestas, capturas ni registros.

## Modelo lógico de datos

Usar identificadores internos no secuenciales, claves foráneas, restricciones y marcas temporales. Incorporar los campos que necesite la implementación sin duplicar fuentes de verdad.

| Entidad | Campos y relaciones principales |
| --- | --- |
| `business_settings` | Idioma, moneda, zona horaria, modalidades de entrega, reglas comerciales y estado de configuración. Los datos reales pendientes permanecen vacíos. |
| `staff_members` | Usuario autenticado, papel, estado y fechas de alta o revocación. |
| `products` | Nombre, slug, descripción, categoría, publicación, imagen, versión comercial y validación de información alimentaria. |
| `product_variants` | Producto, tamaño, raciones, precio en céntimos, disponibilidad y opciones permitidas. |
| `product_options` | Tipo de personalización, valores admitidos, compatibilidades y suplemento en céntimos. |
| `service_days` | Fecha local, abierto o cerrado, capacidad en raciones y ajustes del responsable. |
| `fulfillment_slots` | Franja opcional de recogida o entrega, vinculada a un día de servicio; límites adicionales cuando se configuren. |
| `orders` | Referencia pública, contacto, entrega, fecha local, totales, moneda, estado comercial y versiones aplicadas. |
| `order_items` | Pedido y copia inmutable de producto, variante, opciones, raciones, cantidades y precios aceptados. |
| `capacity_reservations` | Pedido, día, raciones reservadas, estado y vencimiento. |
| `payment_attempts` | Pedido, identificador de operación, proveedor, sesión, importe esperado, moneda, modo y estado. |
| `payment_events` | Identificador único del evento externo, objeto asociado, resultado de procesamiento y fechas. |
| `refunds` | Pago, identificador externo único, importe, motivo, solicitante y estado confirmado. |
| `notification_outbox` | Evento de negocio, destinatario, plantilla, clave de deduplicación, reintentos y resultado. |
| `audit_log` | Actor, acción, objeto, cambios necesarios y fecha, sin credenciales ni datos de tarjeta. |

Si se incorporan fotografías de referencia del cliente, guardarlas en una entidad y un espacio privados vinculados al pedido; no mezclarlas con las imágenes públicas del catálogo. Los encargos que necesitan presupuesto se guardan en una entidad quote_requests con contacto, fecha solicitada, raciones orientativas, descripción, archivos privados y estado de atención. No entran en el cobro automático ni reservan capacidad con un precio inventado.

## Precios y contenido del pedido

Representar los importes con enteros en la unidad menor de la moneda. En EUR, 32 euros se representan como `3200`. El servidor lee los precios vigentes, comprueba cantidades y compatibilidades y calcula subtotal, suplementos, entrega e impuestos según la configuración aprobada.

El cliente envía identificadores y elecciones, nunca un total aceptado como autoridad. Si una opción desaparece o cambia el precio desde que se añadió al carrito, devolver la nueva propuesta y pedir que el comprador la revise antes de continuar. No modificar silenciosamente lo que había aceptado.

Al iniciar el pago, guardar una copia de los nombres, opciones, cantidades, raciones, precios y condiciones que componen el pedido. Un cambio posterior del catálogo no modifica ventas anteriores. El modelo fiscal, los gastos de entrega y la forma de mostrar impuestos están pendientes de definición comercial; no deducirlos del mockup.

Los importes de 32, 38 y 42 euros presentes en la referencia son ejemplos. Tampoco constituyen datos reales las raciones, los sabores adicionales o las condiciones de entrega introducidos para probar. La información de ingredientes y alérgenos debe ser validada por el negocio antes de habilitar un producto para compra real.

## Fechas y capacidad

La propuesta inicial usa `es-ES`, EUR y `Europe/Madrid`, todos configurables. Guardar los instantes de auditoría en UTC y tratar la fecha de elaboración o entrega como una fecha del calendario local del negocio. No desplazarla por la zona del navegador. Resolver las franjas horarias con una biblioteca que contemple los cambios de hora. En demo, la antelación es de 48 horas transcurridas desde ahora del servidor hasta el inicio de la franja, no dos días de calendario; igualdad en el límite es válida. El horizonte comprende 30 fechas locales contando hoy, offsets 0 a 29. La capacidad inicial es 80 raciones por fecha. Estos valores son configurables y no compromisos comerciales.

Calcular capacidad en una unidad explícita: raciones por fecha. Para una línea, consumo igual a cantidad multiplicada por raciones de la variante. Los días cerrados, la antelación mínima, los horarios y los límites deben provenir de configuración, no de textos de portada. Si falta un dato necesario en producción, impedir la compra afectada y explicar el motivo sin prometer una entrega.

Reservar capacidad mediante una transacción de base de datos que bloquee el día y, cuando proceda, la franja. Dentro de esa misma transacción, contabilizar reservas retenidas y pedidos comprometidos, validar el límite y registrar la nueva reserva. Las reservas pendientes de reconciliación siguen consumiendo capacidad aunque su fecha de vencimiento haya pasado. No usar una consulta seguida de una escritura independiente ni un bloqueo en memoria del proceso web.

El vencimiento de una reserva debe coordinarse con la duración admitida por la sesión de pago. La retención propuesta es de 30 minutos, alineada con el `expires_at` aceptado por Stripe. El trabajo de recuperación consulta la sesión y, si sigue abierta y corresponde cerrarla, solicita su expiración al proveedor antes de liberar capacidad en una transacción. No liberar una reserva sólo por el reloj local mientras la sesión todavía pueda pagarse. Ante una respuesta ambigua, conservarla y reconciliar. Liberar y comprometer capacidad son operaciones idempotentes. Cada pedido consume capacidad una sola vez: pasar de retenida a comprometida no vuelve a sumar sus raciones. Elegir una única consulta canónica sobre reservas o pedidos que evite contabilizar a la vez la reserva comprometida y el mismo pedido pagado.

## Creación de pedido y sesión de pago

1. El visitante solicita una cotización con su selección, modalidad y fecha. El servidor devuelve un resumen calculado y una revisión identificable.
2. Al continuar, el servidor valida nuevamente la selección y crea el pedido pendiente junto con la reserva de capacidad en una transacción.
3. Registrar un intento de pago con una clave única de operación. Para una misma clave y contenido, devolver el resultado existente; si cambia el contenido, rechazar la reutilización de la clave.
4. Crear la sesión del proveedor desde el servidor usando una clave de idempotencia estable, el importe esperado, el identificador interno y el entorno. Esta llamada externa no puede formar una transacción única con PostgreSQL.
5. Guardar el identificador de sesión y su vencimiento. Si hay un timeout ambiguo, reconciliar con el proveedor antes de repetir o liberar la reserva. Un fallo definitivo deja una transición recuperable y permite volver al carrito.
6. Redirigir al checkout alojado. Al regresar, consultar el estado del pedido; la página de éxito del navegador no concede el estado pagado.

Impedir dos intentos activos para un mismo pedido mediante una restricción en base de datos. Deshabilitar el botón mientras se envía mejora la interfaz, pero no sustituye la idempotencia frente a dobles clics, recargas o varias instancias del servidor.

## Confirmación de pagos y recuperación

La primera integración debe limitarse a tarjeta y a los monederos basados en tarjeta que el proveedor ofrezca y las pruebas cubran. No habilitar automáticamente métodos de pago diferidos. Si posteriormente se activan, ampliar el flujo antes de anunciarlos.

El endpoint de webhook verifica la firma sobre el cuerpo original, valida el entorno y registra el identificador externo con restricción de unicidad. Relaciona el evento con una sesión previamente creada por el servidor y comprueba el pedido, el importe, la moneda y el estado real del pago. Un evento de sesión completada sólo marca pago cuando su estado indica que está pagado; cualquier discrepancia requiere revisión.

Procesar la actualización del pago, la transición del pedido, la capacidad y la inserción en la bandeja de notificaciones de forma atómica. Si el procesamiento falla, conservar un estado reintentable. Marcar un evento como recibido no equivale a marcarlo como aplicado. Responder con éxito al proveedor solo tras conservar de forma duradera el evento y su estado; si no existe un trabajador duradero con reintentos, procesar la transición antes de responder y devolver un error reintentable ante fallo de persistencia. No usar tareas en memoria que puedan desaparecer tras la respuesta. Evitar duplicados tanto por identificador de evento como por objeto de pago, y no permitir que eventos antiguos retrocedan un estado confirmado.

Si llega un pago después de haberse liberado su reserva, registrar pago recibido y pedido pendiente de revisión. Mostrar la incidencia al responsable para resolver fecha, aceptación o devolución. Cualquier recuperación de capacidad requiere la misma validación transaccional. No reactivar automáticamente un pedido cancelado, ocultar el pago ni aceptar una fecha sobreocupada. Un vencimiento horario sin liberación confirmada no elimina la reserva que sigue retenida.

Si se habilitan métodos diferidos, gestionar sus eventos de éxito y fracaso y definir cuánto tiempo pueden retener capacidad. No tratarlos como pagados al salir del checkout. Añadir una reconciliación programable para sesiones sin resolución o eventos que no llegaron; documentar su ejecución sin configurar aquí automatizaciones reales.

## Estados comerciales y financieros

Mantener separados los estados de pedido y pago. Para el pedido: pendiente de pago, confirmado, en preparación, listo, en reparto cuando corresponda, entregado, cancelado y requiere revisión. Para el pago: pendiente, pagado, fallido, parcialmente devuelto y devuelto. Mantener además el estado abierto, completado o expirado de cada sesión de pago. Las simulaciones tienen una marca independiente de demostración.

Para un pedido de catálogo vigente, un pago verificado con reserva todavía retenida compromete la capacidad y confirma automáticamente el pedido y la fecha. No se exige aceptación manual adicional en esta primera versión. Si la reserva ya se liberó, hay datos incompatibles o el pedido fue cancelado, conservar el pago y pasar a requiere revisión; no aplicar la transición normal. Los presupuestos especiales siguen su proceso de aceptación separado.

Una cancelación no implica por sí sola un reembolso. Toda devolución registra motivo, actor, importe y resultado del proveedor; su solicitud y su confirmación son estados diferentes. Validar transiciones administrativas y rechazar actualizaciones concurrentes con una versión del registro. Conservar un historial legible de cambios.

## Consulta y administración

Entregar al comprador acceso acotado a su pedido mediante una sesión de invitado o un token largo aleatorio cuyo hash se conserve en servidor. La referencia visible de pedido no sirve como credencial. No permitir búsquedas mediante número más correo ni enumeración de identificadores. Evitar tokens en registros y aplicar una política de referencias que no los filtre a terceros.

El panel permite editar catálogo y opciones, publicar productos completos, bloquear fechas, ajustar capacidad y gestionar pedidos. Cada operación vuelve a validar permisos y reglas en el servidor. Usar protección adecuada frente a solicitudes cruzadas cuando intervengan cookies, límites de frecuencia y validación de entradas. Los mensajes del cliente se presentan como texto, nunca como HTML ejecutable.

Para imágenes, autorizar la subida antes de aceptarla; validar extensión, tipo detectado, decodificación, dimensiones y tamaño. Proponer JPEG, PNG y WebP y rechazar SVG o documentos ejecutables como imágenes de catálogo. Reprocesar archivos, eliminar metadatos innecesarios y usar nombres generados. Publicar únicamente activos aprobados; proteger los archivos de clientes mediante acceso temporal autorizado.

## Notificaciones y entrega técnica

Las notificaciones son un adaptador opcional conectado a la bandeja de salida, en modo registro por defecto y sin envíos. Insertar el evento junto con la transición de negocio, enviar después sólo cuando el servicio esté configurado y deduplicar cada comunicación. Registrar intentos fallidos y permitir reintentos controlados. En demostración, presentar una simulación explícita; durante esta preparación no enviar mensajes reales ni introducir destinatarios inventados.

Codex debe entregar migraciones reproducibles, datos de ejemplo separados, un archivo de variables sin secretos, instrucciones de arranque y una descripción del modo probado. Los registros deben permitir seguir un pedido y un intento de pago sin exponer datos sensibles. Incluir comprobaciones de salud, configuración y recuperación de eventos pendientes.

Priorizar pruebas de invariantes: manipulación de precio; compra simultánea del último cupo; doble envío; firma inválida; eventos duplicados y desordenados; pago tardío; acceso a pedidos ajenos; revocación administrativa; cambios de hora; y devolución sin duplicados. No declarar una integración terminada porque sus botones funcionan. Informar por separado qué se ejecutó en demostración, qué se verificó contra servicios de prueba y qué permanece pendiente para producción.

## Fuentes técnicas

Consultar [Fuentes técnicas y criterios de uso](07_fuentes_tecnicas.md) y volver a contrastar los mecanismos con las versiones instaladas.
