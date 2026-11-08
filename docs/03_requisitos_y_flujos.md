# Requisitos funcionales y experiencia de compra de Vainelú

## Estado de las decisiones

El usuario ha elegido **Vainelú** como nombre de una web en español para vender tartas. También ha aprobado la maqueta denominada originalmente «Pistacho moderno», en su versión recoloreada a crema, caramelo y marrón chocolate. Estas decisiones son la base del trabajo de Codex.

El recorrido de compra, el panel de gestión y las reglas operativas descritos a continuación son una **propuesta de implementación** para convertir ese diseño en una tienda utilizable. No deben presentarse como funciones ya construidas, probadas o aprobadas individualmente por el usuario.

Se propone comenzar con idioma `es-ES`, moneda EUR y zona horaria `Europe/Madrid`, todos configurables. Los productos Chocolate desde 32 €, Frutos rojos desde 38 € y Pistacho desde 42 € son ejemplos de la maqueta. Los precios definitivos, ingredientes, alérgenos, tamaños, horarios, capacidad, dirección, contacto y condiciones comerciales están pendientes. Los datos reales desconocidos deben permanecer vacíos o en `null`; nunca rellenarlos con información comercial inventada.

## UX01 Fidelidad a la portada aprobada

Utilizar la imagen crema incluida en el paquete como referencia principal. Conservar sus fondos claros, titulares redondeados y gruesos, texto cacao, botones caramelo, esquinas suaves y fotografías grandes. El verde del pistacho pertenece al alimento; no convertir la interfaz de nuevo a verde ni aplicar un filtro crema sobre las tartas.

Mantener esta estructura:

1. Cabecera con marca, «Tartas», «Personalizadas», «Cómo pedir» y cesta con contador.
2. Portada con «Tu tarta. A tu manera.», el texto «Elige tu favorita y ponle tu toque.», los botones «Ver tartas» y «Personaliza la tuya», y la fotografía protagonista a la derecha en escritorio.
3. Franja de pasos «Elige tu tarta», «Personalízala» y «Elige fecha».
4. Sección «Encuentra tu favorita», filtros y tres tarjetas de producto por fila en escritorio.

Sustituir «Tu pastelería» por **Vainelú**. La franja «03 · PISTACHO MODERNO» y el pie «Propuesta visual…» son anotaciones de la maqueta, no contenido de la tienda definitiva. El modo demostración tendrá su propio aviso inequívoco. No añadir valoraciones, testimonios, descuentos, insignias de éxito ni promesas de entrega sin datos reales.

## UX02 Navegación y catálogo

«Ver tartas» lleva al catálogo; «Personaliza la tuya» inicia un recorrido de personalización. Las tarjetas completas deben permitir abrir la ficha, con un botón «Elegir» visible. La marca regresa a inicio y la cesta abre el resumen actual.

Conservar los filtros «Todas», «Cumpleaños», «Clásicas» y «Personalizadas» de la referencia. Asignar productos mediante datos configurables. Si una categoría no contiene resultados, mostrar «No hay tartas en esta categoría» y «Ver todas», sin una zona vacía inexplicable. Incorporar búsqueda por nombre y descripción cuando resulte útil para el tamaño del catálogo, sin desplazar los elementos principales de la portada.

Cada tarjeta muestra fotografía, nombre y precio. «Desde» solo corresponde al menor precio vigente de una variante que realmente pueda comprarse. Un producto sin precio publicable debe ofrecer consulta, no un importe ficticio. Distinguir producto temporalmente agotado, producto no disponible para una fecha y producto retirado del catálogo.

## UX03 Ficha y configuración de una tarta

La ficha debe reunir fotografías, descripción, información de ingredientes y alérgenos facilitada por el negocio, variantes disponibles y condiciones relevantes para el encargo. No deducir alérgenos de una fotografía ni interpretar una ausencia de información como ausencia de alérgenos. En producción, impedir la venta de una ficha cuya información requerida esté pendiente de completar.

Ofrecer los campos que corresponda configurar para cada producto:

