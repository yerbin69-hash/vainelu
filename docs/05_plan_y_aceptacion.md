# Plan de ejecución y aceptación de Vainelú

Este plan guía la construcción y comprobación posterior en Codex. La marca **Vainelú** y el diseño crema, caramelo y cacao están confirmados. Las funciones comerciales son propuestas cuyos parámetros requieren configuración del negocio. Este documento no acredita implementación ni pruebas realizadas.

## Referencia y condiciones de aceptación

La imagen aprobada es `referencias/diseno_aprobado_crema.png`: el concepto Pistacho moderno recoloreado a crema. Comparar con ella, respetando las excepciones del documento de diseño para marca definitiva y rótulos de la lámina. Las otras siete propuestas no la sustituyen.

Las capturas requeridas son de **1536 × 1024**, **768 × 1024** y **390 × 844** píxeles, sin zoom artificial. La imagen de escritorio guía las proporciones; las vistas pequeñas deben adaptar la composición para conservar legibilidad y controles utilizables. No reducir la página completa como si fuera una fotografía.

## Secuencia de trabajo

| Fase | Trabajo | Evidencia para cerrar la fase |
|---|---|---|
| 0 | Leer las instrucciones del repositorio, identificar su estado y preparar el proyecto sin sobrescribir trabajo ajeno. Registrar versiones y modos disponibles. | Inventario breve, decisiones técnicas y comandos de arranque reproducibles. |
| 1 | Implementar el sistema visual y la portada con Vainelú, usando la referencia aprobada. | Capturas de las tres anchuras y revisión visual de cabecera, portada, pasos y tarjetas. |
| 2 | Completar catálogo, personalización, carrito y pedido de demostración. | Recorrido local con datos ficticios, estados vacíos y errores; indicación visible de demostración. |
| 3 | Incorporar persistencia de pruebas, autenticación administrativa, disponibilidad y reservas transaccionales. | Pedido recuperable desde otra sesión, pruebas de permisos y concurrencia. |
| 4 | Integrar Stripe en entorno de prueba y procesar eventos verificados. | Evidencia backend de los estados y comprobación manual del checkout externo en sandbox. |
| 5 | Revisar el flujo completo, accesibilidad, recuperación de fallos y configuración operativa. | Matriz cumplimentada, incidencias pendientes y límites de la versión. |

Si hay un bloqueo externo, documentarlo y continuar el trabajo independiente. No darlo por resuelto ni inventar credenciales, datos comerciales o configuración de producción.

## Datos para las pruebas

Usar productos, clientes y direcciones ficticios; los precios de la maqueta no son tarifas aprobadas. Congelar el reloj y declarar `Europe/Madrid`. En demo: 48 horas transcurridas de antelación, 80 raciones por fecha, 30 fechas locales contando hoy (offsets 0 a 29) y retención propuesta de 30 minutos alineada con la sesión del proveedor. Registrar cantidades iniciales. Aislar demostración, prueba persistida y producción. No enviar mensajes ni efectuar cobros reales.

## Matriz de aceptación

Todos los casos parten de **NO EJECUTADO**. Cada resultado necesita las evidencias descritas al final.

