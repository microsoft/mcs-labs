> **Sample document.** This tender is fictional and was generated for demonstration purposes. The tenderer, prices, team, and all details are invented.

# Tender in Response to ITT 2026-07
## Mobile Field Inspection Application — Mobile Application Suite

**Submitted by Aventra Software Group** — Custom Application Development
Prepared for **Cedar Valley Water District**

| | |
| --- | --- |
| **ITT reference** | ITT 2026-07 |
| **Submitted** | 13 March 2026 |
| **Tenderer** | Aventra Software Group |
| **Contact** | proposals@aventrasoftware.example · (512) 555-0182 |
| **Tender price** | $172,000 (fixed price, Phase 1) |
| **Programme duration** | 5 months (20 April – 18 September 2026) |
| **Structure** | Parts A–H per ITT section 4 · 20-page limit observed |

## Part A — Tenderer details and authorised signature

13 March 2026

Derek Nowak, Procurement Officer
Cedar Valley Water District

Dear Mr Nowak,

**ITT 2026-07 — Mobile Field Inspection Application**

Aventra Software Group is pleased to tender for the supply of a mobile field
inspection application for Cedar Valley Water District. Aventra has designed,
built, and operated custom software for mid-market and enterprise organizations
since 2009, delivering more than 300 engagements across healthcare, government,
education, financial services, and manufacturing. We specialize in modernizing
legacy systems, unifying fragmented data, and shipping applications that teams
adopt without a fight.

Our tendered price is **$172,000, fixed**, which is within the District's secured
budget of $180,000. We have taken up the District's invitation at ITT section 3
to identify functionality that cannot be delivered within that figure. Our
indicative full-scope range for an offline-first field mobility programme is
$260,000–$600,000, so this tender is deliberately a **reduced Phase 1 scope
priced to be genuinely deliverable**, not a compression of full scope to fit the
budget. Every requirement R1–R11 is addressed in Phase 1; the items we cannot
responsibly commit to within $180,000 are named explicitly in Part B and priced
indicatively as Phase 2 in Part G, so the District can see the whole path.

This tender is organised in the order set out at ITT section 4, is within the
20-page limit, and remains valid for 90 days from the closing date.

Sincerely,

**Priya Raman**
Engagement Director, Aventra Software Group
proposals@aventrasoftware.example · (512) 555-0182

> **[NEEDS SME INPUT]** The ITT requires an authorised signature. This draft
> carries a typed name only — obtain a wet or digital signature from an
> authorised officer of Aventra Software Group before submission.

### Tenderer particulars

| | |
| --- | --- |
| Legal name | Aventra Software Group |
| Founded | 2009 |
| Head office | Austin, Texas |
| Staff | 240 |
| Product line tendered | Custom Application Development — Mobile Application Suite |
| Certifications held | SOC 2 Type II; ISO/IEC 27001:2022; HIPAA-aligned engineering practices; AWS Advanced Consulting Partner; Microsoft Solutions Partner (Digital & App Innovation) |
| Tender contact | Priya Raman, Engagement Director · proposals@aventrasoftware.example · (512) 555-0182 |

The certification list above is complete. Any framework not named is one Aventra
does not hold, and we have not implied equivalence anywhere in this tender.

## Part B — Compliance statement against requirements R1–R11

