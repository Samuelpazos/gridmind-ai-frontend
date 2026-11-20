# Configuración de inteligencia artificial

La pantalla **Configuración de IA** presenta las estrategias disponibles y
permite cambiar la estrategia activa mediante `setStrategyConfig`.

## Estrategias visibles

- **Supervised Model**: modelo supervisado para estimar riesgo.
- **Isolation Forest**: detección no supervisada de anomalías.
- **Threshold Strategy**: reglas basadas en umbrales.
- **Weighted Age Strategy**: ponderación del riesgo por antigüedad y estrés.

Los nombres enviados al backend son identificadores técnicos como
`SUPERVISED_MODEL_STRATEGY` o `THRESHOLD_STRATEGY`.

## Modo degradado

El control de fallback permite forzar el modo degradado asociado al requisito
RNF-08. La interfaz mantiene separados el nombre de la estrategia y el
booleano `forceDegradedMode`, y refresca el resumen luego de guardar.

La pantalla no entrena modelos ni calcula predicciones localmente: solo
selecciona la estrategia solicitada y muestra el estado comunicado por el
backend.
