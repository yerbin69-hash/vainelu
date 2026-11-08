# Vainelú · Demostración

Tienda de tartas con Next.js, diseño crema y galería de 15 fotografías del propietario. Sin pedidos, cobros ni comunicaciones reales. Los datos demo se guardan en el navegador.

## Ejecutar

Node 24.22.1. `npm ci`, `npm run build` y `npm start`. Escucha en 0.0.0.0 y usa PORT cuando el alojamiento lo define.

## Render gratuito

Servicio web Node, región Frankfurt, plan **free**. Build: `npm ci && npm run build`. Inicio: `npm start`. Variables: APP_MODE=demo, PAYMENTS_ENABLED=false, REAL_SALES_ENABLED=false, NOTIFICATIONS_MODE=log, NEXT_TELEMETRY_DISABLED=1. No se necesitan secretos ni base de datos para la demo.

El plan gratuito tiene límites compartidos de horas, ancho de banda y compilaciones y se suspende tras 15 minutos sin tráfico; la siguiente apertura puede tardar aproximadamente un minuto. No se añaden recursos de pago.

La compra real y las integraciones de Stripe/Supabase permanecen deshabilitadas. La administración es local y de demostración. La galería contiene las fotos descargadas del álbum facilitado por el propietario; no utiliza enlaces temporales de iCloud.

El cambio de dominio no transfiere localStorage: las simulaciones y cestas de la URL anterior permanecen aisladas en ese origen.
