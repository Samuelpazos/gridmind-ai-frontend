# Frontend acceptance tests

Run in a test workspace with real, simulated and archived fixtures as needed. Use disposable assets for cases that create data. Record the browser, the commit tested and the outcome. These scenarios are manual.

## FE-01 · Four ESP32 channels

Open **Activos → Maqueta ESP32 → Ver lecturas** after a complete batch. Check that temperature, voltage, current and vibration each have a value, unit and timestamp.

## FE-02 · Pending first hardware reading

Open the readings of a real transformer with a linked sensor and no batches yet. Check that the sensor shows **Esperando la primera lectura del ESP32**.

## FE-03 · Refresh an open readings panel

Keep **Ver lecturas** open while a second hardware batch arrives. Check that the displayed value updates. Use readings in different minutes if comparing visible timestamps.

## FE-04 · Close the readings panel

Open **Ver lecturas**, select its close button and check that the selected asset remains visible in the inventory.

## FE-05 · Real and simulated inventory tabs

Create one real and one simulated asset. Switch between both tabs and check that each asset appears under its corresponding type.

## FE-06 · Archived inventory tab

Archive a disposable asset and check that it leaves its active tab and appears under **Archivados**.

## FE-07 · Search by transformer code

Copy the code of a visible asset and enter it in the inventory search. Check that the matching asset remains visible.

## FE-08 · Empty search result

Search for a string absent from the inventory and check that no asset rows appear. Clear the search and check that the rows return.
