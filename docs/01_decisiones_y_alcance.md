# Decisiones y alcance de Vainelú

## Propósito

Desarrollar una tienda web de un único negocio para vender tartas bajo la marca Vainelú. La experiencia debe permitir comprender el producto, personalizar lo que se compra y elegir una fecha realmente disponible. La apariencia de la portada debe proceder de la referencia aceptada, no de una nueva interpretación visual.

## Qué está confirmado

| Decisión | Evidencia en esta conversación | Aplicación |
| --- | --- | --- |
| Web de venta de tartas | «Diseñamos una pagina para vender tartas» | Tienda web de un solo negocio |
| Diseño seleccionado | El usuario adjuntó el tercer diseño y pidió «Quiero cambiar los tonos a crema» | Usar la edición crema del diseño de pistacho |
| Aceptación de la edición | «Me gusta» después de la imagen crema | Mantener su composición, carácter y paleta |
| Marca definitiva para desarrollar | «Dejamos vainelu» | Mostrar Vainelú, con tilde |
| Entrega actual | «prepara la documentación para códex» | Preparar el encargo, no afirmar que la tienda ya existe |

Los otros nombres y los otros siete estilos quedan descartados para esta implementación. La decisión de nombre no equivale a una comprobación de registro de marca o disponibilidad de dominio.

## Propuesta funcional para la primera versión

Se propone implementar portada y catálogo, fichas de producto, opciones de personalización, carrito, elección de fecha, recogida o entrega configurables, compra como invitado, confirmación y consulta privada del pedido. Un panel para el propietario permitirá gestionar productos, precios, agenda, capacidad y pedidos.

La compra debe ser un flujo completo y comprobable. Los botones de la maqueta han de convertirse en acciones reales dentro del alcance del entorno: demostración claramente identificada o integración de pruebas con persistencia. Una interfaz que únicamente cambia de pantalla no acredita una tienda operativa.

Para solicitudes fuera del catálogo se propone un formulario de presupuesto. Esas solicitudes no se cobrarán automáticamente ni consumirán capacidad de producción hasta que se conviertan en un pedido aceptado según el flujo definido. En esta primera versión, cerrar el presupuesto puede gestionarse administrativamente; no se requiere construir un sistema complejo de negociación.

## Entornos y alcance comercial

| Modo | Uso | Datos y cobro |
| --- | --- | --- |
| `demo` | Revisar el diseño y ensayar el recorrido sin credenciales | Datos ficticios; almacenamiento local aislado; nunca pago ni pedido real |
| `test` | Verificar la tienda con servicios conectados | Base de datos separada de producción y Stripe en sandbox o modo de prueba; datos sintéticos |
| `production` | Vender a clientes reales cuando se active | Solo después de completar configuración comercial e integraciones y validar el flujo |

El diseño debe ser el mismo en los tres modos. En demo y test habrá una indicación clara y discreta del entorno, por ejemplo «Demostración · No se realizan pedidos ni cobros reales». Esta indicación no debe confundirse con las bandas de presentación de la maqueta.

La implementación que se encargará a Codex empieza en desarrollo y pruebas. El encargo no autoriza por sí solo comprar dominios, contratar servicios, enviar mensajes a terceros, utilizar tarjetas reales ni abrir ventas. Preparar los puntos de integración sí forma parte del trabajo.

## Valores iniciales propuestos

- Idioma de la interfaz: español de España.
- Moneda inicial: EUR, guardando dinero como enteros en céntimos.
- Zona horaria comercial inicial: Europe/Madrid, configurable y pendiente de confirmar con el negocio.
- Compra como invitado; autenticación obligatoria para administración.
- Pago total al hacer el pedido en el flujo de catálogo conectado. Presupuestos especiales separados y sin cobro inicial.
- Tarjeta como primera integración mediante Checkout alojado. Los monederos se mostrarán únicamente si el proveedor, el dispositivo y la configuración los admiten y se han comprobado; no anunciar disponibilidad garantizada.
- Recogida y reparto serán funciones configurables. No activar un método real sin dirección, calendario o zonas y tarifas válidas.
- Sin cuenta de cliente obligatoria, suscripciones, marketplace, programa de puntos ni aplicación móvil nativa en esta primera versión.

Estos valores permiten trabajar sin esperar por cada detalle. Deben residir en configuración o datos y quedar documentados para poder cambiarlos sin rediseñar la web.

## Datos comerciales que faltan

Faltan identidad fiscal y nombre del titular, datos de contacto, dirección, catálogo real, precios por variante, recetas e información de alérgenos verificada, fotos reales de producto, horarios, plazos de preparación, capacidad diaria, zonas y tarifas de reparto, política de pedidos y cancelación, tratamiento fiscal aplicable, condiciones de venta y textos de privacidad.

`config/business.example.json` deja estos campos sin completar. Los valores de `config/demo.settings.json` y `config/catalogo.demo.json` sirven exclusivamente para comprobar la interfaz y las reglas. No se convierten en datos de producción mediante un simple cambio del nombre del archivo.

## Fuera del alcance inicial

No se pide TPV de restaurante, comandero, integración de impresoras, gestión de mesas, APK, app de iPhone, marketplace de pasteleros, inventario de ingredientes, cálculo nutricional automático ni facturación certificada. Tampoco se incluyen promociones, valoraciones de clientes, reseñas o contadores de ventas inventados. Las nuevas funciones se evaluarán después de que el recorrido esencial esté completo.

## Orden de prioridades

1. Fidelidad visual y navegación clara.
2. Catálogo y personalización consistentes, con precio y cantidades correctos.
3. Agenda y capacidad verificadas por servidor.
4. Pedidos compartidos y pagos de prueba confirmados correctamente.
5. Administración utilizable y pruebas documentadas.
6. Configuración comercial y preparación para una futura apertura real.

Si hay una duda reversible de implementación, Codex debe escoger una solución razonable, registrarla y continuar. Si falta una credencial o un dato comercial, debe completar lo independiente y señalar el bloqueo concreto; no sustituirlo por un éxito ficticio.
