# Diseño y componentes de Vainelú

## Dirección aprobada

La referencia es [diseno_aprobado_crema.png](../referencias/diseno_aprobado_crema.png). Mantener su carácter cercano, redondeado y centrado en las tartas. La fotografía y el titular dominan la primera pantalla. La tienda debe reconocerse como la misma propuesta que el propietario aceptó.

La lámina mide 1536 × 1024 px e incluye una franja superior de presentación. Al eliminar esa franja, el contenido de la web comienza antes: no añadir un hueco para conservar artificialmente las coordenadas de la imagen. La nota inferior tampoco forma parte de la tienda. Consultar [LEER_REFERENCIA.md](../referencias/LEER_REFERENCIA.md).

## Paleta inicial

Estos valores son una aproximación técnica propuesta a partir de la imagen, no colores extraídos de un archivo de diseño original. Ajustarlos con comparación visual, conservando su familia y el contraste.

| Token | Valor propuesto | Aplicación |
| --- | --- | --- |
| cream | #FFF8EC | Fondo principal |
| cream-surface | #F4E4CC | Superficies suaves, franja de pasos |
| sand | #E9D5B6 | Bordes y fondos secundarios |
| caramel | #D8B78C | Botón principal y categoría activa |
| cocoa | #422C21 | Texto, iconos y bordes de controles |
| caramel-dark | #9C6238 | Detalles decorativos y estados de interacción |