| Req | Requirement (abbreviated) | Status | Note |
| --- | --- | --- | --- |
| R1 | Complete inspection and work-order forms on a district-issued mobile device | **Fully Compliant** | Native application delivered to the District's standard device platform, distributed through the District's device-management tooling. Configurable inspection and work-order form templates. A second mobile platform, if the fleet is mixed, is a Phase 2 item (Part G). |
| R2 | Function fully without connectivity, syncing automatically when available — **mandatory** | **Fully Compliant** | Offline-first architecture: the on-device store is the primary record, so every function above works with no signal. Sync is automatic and resumable on reconnection, with conflict handling and a per-record sync state visible to the technician. No feature in Phase 1 depends on live connectivity. |
| R3 | Capture photographs and attach to the relevant asset record | **Fully Compliant** | Photos captured on-device, compressed, tagged to the asset and inspection, queued offline, and uploaded on sync. |
| R4 | Capture technician signatures for completed work | **Fully Compliant** | On-screen signature capture stored with the completed work record and its timestamp. |
| R5 | Read asset barcodes and QR tags | **Fully Compliant** | On-device camera scanning of 1D barcodes and QR codes, resolving against the locally cached asset list so scanning works with no signal. Physical re-tagging of assets is excluded (Part H). |
| R6 | Record GPS coordinates against each inspection | **Fully Compliant** | Device GPS captured against each inspection, with accuracy recorded; capture does not require network connectivity. |
| R7 | Notify technicians of newly assigned work orders | **Fully Compliant** | Push notification on assignment, plus in-app assignment queue. Note honestly: push delivery is a network function. In the ~30% of the service area with no reliable signal, a technician receives new assignments at the next sync rather than instantly — no product can deliver a push to an unreachable device. |
| R8 | Supervisor view of work in progress across the district | **Fully Compliant** | Web-based supervisor view: work orders by status, technician and crew assignment, last-sync time per device, and completed inspections in list and map form across the District. Historical analytics, configurable report building, and scheduled exports are Phase 2 items (Part G). |
| R9 | Integrate with the District's Cityworks maintenance management system | **Partially Compliant** | Phase 1 delivers the integration that removes the re-keying backlog: work orders and their asset context flow **from** Cityworks to the app, and completed inspections, work-order closures, photos, signatures, and GPS flow **back into** Cityworks against the correct asset record, on an automated, monitored interface. Not included in Phase 1: bi-directional master-data synchronisation of the asset registry beyond the read-only cache, Cityworks workflow/business-rule configuration inside Cityworks itself, and any change to Cityworks-side licensing or hosting. These are Phase 2 items. |
| R10 | Authenticate technicians against existing Microsoft accounts | **Fully Compliant** | Single sign-on against the District's Microsoft Entra ID tenant using OpenID Connect, with role-based access control and least-privilege defaults; multi-factor authentication enforced for privileged accounts. Session tokens are cached securely on-device so a technician stays signed in through a full offline shift, with a re-authentication interval the District sets. |
| R11 | Meet WCAG 2.1 AA | **Fully Compliant** | All user interfaces — mobile and supervisor web — are designed and tested to WCAG 2.1 AA. Accessibility is validated each sprint with automated tooling and manual screen-reader testing, not deferred to a pre-launch audit. |

**Summary: 10 requirements Fully Compliant, 1 Partially Compliant, 0 Not
Compliant.** The single partial is R9, and the boundary is stated above rather
than left to be discovered after award. The mandatory requirement R2 is fully
met.

## Part C — Technical solution

### C1. Our understanding of the District's need

Your field teams need tools that work wherever they are — including with no
signal — and that get clean data back into your core systems without manual
re-entry.

Concretely, for Cedar Valley Water District:

- Ninety-one technicians inspect and repair assets across 1,340 miles of
  distribution main, impounding reservoirs, and 47 pump stations, and record
  that work on printed forms.
- Those forms travel back to the district office and are re-keyed into Cityworks
  by two administrative staff, producing routine backlogs of three to five days.
  For that window, Cityworks does not reflect the condition of the network.
- Roughly 30% of the service area has no reliable cellular signal, so an
  application that degrades when the signal drops would simply not be used —
  which is why R2 is mandatory and why it is the first thing we design for, not
  a feature added at the end.
- Supervisors currently have no way to see what is happening in the field until
  the paperwork arrives.

The measures we would expect this programme to be judged on: paper forms
eliminated for core field workflows, field data available in Cityworks in near
real time rather than after a three-to-five-day backlog, and a reduction in
data-entry errors and rework.

### C2. Proposed solution

We will deliver an offline-first mobile application for field staff: technicians
capture data, photos, signatures, and scans on-device, and everything syncs
automatically when connectivity returns. Supervisors get a live view of field
activity.

Phase 1 capabilities:

- **Offline-capable data capture with automatic sync.** The device-local store is
  the system of record until sync succeeds. Nothing is lost when a technician
  works a full shift out of coverage.
- **Inspection and work-order forms.** Configurable templates covering scheduled
  inspections, meter work, and emergency repairs, with required-field validation
  applied on-device.
- **Work-order assignment and tracking.** Assignments delivered to the technician's
  queue, with status through to completion.