- Tamaño o rango de raciones, con una denominación comprensible y sin equivalencias de peso inventadas.
- Bizcocho, relleno o sabor, únicamente cuando sean opciones reales de esa tarta.
- Mensaje sobre la tarta, opcional, con límite configurable, contador y vista previa textual.
- Complementos, si existen, con su precio visible y sin seleccionarlos por defecto.
- Cantidad de tartas, mediante controles de aumentar y reducir.

Mostrar el precio de la combinación elegida, el desglose de suplementos y el total de la cantidad seleccionada. El precio mostrado antes de añadir debe corresponder a esa configuración. Una combinación incompleta o incompatible no puede añadirse; explicar qué falta junto al campo y llevar el foco al primer problema.

El botón indicará «Añadir a la cesta» e incluirá o acompañará el importe. Tras añadir, actualizar el contador y mostrar una confirmación breve con acceso a la cesta. No obligar a abandonar el catálogo para seguir comprando. Un comentario libre no debe conceder una modificación, un precio ni una garantía de ausencia de alérgenos que el negocio no haya confirmado.

## UX04 Encargos personalizados fuera del catálogo

Separar la personalización tarifada de una solicitud que requiere presupuesto. En el segundo caso, solicitar fecha deseada, raciones orientativas, descripción y contacto. Una imagen de inspiración puede ser opcional; debe ser posible eliminarla antes de enviar y conocer su estado de carga.

La acción será «Solicitar presupuesto». Explicar que se trata de una solicitud, y que la fecha y el precio necesitan confirmación. No mostrar «Pedido confirmado», reservar una entrega definitiva ni cobrar un importe inventado. Solo mostrar «Solicitud enviada» cuando exista un registro guardado; si falla el envío, conservar lo escrito y permitir reintentar.

No anunciar respuestas en un plazo concreto ni enviar mensajes por un canal que todavía no esté configurado. El panel debe permitir consultar estas solicitudes de forma separada a los pedidos pagados.

## UX05 Cesta

Mostrar fotografía, producto, variante, personalización, precio unitario, cantidad, suplementos y subtotal de cada línea. Configuraciones diferentes deben conservar líneas separadas. Configuraciones idénticas pueden agruparse aumentando la cantidad. El contador de la cabecera representará unidades de tartas, no número de sabores distintos.

Permitir editar opciones, variar cantidades y eliminar una línea. Los totales se actualizarán de forma coherente. Al eliminar la última unidad, mostrar una cesta vacía con «Elegir una tarta». Conservar la cesta al navegar y recargar dentro de las posibilidades declaradas de cada modo; no confundir esta comodidad con la existencia de un pedido compartido.

Revalidar precio, variantes y disponibilidad antes de pasar al pago. Ante cambios, explicar qué línea ha cambiado y solicitar revisar el nuevo total. No aplicar silenciosamente un precio superior. Un fallo de conexión debe conservar la cesta y ofrecer reintento.

## UX06 Recogida entrega y fecha

Proponer un único método de recepción y una única fecha por pedido en la primera versión. Todas las tartas de la cesta deben poder prepararse para esa fecha. Mostrar recogida, entrega o ambas según la configuración del negocio; no anunciar una modalidad desactivada.

Para recogida, mostrar la ubicación y las franjas habilitadas. Para entrega, comprobar cobertura y coste con la dirección necesaria, antes del pago. No mostrar «Envío gratis», una cobertura geográfica o una dirección de recogida sin configurar. Si ningún método está disponible, detener la compra con una explicación y registrar el bloqueo en el panel.

El calendario debe considerar antelación por producto, hora de corte, días cerrados, fechas bloqueadas y capacidad. Un día pasado no es seleccionable. Tratar la fecha y la hora en la zona del negocio, incluidos cambios de horario estacional. Los valores iniciales de prueba serán configuraciones de demostración, no compromisos comerciales: 48 horas transcurridas desde el instante del servidor hasta el inicio de la franja, 80 raciones por fecha y un horizonte de 30 fechas locales contando hoy, offsets 0 a 29. Consultar config/demo.settings.json. Una franja que empieza exactamente al cumplir las 48 horas supera ese filtro; el resto de restricciones sigue aplicándose.

