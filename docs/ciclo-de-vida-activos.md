# Ciclo de vida de los activos

La sección **Activos** separa transformadores reales de transformadores
simulados. El inventario se consulta desde la API y se muestra agrupado por
subestación.

## Alta y conexión

Un transformador real requiere nombre y subestación; la potencia y la
antigüedad son datos técnicos opcionales. Un transformador simulado se crea a
partir de un perfil de demostración.

Los equipos reales pueden quedar en estado **Pendiente de conexión** hasta que
se vincule el código del sensor de temperatura. La vinculación se realiza
desde el detalle del equipo y no cambia manualmente los valores de telemetría.

## Cambios y archivo

El lápiz permite actualizar el nombre. Archivar retira un transformador del
inventario activo sin eliminarlo definitivamente. La vista de archivados ofrece
**Restaurar**, que lo devuelve al inventario operativo.

Las acciones de fila detienen la propagación del clic para no abrir el detalle
mientras se administra el registro. Durante una petición se deshabilitan las
acciones de esa fila.