El texto de botones caramelo debe ser cacao. No usar texto blanco pequeño sobre caramelo. Los bordes que permitan reconocer un control deben distinguirse de su fondo. Para texto normal, comprobar al menos 4,5:1; para texto grande, 3:1, siguiendo [WCAG 2.2, contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Los estados de error o éxito pueden emplear colores semánticos discretos y texto explicativo.

La comida conserva sus colores naturales. El verde del pistacho, el rojo de las frutas y el marrón del chocolate no amplían la paleta de navegación. Evitar filtros sepia sobre imágenes.

## Tipografía e identidad

Usar una tipografía de titulares redondeada, robusta y amable. Como aproximación de implementación se propone **Fredoka** en peso 600–700 para marca y titulares, y **Nunito Sans** para texto y formularios. La fuente exacta de la imagen no se conoce; evaluar la semejanza de las formas y sustituir la propuesta si una fuente disponible se aproxima mejor. Registrar licencia y archivos utilizados. Si una descarga falla, continuar con una pila de reserva y declarar la diferencia.

Vainelú se escribe con tilde en el logotipo textual, títulos, metadatos y comunicaciones de interfaz. Usar vainelu en slugs y nombres técnicos. Conservar el pequeño gesto curvo caramelo bajo la marca si se reproduce como decoración sencilla. No añadir un símbolo nuevo que altere su identidad.

Escala orientativa: cuerpo 16–18 px; navegación y botones 18–24 px en escritorio; titular principal mediante un tamaño fluido entre 44 y 96 px según anchura. Ajustar métricas para conservar las dos líneas «Tu tarta.» y «A tu manera.» en escritorio, sin forzar desbordamientos en móvil. Interlineado compacto en titulares y cómodo en párrafos.

## Composición de escritorio

La referencia utiliza casi todo el ancho con márgenes laterales de aproximadamente 24–48 px y espacios consistentes. Proponer un contenedor máximo cercano a 1488 px, sin convertirlo en una columna estrecha a 1536 px.

### Cabecera

Marca a la izquierda. A la derecha, «Tartas», «Personalizadas» y «Cómo pedir», seguidos de cesta con contador. Altura orientativa 80 px. La cesta muestra la suma de unidades; su nombre accesible debe anunciar el número. Los enlaces llevan a secciones o rutas reales. La navegación no necesita hacerse fija en esta primera versión.

### Portada

Bloque de aproximadamente 420 px de alto en la referencia. Texto en la mitad izquierda y tarta protagonista en la mitad derecha, con continuidad de fondo crema y sombras naturales. La fotografía tiene protagonismo suficiente para mostrar cobertura, corte y relleno; evitar una miniatura enmarcada aislada.

Texto exacto de partida:

- Titular: «Tu tarta. A tu manera.»
- Apoyo: «Elige tu favorita y ponle tu toque.»
- Acción principal: «Ver tartas».
- Acción secundaria: «Personaliza la tuya».

Botones anchos, redondeados, aproximadamente 64–70 px de alto en escritorio. Principal caramelo con texto cacao; secundario crema con borde cacao. Mantener espacio entre ambos y estados de foco, pulsación, carga y deshabilitado. La imagen no debe tapar texto ni reducir el contraste.

### Pasos

Franja suave con extremos redondeados y tres bloques equilibrados: «1. Elige tu tarta», «2. Personalízala», «3. Elige fecha». Iconos de trazo cacao con detalle caramelo: porción, lápiz y calendario. Son explicación del proceso, no un asistente interactivo si no hay pasos activos. Los iconos redundantes pueden ocultarse a lectores de pantalla.

### Catálogo

Título «Encuentra tu favorita» a la izquierda y categorías a la derecha, en la misma línea cuando haya espacio. Categorías: «Todas», «Cumpleaños», «Clásicas», «Personalizadas». La seleccionada tiene fondo caramelo; las demás, fondo crema y borde cacao. Usar botones de filtro con estado seleccionado accesible.

Tres tarjetas por fila en escritorio, cada una con imagen a la izquierda y nombre, precio y «Elegir» a la derecha. Mantener esta composición horizontal, esquinas amplias y fondo cálido. No sustituirla por una rejilla genérica de fotos encima del texto. Nombres y precios de referencia: Chocolate, desde 32 €; Frutos rojos, desde 38 €; Pistacho, desde 42 €. Son ejemplos, reemplazables por datos reales sin rediseñar las tarjetas.

La fotografía de cada tarjeta ocupa aproximadamente la mitad. Los títulos deben poder envolver líneas cuando lo necesiten. Evitar anidar un botón dentro de un enlace: implementar tarjeta y acción con una estructura HTML válida y un orden de teclado claro.

## Adaptación a tableta y móvil

La referencia de escritorio es la única maqueta aprobada. Esta adaptación es una propuesta funcional que debe enseñarse en capturas.

| Anchura de comprobación | Comportamiento propuesto |
| --- | --- |
| 1536 px | Cabecera extendida, portada a dos columnas, tres pasos en línea y tres tarjetas horizontales |
| 768 px | Menú compacto si la navegación no cabe; ajustar portada y usar dos columnas de catálogo cuando cada tarjeta sea legible |
| 390 px | Marca, menú y cesta; portada apilada con texto, acciones y fotografía; tarjetas en una columna y filtros que puedan envolver |

Elegir puntos de ruptura por el contenido, no por una etiqueta de dispositivo. En móvil, apilar los botones si no caben completos; mantener el principal antes del secundario. La franja de pasos puede convertirse en tres filas. Evitar desplazamiento horizontal de toda la página. Usar una altura natural de contenido y no recortar el titular para imitar la proporción del escritorio.

Proponer controles táctiles de al menos 44 × 44 px como objetivo del diseño, texto base de al menos 16 px, foco visible y soporte de teclado. Esta dimensión táctil es una decisión del proyecto, no una afirmación sobre el mínimo normativo de WCAG. Respetar movimiento reducido.

## Extensión del diseño al resto de pantallas

Ficha, cesta, fecha, confirmación y formularios utilizan los mismos tokens, tipografía, radios y botones. En escritorio, la ficha puede situar fotos a la izquierda y configuración a la derecha; la cesta mantiene un resumen visible. En móvil se apilan en orden de lectura. El panel del propietario prioriza legibilidad y tablas o listas claras, conservando la identidad sin copiar el gran titular de la portada.

Añadir un pie discreto con enlaces de contacto, condiciones y privacidad cuando exista contenido válido. No inventar teléfonos, direcciones o perfiles. La demostración puede indicar que esos datos están pendientes; producción no debe mostrar enlaces sin destino.

## Imágenes y rendimiento

La maqueta no contiene archivos originales separados de cada tarta. Preparar imágenes independientes autorizadas y coherentes; registrar qué es una imagen generada y qué procede del negocio. Conservar la referencia intacta. No presentar un recorte de interfaz con rótulos como foto de producto.

Reservar dimensiones de imagen para evitar saltos, servir formatos y tamaños adecuados, priorizar la imagen protagonista y diferir imágenes fuera de pantalla cuando proceda. Describir la tarta en el texto alternativo cuando aporte información; una imagen duplicada decorativa no necesita repetir el nombre de producto.

## Componentes mínimos y comprobación

Construir cabecera, navegación móvil, cesta con contador, portada, botón principal y secundario, franja de pasos, filtro de categoría, tarjeta horizontal, selector de variantes, cantidad, calendario, resumen de compra, formulario, aviso de entorno y estados de carga o error.

La aceptación visual compara composición, proporciones, jerarquía, tipografía, color y tratamiento fotográfico. No exige igualdad de píxeles con una imagen generada que contiene anotaciones y una marca provisional. Primero revisar contra la referencia; después establecer capturas reales del DOM como base de regresión. Véase [comparación de capturas de Playwright](https://playwright.dev/docs/test-snapshots).
