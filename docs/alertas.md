# Gestión de alertas

La pantalla **Alertas** consulta el listado compartido por `GridContext` y
permite filtrar por reconocimiento y severidad.

## Filtros

- **Todas**, **No reconocidas** o **Reconocidas** controlan el estado de
  atención.
- El filtro de severidad permite mostrar cualquier nivel o solo `WARNING`,
  `CRITICAL` y `FAILED`.

Una alerta muestra su severidad, transformador o código de componente,
subestación, mensaje, origen y fecha de creación.

## Reconocimiento

Una alerta pendiente ofrece **Reconocer Alerta**. La pantalla envía el
identificador a `acknowledgeAlert` y actualiza los datos compartidos cuando la
operación termina. Una alerta ya reconocida muestra el operador registrado y
no ofrece una segunda acción.

Las alertas vacías se explican con un estado de tabla, por lo que un resultado
sin coincidencias no se confunde con un error de conexión.
