# Autenticación y seguridad de conexión

La sesión se administra mediante cookies del backend. El cliente Axios usa
`withCredentials` y espera la cookie `XSRF-TOKEN` para enviar el encabezado
X-XSRF-TOKEN en las solicitudes protegidas.

## Inicio de sesión

La pantalla de autenticación puede registrar una cuenta, iniciar sesión o
usar el acceso de demostración cuando el backend lo permite. Después de una
autenticación exitosa, el frontend consulta el usuario actual antes de mostrar
el contenido operativo.

Para iniciar sesión o registrarse, `src/services/api.js` exige HTTPS tanto para
la página como para la API. La excepción local es una página HTTP en
`localhost`, `127.0.0.1` o `[::1]` conectada a un backend de loopback también
HTTP.

## Despliegues cruzados

El backend debe permitir explícitamente el origen del frontend mediante su
configuración de CORS. Las cookies `SameSite=Lax` pueden impedir sesiones en
dominios cruzados; se recomienda un despliegue del mismo sitio o un proxy
correctamente configurado.

Nunca se deben incluir contraseñas, tokens privados ni claves del backend en
variables `VITE_*`, porque terminan dentro del JavaScript público.