| ID | Escenario | Resultado exigido |
|---|---|---|
| VIS01 | Comparar la portada en escritorio con la referencia crema. | Se conserva la jerarquía, tipografía redondeada, fotografía protagonista, botones, pasos y catálogo. Se aplica Vainelú y no reaparece la paleta verde. |
| VIS02 | Abrir las tres resoluciones y ampliar texto. | No hay desbordamiento horizontal, texto cortado ni controles superpuestos. Las imágenes conservan proporción y el carrito permanece accesible. |
| CAT01 | Filtrar catálogo sin coincidencias y abrir un producto no disponible. | Se explica el estado, se puede recuperar el catálogo y no se puede comprar un producto bloqueado. Los enlaces y filtros tienen comportamiento real. |
| CAR01 | Añadir dos unidades y otra distinta; restar, eliminar y recargar. | El distintivo suma unidades, no tipos de producto. Cantidades y totales coinciden; ninguna cantidad es negativa y el carrito se recupera correctamente. |
| CAR02 | Añadir el mismo producto con distintos tamaños o mensajes. | Las configuraciones permanecen separadas y editar una no modifica la otra. El resumen conserva todas las opciones antes de pagar. |
| PRE01 | Alterar importes, opciones o descuentos enviados por el navegador. | El servidor calcula el total con datos vigentes, rechaza opciones inválidas y conserva una instantánea del pedido. Nunca acepta un importe manipulado. |
| FEC01 | Probar justo antes, en y después del límite de encargo; añadir cierres y cambios de horario. | Navegador y servidor aplican la misma regla documentada en la zona del negocio. La validación final impide reservar una fecha que dejó de estar disponible. |
| FEC02 | Repetir el cálculo alrededor de ambos cambios estacionales de hora. | No se desplaza la fecha elegida ni se confunden horas repetidas o inexistentes. Se exigen 48 horas transcurridas hasta el inicio de la franja en la configuración demo, también al cruzar cambios de hora; no se sustituyen por dos días de calendario. |
| CUP01 | Dos sesiones solicitan simultáneamente las últimas ocho raciones libres. | Solo una reserva prospera. El cupo no se supera, tampoco con dos instancias de servidor. La otra sesión recibe una explicación y alternativas. |
| RES01 | Abandonar y dejar caducar una reserva; repetir su liberación. | Se recupera el cupo una sola vez, según la política y el estado real del pago. Existe recuperación de reservas que no cerró el navegador. |
| RED01 | Reintentar la creación tras un corte de red y pulsar pagar dos veces. | La misma operación no crea pedidos, reservas ni sesiones de pago duplicados. Un error no se presenta como confirmación. |
| PAG01 | Visitar directamente la URL de éxito; después probar retorno de cancelación. | La URL no acredita un pago. El estado procede del servidor y del proveedor. Volver por cancelación no convierte en impagado un pedido ya pagado. |
| PAG02 | Enviar eventos firmados, repetidos y desordenados; probar firma inválida y datos incompatibles. | Se validan firma, asociación al pedido, entorno, importe y moneda. Los eventos duplicados no repiten efectos y uno antiguo no hace retroceder el estado. |
| PAG03 | Recibir éxito tardío después de liberar la reserva; incluir fallo asíncrono solo si se habilita posteriormente ese método. | El pago válido se conserva, el pedido requiere revisión y no se confirma una fecha sin capacidad. No se reactiva automáticamente un cancelado ni se duplican liberaciones o devoluciones. |
| ORD01 | Consultar pedidos cambiando identificadores, referencias o credenciales de invitado. | Un visitante no ve pedidos ajenos. Una referencia legible no actúa como autorización; las respuestas no revelan datos personales por enumeración. |
| ADM01 | Acceder a administración y a tablas desde usuario anónimo, usuario ordinario y administrador. | Los permisos y RLS bloquean lecturas y escrituras indebidas. Las claves secretas no aparecen en el cliente, sus archivos públicos ni respuestas. |
| CON01 | Introducir marcado activo en mensajes y subir archivos disfrazados, sobredimensionados o no admitidos. | El texto se muestra como texto; el archivo se valida en servidor. No se ejecuta contenido ni se publica un recurso rechazado. |
| ACC01 | Completar compra con teclado y revisar formularios, errores y diálogos. | Foco visible y orden coherente, etiquetas asociadas, errores comprensibles, contraste conforme al diseño y retorno correcto del foco al cerrar un diálogo. |
| OPE01 | Editar un producto ya comprado, actualizar un pedido y reintentar una notificación. | El pedido conserva sus datos históricos; los cambios administrativos quedan registrados y el reintento no duplica mensajes ni altera el pago. |
| MOD01 | Arrancar cada modo y provocar una dependencia ausente. | La demostración no realiza transacciones externas. Prueba y producción no comparten datos o secretos. Una configuración incompleta muestra un bloqueo concreto. |

## Estrategia de verificación

Priorizar pruebas integradas de importes, autorizaciones, disponibilidad, idempotencia y estados. Usar pruebas de navegador para la aplicación propia, sus formularios y su adaptación visual. Evitar pruebas que repliquen constantes o implementación.

No exigir que Playwright automatice la interfaz alojada de Stripe. Verificar automáticamente nuestro backend y el tratamiento de eventos mediante herramientas o fixtures de prueba oficiales; comprobar el checkout externo manualmente en sandbox, con medios de pago de prueba. Registrar esa comprobación por separado. Un webhook simulado no demuestra que se completó el flujo externo.

Comparar capturas con la referencia; las diferencias justificadas para móvil se documentan. Una compilación correcta no acredita fidelidad visual, un pago correcto ni autorización segura. No incluir datos personales, claves o información de tarjetas en las evidencias.

## Registro de resultados y entrega

Para cada caso registrar: identificador, estado, versión o commit, entorno, fecha y hora, configuración y datos iniciales, pasos, resultado esperado, resultado observado y evidencia. Los estados permitidos son **NO EJECUTADO**, **BLOQUEADO**, **FALLA** y **SUPERADO**. Usar SUPERADO únicamente tras ejecutar el caso sobre la versión indicada.

Entregar instrucciones de arranque, capturas, resultados, fallos reproducibles, datos pendientes y límites de la versión. Separar pruebas locales, integración persistida, checkout externo y producción. Superar sandbox no acredita producción. Preparar esta documentación no incluye publicar una tienda operativa.
