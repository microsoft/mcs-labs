# Zava synthetic stock and policy fixture

Fixture ID: `ZAVA-DEMO-v1`

These are fictional, fixed workshop facts. They do not represent real inventory,
real policies, or permission to perform a transaction.

## Product

| SKU | Description | Unit | Net weight per unit |
| --- | --- | --- | --- |
| MORTAR-20 | Repair mortar | Whole bag | 20 kg |

This is the only supported product. Prices for goods are outside this demo.

## Stock snapshot

| Location ID | Location | Available bags | Protected minimum bags |
| --- | --- | --- | --- |
| ZAVA-LOCAL | Local branch | 90 | 40 |
| ZAVA-DEPOT | Regional depot | 140 | 50 |

Release a whole request from one location only. The remaining stock must be
greater than or equal to that location's protected minimum. Neither conversations
nor recommendations modify this snapshot.

## Delivery-charge approval

Currency: EUR. Use the total delivery charge quoted for the request, not the
goods value. All demo delivery prices are final fixture amounts; do not add
unprovided taxes or surcharges.

- A delivery charge **strictly greater than EUR 200** requires manager approval.
- A charge of **exactly EUR 200 or less** requires no additional delivery-charge
  approval under this demo policy.
- This rule assesses whether approval is needed; it never grants approval.
- A valid per-request carrier quote override replaces the quote only, not the
  approval threshold. It does not persist to later requests.

## Responsibility

Zava owns stock allocation and internal approval rules. LiftLine owns service
eligibility and quotes. A successful recommendation is still subject to human
confirmation; nothing has been reserved, booked, or approved.
