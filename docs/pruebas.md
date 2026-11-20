# Pruebas y validación

Los comandos definidos en `package.json` cubren las comprobaciones básicas:

```bash
npm test
npm run lint
npm run build
```

## Pruebas automatizadas

`test/presentation.test.js` usa el ejecutor nativo de Node para validar
presentación y normalización de datos. Actualmente cubre:

- etiquetas compactas y extendidas del origen de telemetría;
- orígenes recientes de hardware, simulación, mezcla y ausencia;
- porcentajes cero, máximos, redondeo, valores ausentes, infinitos y no
  interpretables;
- mediciones enteras, decimales localizadas, negativas, cero y ausentes.

Estas pruebas no levantan el backend ni montan el DOM. Su objetivo es proteger
las utilidades puras que alimentan las vistas.

## Validación de entrega

Antes de una entrega, ejecutar los tres comandos y conservar cualquier error
completo. `npm run lint` debe terminar sin advertencias y `npm run build` debe
generar `dist` sin errores de transformación.
