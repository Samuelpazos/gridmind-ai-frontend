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

## FE-09 · Last hardware reading in Operations

Open **Operaciones → Entrada de telemetría** after a hardware batch. Compare the last hardware timestamp with the temperature reading in the inventory.

## FE-10 · Filter pending alerts

With both pending and acknowledged alerts, select the pending filter. Check that acknowledged alerts disappear from the list.

## FE-11 · Simulated alert grouping

Generate an alert using a disposable simulated transformer. Check that it appears in the simulated group.

## FE-12 · Empty alerts group

Open a group with no pending alerts while the pending filter is selected. Check that the group displays its empty state.

## FE-13 · Simulator unit changes

Select temperature, voltage, current and vibration in turn. Check that the corresponding target fields display °C, kV, A and mm/s.

## FE-14 · Simulator invalid target

Enter a value the current form marks invalid. Check that the interface prevents the submission or displays an error, and that no scenario is recorded.

## FE-15 · Original and simulated readings

Choose an asset with an existing reading and run a scenario with a different target. Check that the original reading and the requested simulated value appear separately.
