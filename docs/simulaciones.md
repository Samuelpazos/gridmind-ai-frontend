# Simulaciones y escenarios hipotéticos

La pantalla **Simulador** permite elegir un grupo, un transformador, una
variable y un valor objetivo. El valor puede escribirse o ajustarse con el
control deslizante.

Al ejecutar el escenario, el frontend envía la solicitud mediante
`runSimulation`. La respuesta compara la lectura disponible con el valor
simulado y presenta el estado y la probabilidad estimada para cada lado.

## Interpretación

- Una lectura operativa representa el valor de referencia disponible.
- Una lectura simulada representa el escenario hipotético.
- `Sin lectura` indica ausencia de referencia, no un valor igual a cero.
- Los porcentajes se formatean con la utilidad de probabilidad y se muestran
  como porcentaje entero.

El historial se obtiene con `getSimulationHistory` y se conserva asociado al
grupo seleccionado. Ejecutar una simulación no sobrescribe las lecturas
operativas.
