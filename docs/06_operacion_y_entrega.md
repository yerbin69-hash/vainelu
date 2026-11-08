# Operación, configuración y entrega

## Qué debe entregar Codex

La entrega de implementación incluye código ejecutable, instrucciones de arranque, dependencias fijadas, migraciones, datos de demostración separados, variables de ejemplo, capturas, pruebas ejecutadas y una relación de pendientes. Este paquete actual contiene las instrucciones para producir esa entrega; no incluye una web ya construida.

Mantener un README de aplicación que explique los comandos reales del repositorio para instalar, arrancar, compilar y comprobar. No documentar un comando como disponible hasta que exista. Elegir una versión de Node compatible y con soporte vigente cuando se implemente, y declararla en el proyecto.

## Uso de los archivos de configuración

| Archivo | Uso correcto |
| --- | --- |
| business.example.json | Estructura de datos del negocio. Los campos desconocidos permanecen en null. No es una ficha completa para vender. |
| demo.settings.json | Reglas ficticias para ejecutar y probar el recorrido. No importar automáticamente a producción. |
| catalogo.demo.json | Catálogo sintético con tres tartas y variantes. Fotos, recetas y alérgenos reales siguen pendientes. |
| design-tokens.css | Punto de partida visual que se ajusta contra la referencia. |
| .env.example | Lista de variables, sin secretos. Crear el archivo local que utilice el proyecto y excluirlo del control de versiones. |

Validar los JSON en el arranque o al importarlos. Declarar el esquema mediante tipos y validación de entradas; no confiar en que un archivo editable tenga siempre valores correctos. Los identificadores y el contenido de demostración deben quedar reconocibles como tales.

Las claves de Supabase publicables y secretas cumplen funciones distintas. Las secretas quedan en módulos de servidor y nunca llevan un prefijo de exposición pública. Véase [claves de API de Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

## Demostración sin servicios

El proyecto debe arrancar en demo sin credenciales de Supabase o Stripe. El aviso de entorno aparece en la tienda y en la confirmación. La cesta puede guardarse en el navegador; cualquier pedido de este modo es una simulación local. Ofrecer reinicio de los datos de ejemplo. El panel de demostración, si se muestra, debe identificarse como simulación y no presentarse como un acceso administrativo protegido a datos reales.

Para poder ensayar la fecha, se proponen estas reglas exclusivamente ficticias:

- Zona de referencia Europe/Madrid.
- Antelación mínima de 48 horas transcurridas desde el reloj del servidor hasta el inicio de la franja. Cumplir exactamente el límite es válido.
- Horizonte de 30 fechas del calendario local contando hoy: offsets 0 a 29, ambos incluidos. Después se aplican antelación, apertura y cupo.
- Capacidad de 80 raciones por fecha, compartida entre todas las franjas de ese día.
- Retención propuesta de 30 minutos al iniciar pago, coordinada con la expiración real aceptada por el proveedor en test.
- Recogida simulada sin dirección comercial. El reparto real permanece sin configurar.

El modo demo puede inyectar un reloj de pruebas para reproducir casos; los entornos conectados validan con el reloj del servidor. La disponibilidad mostrada no concede una reserva hasta la validación final.

## Integración de pruebas

Usar un proyecto de datos separado, cuentas administrativas de prueba y claves de Stripe de prueba. Las migraciones se ejecutan en ese entorno y las políticas se comprueban como usuario anónimo, usuario normal y administrador.

Permitir un pedido compartido que pueda recuperarse desde otra sesión. Configurar el endpoint de eventos y documentar su secreto de firma, sin incluir el valor. Verificar importe, moneda, modo y asociación del pago al pedido.

El trabajo de reconciliación debe poder ejecutarse manualmente para pruebas y quedar preparado para una ejecución programada en el despliegue futuro. Autenticarlo, hacerlo idempotente y permitir varias instancias sin duplicar operaciones. Registrar reservas pendientes, fallos de procesamiento y discrepancias. No liberar una reserva pendiente solo porque haya vencido el contador visible.

Una conexión de prueba no habilita ventas reales. No enviar correos ni mensajes a personas: el adaptador de notificaciones usa registro por defecto. Si una herramienta o credencial impide una comprobación, anotarla como BLOQUEADO y completar las verificaciones independientes.

## Confirmación, revisión y cancelación

Para catálogo, precio válido, pago verificado y capacidad comprometida permiten confirmar automáticamente el pedido y su fecha. El propietario puede avanzar después su preparación. Una solicitud de presupuesto no recibe esta confirmación de forma automática.

Un pago válido que llega después de liberar capacidad se conserva y deja el pedido en revisión. El responsable debe poder verlo y resolverlo; el sistema no promete una fecha que ya no puede reservar. Un pago recibido para un pedido cancelado tampoco lo reactiva silenciosamente.

Cancelar un pedido, cerrar una sesión de pago y devolver dinero son acciones distintas. Mostrar consecuencias y resultado comprobado de cada una. Las devoluciones de prueba no autorizan devoluciones reales; conservar importes, actor, motivo e identificador del proveedor.

## Datos que deberá aportar el negocio

| Área | Información pendiente |
| --- | --- |
| Identidad | Titular, datos fiscales y dirección aplicables |
| Contacto | Correo, teléfono y canales que realmente se atenderán |
| Productos | Tartas, variantes, raciones, precios, fotos, ingredientes y alérgenos verificados |
| Agenda | Días abiertos, franjas, antelación, capacidad y fechas bloqueadas |
| Recepción | Dirección de recogida o zonas de reparto, condiciones y tarifas |
| Venta | Tratamiento fiscal, política de pedidos, cambios, cancelaciones y devoluciones |
| Publicación | Dominio, alojamiento, cuentas de servicios y contenido de privacidad y condiciones |

No completar estos datos por inferencia. No afirmar que los textos están revisados jurídicamente ni aplicar un tratamiento fiscal inventado. Las imágenes de ejemplo no acreditan que el negocio fabrique esas recetas.

## Preparación de una futura publicación

La aplicación conectada necesita un entorno que ejecute su código de servidor, base de datos y recepción de eventos; exportar solo HTML no completa estas funciones. Véase [opciones de despliegue de Next.js](https://nextjs.org/docs/app/getting-started/deploying).

Documentar cómo configurar secretos, migraciones, archivos, origen permitido, HTTPS, trabajos de reconciliación, registros y recuperación. Separar los datos de prueba. La activación real debe requerir modo production, datos comerciales válidos, servicios correctos y la habilitación explícita de ventas; cambiar una única bandera no debe saltarse la validación.

No elegir un dominio como si estuviera disponible o contratado. Este encargo prepara desarrollo y pruebas; no compra servicios ni publica la tienda.

## Informe de cierre

Usar plantillas/entrega_codex.md y mantener el registro de pruebas. El informe debe permitir al propietario abrir la versión, reconocer el diseño, recorrer una compra y saber qué servicios están conectados. Explicar las limitaciones pendientes con su consecuencia concreta.

Separar cuatro hechos: código creado, recorrido de demostración probado, integración compartida verificada y preparación de producción. Ninguno de ellos se deduce automáticamente del anterior.
