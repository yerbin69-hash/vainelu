# Cómo interpretar la referencia visual

La referencia autorizada es `diseno_aprobado_crema.png`, imagen PNG de 1536 por 1024 píxeles. Es la edición crema del diseño tercero que el usuario aprobó. Su huella SHA256 es:

`4f1339f06f899e652538e8fe7c2379661aab265a7e83913daf00f955c0f91553`

La imagen se conserva íntegra para que Codex pueda contrastar el resultado con la elección original. El texto superior «03 · PISTACHO MODERNO» identifica la propuesta inicial y **no indica que deba recuperarse la paleta verde**.

## Transformaciones autorizadas para convertir la maqueta en web

1. Sustituir el rótulo «Tu pastelería» por **Vainelú**, conservando el carácter redondeado y el color cacao.
2. Omitir la banda superior de numeración de la propuesta.
3. Omitir la nota inferior «Propuesta visual · Nombre, fotos y precios de ejemplo» como elemento de la tienda real. En demo y test, añadir una indicación de entorno propia, legible y discreta.
4. Convertir todos los controles y textos en HTML accesible. La imagen completa no debe colocarse como fondo o como una captura con botones invisibles encima.
5. Adaptar la composición a móvil y tableta manteniendo su jerarquía; la adaptación móvil aún no cuenta con una maqueta independiente aprobada.

## Lo que debe conservarse

Fondo crema, texto marrón oscuro, botones caramelo y contornos cacao. Tipografía redondeada de peso alto. Cabecera sencilla, portada con texto a la izquierda y tarta a la derecha, franja de tres pasos, categorías y tres tarjetas horizontales de producto. Fotografías apetecibles, sombras naturales suaves, esquinas redondeadas y ausencia de decoraciones estridentes.

Las tartas conservan su color real dentro de la fotografía. El pistacho puede seguir siendo verde y los frutos rojos pueden seguir siendo rojos; no constituyen colores de interfaz. No aplicar un filtro sepia a los productos.

## Sobre los recursos fotográficos

Este paquete incluye una maqueta generada, no una biblioteca de fotos independientes del negocio. Codex debe gestionar los assets como una tarea explícita: reutilizar originales disponibles o preparar imágenes separadas coherentes con la referencia mediante las herramientas autorizadas. Registrar procedencia y limitaciones; no afirmar que son fotos de productos reales.

No usar la captura completa como sustituto de la implementación ni presentar recortes con rótulos y controles incrustados como fotografías de catálogo. Cuando falten imágenes separadas, mostrarlo en el informe y continuar el resto de la tienda. Una referencia intacta debe seguir disponible en el repositorio durante el desarrollo.