Las cantidades y tamaños influyen en la capacidad según las reglas configuradas. Si otro pedido ocupa la última disponibilidad, mostrar «Esa fecha acaba de completarse. Elige otro día» cuando se agote el cupo diario; si solo se agota una franja, permitir elegir otra franja con cupo, conservando la cesta y los datos. Una fecha visible en el calendario no garantiza una reserva hasta que el sistema la confirme. Cualquier reserva temporal debe indicar su caducidad sin crear urgencia comercial ficticia.

## UX07 Finalización de compra y seguimiento

Proponer compra como invitado. Pedir únicamente los datos necesarios para atender el pedido y, cuando corresponda, efectuar la entrega. Los campos obligatorios deben estar identificados antes de enviar. No imponer registro ni consentimiento de marketing para comprar.

Antes de continuar, presentar productos, opciones, fecha, método, contacto, importes y total final. Los conceptos fiscales y el transporte deben provenir de la configuración real. Si el importe no puede calcularse, impedir el pago y explicar el motivo. Las condiciones aplicables deben poder abrirse sin perder el formulario.

Durante el proceso, distinguir «Guardando pedido», «Abriendo pago», «Verificando pago», «Pago pendiente», «Pago recibido», «Pago fallido» y «Pago no completado». Evitar duplicar pedidos por doble pulsación, recarga o reintento. Regresar de la pantalla de pago no basta para afirmar que se ha cobrado. Volver por cancelación solo significa que el navegador cerró ese recorrido; no revoca un pago ya confirmado. Para productos de catálogo, pago verificado y capacidad comprometida confirman automáticamente el pedido y su fecha. Un presupuesto o un pago tardío con capacidad liberada requiere revisión y no confirma fecha automáticamente.

La confirmación mostrará referencia, fecha, recepción, resumen, total y estado comprobado. Separar el estado del pago del de preparación. El seguimiento puede informar «Confirmado», «En preparación», «Listo para recoger», «En reparto», «Entregado» o «Cancelado» según el método y las reglas habilitadas. No prometer un correo o mensaje de confirmación si ese canal no ha enviado nada. Los datos de un pedido solo deben ser accesibles a su cliente y al personal autorizado.

## UX08 Modos de funcionamiento

| Modo | Experiencia que debe quedar clara |
| --- | --- |
| Demostración | Catálogo y precios de ejemplo, aviso visible y pedidos simulados identificados como tales. No solicita pagos reales ni promete atender encargos. Permite explorar todo el recorrido. |
| Pruebas de integración | Pedidos persistidos en un entorno separado y pasarela en pruebas. La interfaz identifica el entorno y permite comprobar éxito, fallo, cancelación y eventos retrasados. |
| Producción | Datos comerciales revisados, configuración operativa completa, cobros reales habilitados y estado de pedido verificable. No mezclar pedidos o configuraciones de prueba con los reales. |

Un modo sin integración activa no debe presentar una simulación como compra real. Un error de configuración en producción debe bloquear la operación afectada, no sustituirla automáticamente por una confirmación de demostración.

## UX09 Panel del propietario

El panel requiere acceso autorizado y una navegación separada de la tienda. Debe ofrecer:

- **Pedidos:** lista con fecha de preparación, referencia, cliente, método, importe y estados separados de pago y preparación. Filtros por fecha y estado, detalle completo y búsqueda por referencia.
- **Producción:** vista de encargos por día y franja, cantidades, tamaños y mensajes, con capacidad restante basada en datos vigentes.
- **Productos:** edición de imágenes, descripciones, ingredientes, alérgenos, variantes, precios, categorías y publicación. Ocultar un producto no debe borrar el historial de pedidos.
- **Disponibilidad:** días cerrados, bloqueos, antelación, franjas y límites de capacidad. Advertir si un cambio afecta a pedidos existentes; no cancelarlos ni moverlos silenciosamente.
- **Solicitudes:** encargos que esperan valoración, con contacto y estado de atención claramente diferenciados de un pago.
- **Configuración:** datos del negocio, modos de recepción, zonas y tarifas, textos y canales de comunicación habilitados.