- **Photo, signature, and barcode/QR capture**, each attached to the correct asset
  and inspection record.
- **GPS and location tagging** of every inspection.
- **Push notifications** for newly assigned work orders.
- **Supervisor view** of field activity across the District, in list and map form.

### C3. How offline operation actually works

Offline capability carries 25% of the District's evaluation alongside the
technical solution, and 30% of the service area has no reliable signal, so we
set out the mechanism rather than asserting the outcome.

1. **Local-first data store.** Each device holds an encrypted local database
   containing the technician's assigned work, the asset records they need, and
   every form template. Reads and writes go to that store first. The application
   behaves identically whether or not there is a signal — there is no "offline
   mode" to switch into.
2. **Pre-caching by route and area.** Before a shift, the app caches the assets
   and work orders relevant to the technician's assignments, so a full day in a
   no-signal area is normal operation rather than an exception.
3. **Durable outbound queue.** Completed inspections, photos, signatures, GPS
   fixes, and status changes are written to a persistent queue that survives app
   restart, battery death, and device reboot.
4. **Resumable, chunked sync.** When connectivity returns — including brief or
   weak windows — the queue drains oldest-first in small chunks, with resume from
   the last acknowledged chunk. A dropped connection mid-upload costs one chunk,
   not one shift. Photos upload after the record they belong to, so Cityworks
   never receives an orphaned image.
5. **Deterministic conflict handling.** Field observations are append-only and
   never overwrite each other. Where a work order has changed centrally while a
   technician held it offline, the rule is defined per field during discovery and
   applied consistently; anything that cannot be resolved automatically is
   surfaced to a supervisor rather than silently discarded.
6. **Visible sync state.** The technician always sees what has synced, what is
   pending, and when the device last reached the network. Supervisors see
   last-sync time per device, so an out-of-contact crew is visible as such rather
   than mistaken for an idle one.
7. **Proven in the field, not the lab.** Testing & Hardening includes a
   supervised field trial on District devices in a known no-signal part of the
   service area, including forced airplane-mode shifts, mid-sync interruption,
   and battery-loss recovery. Acceptance of R2 is evidenced against that trial.

### C4. Integration with Cityworks

Each integration is delivered through documented, versioned REST APIs with a
clear contract and explicit error handling. We prove every integration
end-to-end in a test environment before it reaches production, and we document
assumptions and data mappings for each connected system.

For Cityworks specifically, Phase 1 delivers:

- **Inbound:** work orders, their asset context, and the asset reference data the
  app caches for offline use.
- **Outbound:** completed inspections and work-order closures with their
  photographs, signatures, GPS coordinates, and timestamps, written against the
  correct asset record — replacing the manual re-keying performed today.
- **Operational qualities:** automated retry with backoff, idempotent writes so a
  retried sync cannot create duplicates, reconciliation reporting, and alerting
  on interface failure with diagnostics an administrator can act on.
- **Documentation:** a written interface specification and field-level data
  mapping, handed over with the code.

> **[NEEDS SME INPUT]** Cityworks-specific integration experience is not
> evidenced in Aventra's approved past-performance record, and the available
> API surface differs between Cityworks Online and on-premises AMS deployments
> and across versions. Confirm the District's Cityworks deployment and version,
> and confirm delivery-team familiarity, before submission. The Phase 1 price
> assumes a supported, documented Cityworks API is available to us from project
> start (Part H).

### C5. Technical approach

**Methodology.** We deliver in short, fixed-length sprints, each ending with a
working, demonstrable increment and a stakeholder review. Every engagement
begins with a fixed-scope discovery sprint that confirms requirements, design,
and a detailed plan before any build commitment, so scope and pricing reflect a
shared understanding of the work.

