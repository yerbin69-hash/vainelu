# Preparación de integración TEST

La migración `migrations/001_core.sql` prepara tablas, RLS, reservas transaccionales, instantáneas, tokens de invitado hasheados, estados de pago idempotentes y bandeja de notificaciones en modo registro. Se ha ejecutado contra PostgreSQL local; Auth y Storage reales siguen pendientes.

1. Usar un proyecto Supabase exclusivo para pruebas. No aplicar esta primera migración sobre tablas existentes con los mismos nombres.
2. Aplicar con el mecanismo de migraciones de Supabase. No contiene un catálogo comercial ni días abiertos por defecto. Cargar productos sintéticos verificados como datos de prueba, variantes, días y franjas en el proyecto aislado.
3. Crear el usuario del propietario mediante el procedimiento administrativo de Supabase Auth. Insertar su UUID en `staff_members` desde una conexión privilegiada. No existe registro público que conceda este papel. Verificar acceso, revocación y permisos de las claves actuales antes de conectar la interfaz.
4. Copiar `config/.env.example` a `.env.local`. Guardar las claves únicamente en configuración privada; en despliegues futuros usar el almacén de secretos del alojamiento. Preferir una clave restringida de Stripe sandbox con los permisos mínimos de Checkout. No usar claves live.
5. Configurar en Stripe una configuración de métodos limitada a tarjeta y monederos basados en tarjeta; guardar su ID en `STRIPE_CARD_PAYMENT_CONFIGURATION`. No activar métodos diferidos. Verificarla manualmente; el código no audita esa configuración del Dashboard.
6. Al integrar el recorrido público: generar un token de al menos 32 bytes en el servidor, guardar solo SHA256, validar contacto e identificadores, calcular y presentar una cotización, obtener aceptación de cambios y llamar `create_reserved_order`. La función vuelve a calcular desde las variantes y compara el importe esperado; el cliente no fija el precio.
7. Después llamar `createTestSession` con el UUID persistido. Reutiliza `checkout:<UUID>` al reintentar y alinea el vencimiento de la reserva con el de Stripe. No liberar una reserva ante un timeout ambiguo o una sesión sin vincular; recuperar la misma operación o escalar para revisión. El adaptador solo permite `APP_MODE=test` y requiere `PAYMENTS_ENABLED=true` para crear sesiones.
8. Registrar `/api/stripe/webhook` con su secreto de firma. Verifica el cuerpo original, rechaza live, recupera la sesión y delega en la transacción de pago. Un fallo de persistencia devuelve 500 para reintentar. La URL de retorno no escribe estados pagados.
9. `/api/reconcile` acepta POST con `Authorization: Bearer <JOBS_AUTH_SECRET>`, secreto aleatorio de al menos 32 caracteres. No se ha programado ningún trabajo externo. Conserva sesiones ambiguas y sin vincular; no libera por reloj local. Solo una sesión recuperada como expirada e impagada autoriza la liberación. Los intentos sin sesión requieren recuperar `createTestSession` con su misma clave; la automatización de esa recuperación está pendiente.
10. Probar por separado: JWT y RLS reales; dos servidores contra el mismo proyecto; recepción y reintentos de webhooks; firma inválida; acceso de invitado; checkout externo manual con medios de prueba; cancelación y reconciliación. Los resultados locales no sustituyen estas pruebas.

## Límites que impiden habilitar compras conectadas

Faltan la API pública de cotización/checkout y consulta privada unida a la interfaz, login administrativo y mutaciones autorizadas con auditoría y control de versión, carga y reprocesado de archivos, tratamiento de devoluciones, límites de frecuencia distribuidos y verificación real de las integraciones. Las funciones auxiliares de servidor son preparación, no una tienda test conectada completa.

No hay activación de producción. El ejemplo comercial conserva los campos desconocidos vacíos. Cambiar flags o añadir credenciales no elimina el bloqueo de la interfaz ni convierte el catálogo demo en productos reales.