Guardar debe confirmar el resultado real; abandonar cambios sin guardar requiere advertencia. Las acciones sensibles, como cancelar un pedido o modificar su fecha, deben mostrar sus consecuencias. Cancelación y devolución de dinero son operaciones diferentes: ninguna debe aparentar ejecutar automáticamente la otra.

## UX10 Móvil accesibilidad y estados de interfaz

En móvil, conservar identidad y jerarquía: marca y cesta accesibles, menú compacto, titular legible, llamadas a la acción completas, fotografía protagonista y catálogo en una columna. Adaptar las tarjetas a su ancho sin cortar nombres, precios ni botones. La franja de tres pasos puede reorganizarse verticalmente. No reducir toda la maqueta como si fuera una imagen ni convertirla en una página hecha de capturas.

Usar texto seleccionable, controles reales, etiquetas de formulario, navegación por teclado y foco visible. Proponer cuerpo de al menos 16 px y áreas táctiles de al menos 44 × 44 px. No comunicar disponibilidad o errores solo por color. Los botones de cantidad deben indicar su finalidad y producto; los cambios de cesta y errores deben poder anunciarse de forma accesible.

Definir carga, vacío, agotado, error recuperable y falta de permisos. Los mensajes deben explicar el problema y la siguiente acción. Una imagen ausente tendrá un reemplazo neutro; un pago desconocido mostrará verificación pendiente. Al reintentar, conservar los datos válidos. En modales, gestionar foco y retorno al control de origen; respetar preferencias de movimiento reducido.

## Criterios de aceptación funcional

La entrega debe permitir verificar un recorrido completo desde catálogo hasta confirmación en el modo declarado, editar la cesta sin perder opciones, rechazar fechas y combinaciones inválidas y recuperar fallos sin duplicar pedidos. En pruebas de integración, un pedido guardado debe aparecer en el panel desde otra sesión autorizada.

La comparación visual debe comprobar la portada en escritorio y móvil contra la referencia crema. El informe final distinguirá lo implementado, lo probado con evidencia y lo pendiente. Una interfaz que parece funcionar no acredita cobros, avisos, disponibilidad compartida ni atención real de pedidos.

## Mapa propuesto de pantallas y destinos

Las rutas son una propuesta de implementación; pueden adaptarse a una estructura existente compatible sin cambiar los destinos de las acciones.

| Pantalla o acción | Ruta o destino propuesto | Comportamiento |
| --- | --- | --- |
| Inicio y marca | / | Portada aprobada y catálogo |
| Tartas / Ver tartas | /#tartas | Desplazar al catálogo y permitir filtrar |
| Cómo pedir | /#como-pedir | Mostrar los tres pasos y la información disponible |
| Elegir una tarta | /tartas/[slug] | Ficha y opciones de esa tarta |
| Personalizadas / Personaliza la tuya | /personalizar | Elegir configuración tarifada de catálogo o solicitar presupuesto especial, con diferencia explícita |
| Cesta | /cesta | Editar líneas y revisar totales |
| Continuar pedido | /pedido | Contacto, fecha, recepción y resumen |
| Retorno del pago | /pedido/resultado | Consultar el estado real; nunca dar por pagado por visitar la ruta |
| Consulta privada | /pedido/consulta | Sesión de invitado o credencial protegida; sin búsquedas públicas por referencia |
| Administración | /admin | Acceso autorizado y gestión de productos, agenda, solicitudes y pedidos |

El formulario especial permanece separado del carrito hasta tener un precio y una fecha aceptables. En demo, tanto la compra como las solicitudes indican que son simulaciones; en test, «guardado» solo se muestra tras persistencia correcta.
