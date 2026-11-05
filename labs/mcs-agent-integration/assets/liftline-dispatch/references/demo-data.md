# LiftLine synthetic service fixture

Fixture ID: `LIFTLINE-DEMO-v1`

All services, capacity, coverage, slots, and prices below are fictional workshop
data. They are not real offers, load-safety assessments, or delivery commitments.

## Coverage and arrival

Supported origin: Zava Regional depot (`ZAVA-DEPOT`).
Supported destination: Riverside renovation site.
Both services have an arrival window of **08:00-09:30 on the requested demo day,
in the explicitly supplied timezone**. Treat that slot as available for an
otherwise eligible request in this simulation only. Do not infer the requested
calendar day or timezone from the server clock.

There are no other routes or slots in the fixture. A request for arrival before
09:00 cannot be guaranteed by a window ending at 09:30.

## Service sheet

| Service ID | Service | Delivery charge | Loaded capacity | Site forklift required |
| --- | --- | --- | --- | --- |
| STANDARD | Standard delivery | EUR 120 | 1,500 kg | Yes |
| TAIL-LIFT | Tail-lift delivery | EUR 180 | 1,500 kg | No |

These are final demo delivery charges. Do not add invented taxes or surcharges.
An explicit nonnegative EUR demo quote override may replace the price for a
named service for one request only. No other fixture facts can be overridden.

## Baseline shipment and handling assumptions

The prepared scenario is 60 repair-mortar bags, 20 kg each:

- Product weight: 60 x 20 kg = **1,200 kg**.
- Fixed pallet/packaging allowance for this shipment: **100 kg**.
- Loaded shipment weight: **1,300 kg**.
- One compatible pallet, vehicle access, level hardstanding, adequate tail-lift
  rating, and a carrier-provided pallet truck/operator are assumed for this
  fictional shipment. The operator can perform ground-level unloading.
- The site has no forklift in the baseline prompt.

Make these assumptions visible rather than presenting them as checked facts.
If the user reports stairs, unsuitable access, or incompatible handling, ask for
clarification or report that the fixture cannot support the request.

For another quantity or configuration, do not reuse the 100 kg allowance
automatically. Require explicit loaded weight and appropriate handling details.
If loaded weight is supplied, check it is consistent with known product weight.

## Responsibility

LiftLine evaluates delivery only. Zava independently owns product facts, stock,
and manager-approval policy. Do not ask for Zava's stock tables or internal
approval thresholds to quote a delivery. Nothing is reserved or booked.
