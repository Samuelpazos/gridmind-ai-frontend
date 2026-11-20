# Frontend acceptance tests

Run in a test workspace with real, simulated and archived fixtures as needed. Use disposable assets for cases that create data. Record the browser, the commit tested and the outcome. These scenarios are manual.

## FE-01 · Four ESP32 channels

Open **Activos → Maqueta ESP32 → Ver lecturas** after a complete batch. Check that temperature, voltage, current and vibration each have a value, unit and timestamp.

## FE-02 · Pending first hardware reading

Open the readings of a real transformer with a linked sensor and no batches yet. Check that the sensor shows **Esperando la primera lectura del ESP32**.