**Hosting.** The supervisor view and sync services are cloud-hosted on AWS,
Azure, or GCP (the District's choice), deployed with infrastructure-as-code so
environments are reproducible and auditable. We target 99.9% uptime during
business hours, with automated backups and a documented recovery objective. The
District retains ownership of the cloud accounts and all infrastructure code.
Given R10, an Azure deployment alongside the District's existing Microsoft
tenant is the natural default.

**Security.** Security is reviewed every sprint, not bolted on before launch.
All data is encrypted in transit (TLS 1.2+) and at rest (AES-256) — including
the on-device store, which matters more than usual here because inspection data
sits on a technician's device until it syncs. Privileged access requires
multi-factor authentication, and security-relevant events are audit-logged with
retention. We follow a secure SDLC with mandatory code review, run annual
third-party penetration tests, and maintain a documented vulnerability-management
and patching process. Aventra is SOC 2 Type II and ISO/IEC 27001:2022 aligned.

**Authentication.** We integrate with the District's existing identity provider
using SAML 2.0 or OpenID Connect for single sign-on, with role-based access
control and least-privilege defaults. Multi-factor authentication is enforced
for privileged accounts. For the District's Microsoft accounts this means
OpenID Connect against Microsoft Entra ID.

**Quality assurance.** Quality is built in: automated tests run in CI on every
change, all code is peer reviewed, and each release passes a security review
before go-live. We support a formal user-acceptance testing phase with District
staff and track defects to closure against agreed severity and response targets.
The offline field trial described at C3.7 is part of this phase.

**Accessibility.** All user interfaces are designed and tested to WCAG 2.1 AA
(and Section 508 where applicable). Accessibility is validated each sprint with
automated tooling and manual screen-reader testing, not deferred to a pre-launch
audit.

**Training and handover.** We deliver role-based training (administrators,
supervisors, and technicians), written and video documentation, and a live
knowledge-transfer session with the District's technical team. Full source code,
infrastructure-as-code, and documentation are handed over so the District is
self-sufficient — no vendor lock-in.

## Part D — Delivery programme and milestones

Commencement 20 April 2026, as set out at ITT section 4. Five phases over 22
weeks, each ending in a working, demonstrable increment and a stakeholder
review.

| Phase | Weeks | Dates | Milestone / deliverable |
| --- | --- | --- | --- |
| 1. Discovery & Design | 1–4 | 20 Apr – 15 May 2026 | Confirmed requirements and form templates; Cityworks interface specification; offline and conflict-resolution design; accessible UI design; detailed delivery plan. **M1: Design baseline accepted.** |
| 2. Foundation & Integrations | 5–10 | 18 May – 26 Jun 2026 | Application shell with offline store and sync engine; Entra ID single sign-on working end to end; Cityworks interface proven in a test environment. **M2: Offline sync and Cityworks interface demonstrated.** |
| 3. Core Build | 11–16 | 29 Jun – 7 Aug 2026 | Inspection and work-order forms; photo, signature, barcode/QR, and GPS capture; assignment queue and push notifications; supervisor view. **M3: Feature-complete build demonstrated.** |
| 4. Testing & Hardening | 17–19 | 10 Aug – 28 Aug 2026 | Supervised field trial on District devices in a no-signal area; user-acceptance testing with technicians and supervisors; accessibility validation; security review; defect closure. **M4: UAT and field trial signed off.** |
| 5. Launch & Stabilization | 20–22 | 31 Aug – 18 Sep 2026 | Phased rollout across crews; role-based training; documentation and video; knowledge transfer; hypercare. **M5: Go-live accepted; handover complete.** |

The programme fits inside the District's own dates: award 6 April, commencement
20 April, go-live before the end of September 2026.

**Dependencies on the District** are listed in Part H. The two that most affect
the programme are access to a Cityworks test environment by the start of Week 5,
and availability of technicians and a no-signal test route for the Week 17–19
field trial.

## Part E — Personnel

We staff dedicated delivery pods — the people who scope your project are the
people who build it.

| Name | Role | What they own on ITT 2026-07 |
| --- | --- | --- |
| Priya Raman | Engagement Director | Single point of accountability to the District; commercial and contractual escalation. |
| Marcus Bell | Solution Architect | Offline-first architecture, sync and conflict design, and the Cityworks and Entra ID interface designs. |
| Elena Duarte | Lead Engineer | Technical delivery and code quality of the mobile application, sync engine, and supervisor view. |
| Sofia Nguyen | UX Designer | Field research with technicians, form and workflow design, and accessible interface design to WCAG 2.1 AA. |
| David Okafor | Project Manager | The District's day-to-day contact for schedule, scope, and status; milestone reporting. |
| Grace Kim | QA & Security Lead | Test strategy, the offline field trial, accessibility validation, and the pre-release security review. |

Named personnel are committed to the programme for its duration. Any substitution
would be proposed to the District in advance with an equivalent or better
CV.

## Part F — Previous comparable work

Aventra Software Group has designed, built, and operated custom software for
mid-market and enterprise organizations since 2009, delivering more than 300
engagements across healthcare, government, education, financial services, and
manufacturing.

Representative engagements most comparable to ITT 2026-07:

| Engagement | Why it is comparable |
| --- | --- |
| Plant-floor production tracking application for a manufacturer, replacing a spreadsheet-based process across 4 facilities | The closest match to this ITT: frontline staff capturing structured operational data on devices at the point of work, replacing a paper and spreadsheet process, with the data flowing into the core system rather than being re-keyed. |
| ERP integrated with shop-floor IoT sensors for real-time operational dashboards | Field-originated data landing in a maintenance and operations system of record, with supervisor-facing real-time visibility — the R8/R9 pattern. |
| Benefits eligibility screening tool rebuilt for 400 caseworkers in a government agency, meeting Section 508 | Public-sector delivery at comparable user scale (400 users vs. the District's 91 technicians), with accessibility as a contractual requirement — evidence for R11. |
| Public permits-and-licensing portal for a mid-size county, moving 18 paper workflows online | Public-sector paper-to-digital conversion, including form design with the staff who use it and change management through rollout. |

**Stated plainly:** Aventra's approved past-performance record does not include a
water utility or a Cityworks implementation. Our comparable experience is in
frontline and field data capture, public-sector delivery, and integration into a
system of record — which is the substance of this ITT — but we would rather say
that clearly than imply sector experience we cannot evidence.

**References.** We provide at least three references from comparable engagements
— matched by industry and project type — on request, along with a summary of
the work delivered and outcomes achieved. References are released only with the
client's prior consent, so we ask for five business days' notice. If the
District requires named referees before award, please confirm and we will
initiate consent immediately.

## Part G — Pricing schedule

**Tendered price: $172,000, fixed**, against the Phase 1 scope described in
Parts B and C. This is within the District's secured budget of $180,000 and
leaves $8,000 of the District's provision uncommitted.

We propose a fixed price against the scope confirmed in discovery, itemized by
workstream, and invoiced on milestone completion. Change requests are handled
through a lightweight change-control process so cost and scope stay aligned.
Third-party license and hosting fees are called out separately and are not
marked up.

### G1. Phase 1 — tendered scope

| Line item | Amount |
| --- | ---: |
| Discovery, field research & solution design | $24,000 |
| Development & configuration — offline-first mobile application and supervisor view | $76,000 |
| Integrations — Cityworks interface and Microsoft Entra ID single sign-on | $27,500 |
| Asset reference data setup & offline cache configuration | $7,000 |
| Quality assurance, offline field trial & security testing | $20,500 |
| Training, documentation & launch | $10,000 |
| Project management | $7,000 |
| **Total tendered price (fixed)** | **$172,000** |

Payment is on milestone completion: M1 15%, M2 25%, M3 30%, M4 20%, M5 10%.

### G2. Why this is a reduced scope, and what that means

The District invited tenderers to identify functionality that cannot be
delivered within budget. Our indicative range for a full-scope field mobility
programme is $260,000–$600,000 over 8 months. Rather than compress that into
$180,000 — which would put the mandatory offline requirement at risk, since
offline sync is precisely where an underbid engagement cuts corners — we have
tendered a Phase 1 that delivers every requirement R1–R11 at a price we can
actually deliver, and named what sits outside it.

**Deferred to Phase 2 (not included in the $172,000):**

| Deferred item | Relates to | Indicative Phase 2 cost |
| --- | --- | ---: |
| Second mobile platform build, if the District's device fleet spans both iOS and Android | R1 | $26,000 – $34,000 |
| Bi-directional asset master-data synchronisation with Cityworks, beyond the Phase 1 read-only cache and inspection write-back | R9 | $22,000 – $30,000 |
| Supervisor historical analytics, configurable report building, and scheduled exports | R8 | $18,000 – $24,000 |
| Offline basemap and aerial imagery for asset location in no-signal areas | R6 (enhancement) | $12,000 – $18,000 |
| Meter-reading workflow module and route optimisation | Beyond R1–R11 | $17,000 – $24,000 |
| **Indicative Phase 2 total** | | **$95,000 – $130,000** |

Phase 2 figures are indicative planning numbers, not a tendered price, and are
offered so the District can see the whole path rather than discovering it after
award. Phase 1 is designed to stand alone: if Phase 2 is never funded, the
District still has paper eliminated, inspections in Cityworks within minutes of
sync rather than days, and supervisor visibility across the District.

### G3. Excluded from the tendered price

Quoted separately or provided by the District:

- Third-party software licences and subscriptions, including any Cityworks
  licence or API entitlement — passed through without markup where Aventra
  procures them.
- Ongoing cloud hosting and run costs after go-live.
- Hardware and end-user devices, including the district-issued mobile devices and
  their data plans.
- Physical asset tagging — printing and affixing barcode or QR labels to assets in
  the field.
- Post-launch care plan — optional, renewable, quoted as a separate annual
  figure (see below).
- Scope added after discovery, handled through change control.

### G4. Optional post-launch care plan

Every launch includes a defined post-launch care plan with a named support lead
and tiered service levels: critical issues acknowledged within 1 business hour,
high within 4, and standard within 1 business day. The care plan covers
monitoring, patching, and enhancements, and is quoted separately as an optional,
renewable service. We would be glad to price it on request; it is not included
in the $172,000 and does not consume the District's procurement budget for this
ITT.

The 22-week programme includes hypercare through Week 22 at no additional cost.

## Part H — Assumptions and exclusions

Our pricing assumes the scope described in the ITT, timely access to
stakeholders and source/target systems, and availability of test environments at
project start. Third-party licenses, ongoing hosting, and hardware are excluded
from the fixed fee. Integration unknowns are surfaced early in discovery and
managed through change control; a named support lead owns post-launch stability.

### H1. Assumptions specific to ITT 2026-07

Each of these is stated because it affects price or programme. If any is wrong,
we would rather know before award than raise a change request after it.

1. **Device fleet.** The District's 91 technicians carry a single standard mobile
   platform (all iOS or all Android). A mixed fleet requires the second-platform
   build priced in G2.
2. **Device management.** The District operates device-management tooling capable
   of distributing an in-house application to the fleet, and Aventra is not
   required to procure or administer it.
3. **Cityworks.** A supported, documented Cityworks API is available to Aventra
   from project start, with a non-production environment accessible by Week 5.
   No Cityworks-side configuration, customisation, upgrade, or licence change is
   within this tender.
4. **Identity.** The District operates Microsoft Entra ID, all 91 technicians hold
   accounts, and a test tenant or test accounts are available from Week 5.
5. **Asset tagging.** Assets carry, or the District will apply, machine-readable
   barcode or QR tags to a consistent standard. Physical tagging is excluded.
6. **Form scope.** Up to a defined set of inspection and work-order form templates
   is configured in Phase 1; the exact count is fixed at the end of Discovery and
   baselined at M1.
7. **Field trial access.** District technicians and a known no-signal route are
   available for the Week 17–19 field trial.
8. **Data migration.** Historical inspection records remain in Cityworks; no
   migration of historical paper or legacy records is within scope.
9. **Language.** English-language interfaces only.
10. **District decision turnaround.** Review and sign-off at each milestone within
    five business days.

### H2. Risks and how we manage them

| Risk | Management |
| --- | --- |
| Cityworks API proves more constrained than expected | Interface specification produced in Discovery (M1), before build commitment. If the API cannot support the Phase 1 interface, we bring options and cost impact to the District at M1 rather than at M4. |
| Offline behaviour differs in the real service area from the lab | The Week 17–19 field trial is run on District devices in an actual no-signal area, not simulated. Acceptance of R2 is evidenced against it. |
| Technician adoption | Field research with technicians in Discovery, technician participation in UAT, role-based training, and phased rollout by crew. |
| Scope pressure against a reduced Phase 1 | Phase 2 items are named and priced in G2 up front, so additions are a funding decision rather than a dispute. |

### H3. Open items for the District

- Confirmation of the Cityworks deployment type and version (see Part C4).
- Confirmation of the mobile device platform and management tooling.
- Whether named referees are required before award, given our five-business-day
  consent policy (Part F).

---

*Prepared for demonstration by the RFP Automation Kit. Aventra Software Group and all
details herein are fictional.*
