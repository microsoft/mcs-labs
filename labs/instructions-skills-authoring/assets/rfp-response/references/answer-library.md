# Reusable answer library

Pre-approved answers to the questions that recur in almost every RFP. Reuse these rather than composing new ones — they are the vetted position Aventra can actually commit to, and rewriting them from memory is how a proposal ends up promising a service level nobody agreed to.

Adapt wording to the buyer's phrasing, but keep every commitment (standards, timeframes, certifications) exactly as written. If a requirement isn't covered here, by an offering's detail file, or by the past-performance record, flag it rather than inventing an answer.

| Topic key | Covers |
| --- | --- |
| `company_overview` | About Aventra Software Group — company, about, background, overview, who are you, history |
| `methodology` | Delivery methodology — methodology, approach, process, agile, sprint, how do you deliver |
| `security` | Security — security, encryption, penetration, vulnerability, secure, threat |
| `data_privacy` | Data privacy — privacy, pii, gdpr, data protection, personal data, retention |
| `accessibility` | Accessibility — accessibility, wcag, 508, ada, screen reader, accessible |
| `hosting` | Hosting and infrastructure — hosting, infrastructure, cloud, aws, azure, gcp |
| `sso` | Authentication and single sign-on — sso, single sign-on, authentication, saml, oauth, oidc |
| `integration_approach` | Integration approach — integration, integrate, api, interface, connect, interoperability |
| `quality_assurance` | Quality assurance and testing — quality, qa, testing, test, automation testing, defect |
| `support_sla` | Support and service levels — support, sla, maintenance, warranty, help desk, post-launch |
| `training` | Training and knowledge transfer — training, knowledge transfer, onboarding, documentation, adoption, change management |
| `pricing_approach` | Pricing approach — pricing, price, cost, fee, budget, payment |
| `references` | References — reference, referral, past clients, customer references, testimonial |
| `assumptions` | Assumptions, exclusions, and risks — assumption, exclusion, risk, dependency, out of scope, constraint |
| `why_aventra` | Why Aventra — why, differentiator, why choose, what makes you, unique, advantage |


## About Aventra Software Group  `company_overview`

**Triggers on:** company, about, background, overview, who are you, history, experience firm

Aventra Software Group has designed, built, and operated custom software for mid-market and enterprise organizations since 2009, delivering more than 300 engagements across healthcare, government, education, financial services, and manufacturing. We specialize in modernizing legacy systems, unifying fragmented data, and shipping applications that teams adopt without a fight.


## Delivery methodology  `methodology`

**Triggers on:** methodology, approach, process, agile, sprint, how do you deliver, sdlc

We deliver in short, fixed-length sprints, each ending with a working, demonstrable increment and a stakeholder review. Every engagement begins with a fixed-scope discovery sprint that confirms requirements, design, and a detailed plan before any build commitment, so scope and pricing reflect a shared understanding of the work.


## Security  `security`

**Triggers on:** security, encryption, penetration, vulnerability, secure, threat, cyber

Security is reviewed every sprint, not bolted on before launch. All data is encrypted in transit (TLS 1.2+) and at rest (AES-256), privileged access requires multi-factor authentication, and security-relevant events are audit-logged with retention. We follow a secure SDLC with mandatory code review, run annual third-party penetration tests, and maintain a documented vulnerability-management and patching process. Aventra is SOC 2 Type II and ISO/IEC 27001:2022 aligned.


## Data privacy  `data_privacy`

**Triggers on:** privacy, pii, gdpr, data protection, personal data, retention, hipaa, ferpa

We handle personal and sensitive data on a least-privilege, need-to-know basis, with role-based access control and full audit logging. Data classification, retention, and disposal are defined per engagement to meet the applicable framework (e.g. HIPAA, FERPA, GLBA). We support data residency requirements and provide data export and deletion on request.


## Accessibility  `accessibility`

**Triggers on:** accessibility, wcag, 508, ada, screen reader, accessible

All user interfaces are designed and tested to WCAG 2.1 AA (and Section 508 where applicable). Accessibility is validated each sprint with automated tooling and manual screen-reader testing, not deferred to a pre-launch audit.


## Hosting and infrastructure  `hosting`

**Triggers on:** hosting, infrastructure, cloud, aws, azure, gcp, uptime, availability, sla hosting

Solutions are cloud-hosted on AWS, Azure, or GCP (your choice), deployed with infrastructure-as-code so environments are reproducible and auditable. We target 99.9% uptime during business hours, with automated backups and a documented recovery objective. You retain ownership of the cloud accounts and all infrastructure code.


## Authentication and single sign-on  `sso`

**Triggers on:** sso, single sign-on, authentication, saml, oauth, oidc, login, identity

We integrate with your existing identity provider using SAML 2.0 or OpenID Connect for single sign-on, with role-based access control and least-privilege defaults. Multi-factor authentication is enforced for privileged accounts.


## Integration approach  `integration_approach`

**Triggers on:** integration, integrate, api, interface, connect, interoperability, middleware

Each integration is delivered through documented, versioned REST APIs with a clear contract and explicit error handling. We prove every integration end-to-end in a test environment before it reaches production, and we document assumptions and data mappings for each connected system.


## Quality assurance and testing  `quality_assurance`

**Triggers on:** quality, qa, testing, test, automation testing, defect, uat

Quality is built in: automated tests run in CI on every change, all code is peer reviewed, and each release passes a security review before go-live. We support a formal user-acceptance testing phase with your team and track defects to closure against agreed severity and response targets.


## Support and service levels  `support_sla`

**Triggers on:** support, sla, maintenance, warranty, help desk, post-launch, service level, response time

Every launch includes a defined post-launch care plan with a named support lead and tiered service levels: critical issues acknowledged within 1 business hour, high within 4, and standard within 1 business day. The care plan covers monitoring, patching, and enhancements, and is quoted separately as an optional, renewable service.


## Training and knowledge transfer  `training`

**Triggers on:** training, knowledge transfer, onboarding, documentation, adoption, change management

We deliver role-based training (administrators, staff, and end users), written and video documentation, and a live knowledge-transfer session with your technical team. Full source code, infrastructure-as-code, and documentation are handed over so your organization is self-sufficient — no vendor lock-in.


## Pricing approach  `pricing_approach`

**Triggers on:** pricing, price, cost, fee, budget, payment, rate, invoice

We propose a fixed price against the scope confirmed in discovery, itemized by workstream, and invoiced on milestone completion. Change requests are handled through a lightweight change-control process so cost and scope stay aligned. Third-party license and hosting fees are called out separately and are not marked up.


## References  `references`

**Triggers on:** reference, referral, past clients, customer references, testimonial

We provide at least three references from comparable engagements — matched by industry and project type — on request, along with a summary of the work delivered and outcomes achieved.


## Assumptions, exclusions, and risks  `assumptions`

**Triggers on:** assumption, exclusion, risk, dependency, out of scope, constraint

Our pricing assumes the scope described in the RFP, timely access to stakeholders and source/target systems, and availability of test environments at project start. Third-party licenses, ongoing hosting, and hardware are excluded from the fixed fee. Integration unknowns are surfaced early in discovery and managed through change control; a named support lead owns post-launch stability.


## Why Aventra  `why_aventra`

**Triggers on:** why, differentiator, why choose, what makes you, unique, advantage

Fixed-scope discovery before any build commitment; dedicated delivery pods where the people who scope your project are the people who build it; accessibility and security reviewed every sprint; and full handover of code, infrastructure, and documentation with a defined post-launch care plan. You are never locked in.

