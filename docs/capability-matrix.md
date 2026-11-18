# Capability verification matrix: Managed IT and Cloud & Infrastructure

Internal record for the technical-depth update of 2026-11-18 (Hemang's 12-part brief, written after customer feedback asking for more technical detail, specific technologies and project examples). It lists what the two pages now say, what each statement rests on, and what is held back until someone confirms it.

- Pages: `/services/managed-it/`, `/services/cloud-infrastructure/`
- Evidence: the live site as approved on 2026-11-18, Hemang's brief, and a read of both delivery partners' public websites on 2026-11-18 (every service page of each). The partners are not named in this repo; they are **Partner A** and **Partner B** here.
- **Nothing in this file is published.** It is not linked from the site.

## Status classes

| Status | Meaning | On the pages? |
|---|---|---|
| **Confirmed** | Already published with approval, or a named part of a platform that is. | Yes |
| **Partner-documented** | A delivery partner describes it as a service on its own site. Needs commercial confirmation that TLS offers it. | Capabilities: yes, as draft copy awaiting approval. Named products: no. |
| **Practice** | A technical practice inside a confirmed or partner-documented capability (for example VLANs inside network segmentation). Named in the brief; no separate evidence. | Yes, as draft copy awaiting approval |
| **Proposed** | Named in the brief; no evidence found. Needs technical confirmation. | No |
| **Illustrative** | Educational only: diagrams and scenarios. Labeled as illustrative on the page. | Yes, labeled |
| **Excluded** | Ruled out by the brief or by the claims policy. | No |

**How the pages were drafted.** Capabilities follow the rule the two pages were first built on (CLAUDE.md names the partner research as their copy source): a capability is on the page if the brief asks for it and it is confirmed, partner-documented, or a practice inside one of those. **Named third-party products follow the stricter rule in the brief:** only confirmed ones are shown. Every new line is draft copy until Hemang approves it.

## 1. Named technologies

Controlled by `src/data/tech.ts`. Only `confirmed` entries render. To publish one, change its status there.

| Technology | Evidence | Status | Shown |
|---|---|---|---|
| Microsoft Azure, AWS, Google Cloud | Live on Cloud & Infrastructure since 2026-11-18. Partner A has a service page for each. | Confirmed | Yes |
| Microsoft 365 | Live on Managed IT ("Microsoft 365 administration"). Both partners. | Confirmed | Yes |
| Exchange Online, SharePoint, OneDrive, Microsoft Teams | Parts of Microsoft 365. Partner A: setup, migration and support of each. | Confirmed (part of a confirmed platform) | Yes |
| Microsoft Teams Phone | Live as "Microsoft Teams phones and conferencing". Partner A service page. | Confirmed | Yes |
| Windows Server, Active Directory | Partner A service page. | Partner-documented | No |
| Windows, macOS, iOS and iPadOS | Partner A support pages. | Partner-documented | No |
| Jamf, Apple Business Manager | Partner A service page for each. | Partner-documented | No |
| Google Workspace | Partner A service page. | Partner-documented | No |
| SentinelOne | Partner A: endpoint detection and response "powered by SentinelOne". | Partner-documented | No |
| Cisco Meraki, Fortinet, Ubiquiti | Partner A, one local landing page only ("takes over your existing ... stack"). | Partner-documented (thin) | No |
| VeloCloud SD-WAN | Partner A, two local landing pages. Not in the brief. | Partner-documented (thin) | No |
| Veeam, Datto, CrowdStrike, N-able, Kaseya | Partner A: logo images only, never in text. | Partner-documented (thin) | No |
| ConnectWise | Partner A: mentioned as its own ticketing data source. | Partner-documented (thin) | No |
| Microsoft Entra ID | Partner A: one passing mention. | Partner-documented (thin) | No |
| Microsoft Intune, Defender (all editions), Conditional Access as a product | Partner A blog posts only, not a service claim. | Proposed | No |
| Android | Not found. | Proposed | No |
| Linux, VMware, Hyper-V | Not found. | Proposed | No |
| Cisco (other than Meraki), Aruba, SonicWall, Palo Alto Networks | Not found. | Proposed | No |
| Acronis, Azure Backup, Azure Site Recovery | Not found. | Proposed | No |
| Sophos, Huntress | Not found. | Proposed | No |
| NinjaOne, Datto RMM, HaloPSA, Jira Service Management | Not found. | Proposed | No |
| Azure VMs, Virtual Network, App Service, Virtual Desktop; EC2, VPC, S3 | Not found by name (virtual desktops are described without a product). | Proposed | No |
| Defender for Cloud, Key Vault, Azure Firewall, Azure Policy, AWS IAM, CloudTrail, Security Hub, GuardDuty, Google SCC, FortiGate | Not found. | Proposed | No |
| Azure Monitor, Application Insights, CloudWatch, Google Cloud Operations, Grafana, Prometheus, OpenTelemetry, Sentry, Datadog, Azure DevOps | Not found. | Proposed | No |
| GitHub Actions | This website is deployed with it; not a published claim about client work. | Proposed | No |
| Terraform, Bicep, CloudFormation, Ansible, Docker, Kubernetes | Not found. | Proposed | No |

## 2. Cloud & Infrastructure: capabilities

Delivered by: delivery partner, under the TLS brand, unless noted.

| Wording on the page | Evidence | Status |
|---|---|---|
| Cloud migration and deployment; managed cloud on AWS, Azure, Google Cloud; hybrid, private and public cloud; virtualization and virtual desktops | Live since 2026-11-18 | Confirmed |
| Cloud readiness assessment and architecture; migration planned around dependencies | Partner A: reviews applications, data, permissions and dependencies before a migration plan | Partner-documented |
| Compute, storage, databases and virtual networks | What cloud infrastructure consists of; in the brief | Practice |
| Network design and implementation; network refresh; internet connectivity planning; server configuration and deployment | Live since 2026-11-18 | Confirmed |
| LAN, WAN and Wi-Fi; routing and switching; wireless access point placement; wireless coverage | Partner A: switches, firewalls, wireless access points in network refresh. Partner B: Wi-Fi consulting. (Left out on 2026-11-18 as unconfirmed; now asked for by the brief.) | Partner-documented |
| Network segmentation | Partner A: "redesign flat networks into segmented environments" | Partner-documented |
| VLANs; separate staff and guest networks | The term VLAN appears on neither partner site | Practice |
| Firewalls; secure remote access; VPN | Partner A: firewall readiness, remote access, VPN evaluation | Partner-documented |
| Site-to-site VPN between offices | VPN is documented; site-to-site is not named | Practice |
| Internet failover, redundant connectivity | Partner A: secondary circuits, failover routing | Partner-documented |
| SD-WAN | Partner A: "SD-WAN readiness", and installs on two local pages | Partner-documented (thin) |
| Quality of Service for voice and video; capacity planning | Not found | Practice |
| Network monitoring; configuration documentation; device lifecycle; planned upgrades; troubleshooting | Partner A: monitoring, asset records, network diagrams, refresh planning | Partner-documented |
| Structured cabling; office IT setup and relocation; data center relocation and colocation; hardware procurement | Live since 2026-11-18 | Confirmed |
| Racks and patch panels; cutover planning; network diagrams and technical documentation; hardware lifecycle planning | Partner A: rack organization, patch panel planning, cutover planning, network diagrams, asset management | Partner-documented |
| VoIP and unified communications; Microsoft Teams phones and conferencing; cloud backup; business continuity planning | Live since 2026-11-18 | Confirmed |
| Call queues; off-site backup; recovery testing; failover planning | Partner A: call queues and auto attendants, recovery drills. Partner B: off-site backup. | Partner-documented |
| Recovery targets (RTO and RPO) agreed for each system | Partner B: "Recovery objectives ... should be discussed and documented". The terms RTO and RPO appear on neither site. | Practice |
| Multi-factor authentication; role-based access; access reviews | Partner A: "access reviews, MFA planning, role-based permissions" | Partner-documented |
| Single sign-on; conditional access; least privilege | Not found as service claims | Practice |
| Firewall policies; intrusion prevention | Partner A: "Managed IPS & Firewall" (a list item) | Partner-documented (thin) |
| Security configuration reviews and hardening; encryption at rest and in transit; cloud logging and monitoring | Partner A: configuration review, "maintain encryption, backups and access controls", SIEM reporting | Partner-documented |
| Private networking for workloads; operating system hardening; controlled administrative access | Not found | Practice |
| Patch management; vulnerability assessments | Partner A: patching and maintenance, vulnerability scanning | Partner-documented |
| Backup schedules; retention; dependencies mapped; recovery priorities; restore tests; documented recovery procedures | Partner A: recovery order, routine recovery testing. Partner B: frequency, retention, documented objectives. | Partner-documented |

Held back from this page: cost and performance optimization, cloud governance, cloud security posture management, secrets management, zero-trust, privileged access management, immutable backups, data center infrastructure design, infrastructure automation (all **Proposed**: no evidence). TIA-568 and IEEE 802.3 are not cited: nothing shows the cabling work is done to those standards (**Proposed**).

## 3. Managed IT: capabilities

Delivered by: delivery partner, under the TLS brand, except application support (TLS).

| Wording on the page | Evidence | Status |
|---|---|---|
| Help desk; onboarding and offboarding; device management; hardware refresh and warranty replacement; proactive monitoring and maintenance; incident management; Microsoft 365 administration; application support and maintenance; backup and disaster recovery; asset management and procurement; IT documentation; co-managed IT | Live since 2026-11-18 | Confirmed |
| Remote technical support; account provisioning and identity administration; device enrollment and software installation | Both partners: remote support. Partner A: onboarding/offboarding, MDM, app deployment. | Partner-documented |
| Remote monitoring and management (RMM); servers, devices and network equipment | Partner B: "Remote Monitoring & Management". Partner A: monitors servers and critical systems. | Partner-documented |
| Patch management and software deployment; patch compliance; preventive maintenance | Partner A: patching and maintenance, a patch-management page, preventive maintenance. (Left out on 2026-11-18; now documented and asked for.) | Partner-documented |
| Device availability, CPU, memory and disk thresholds; capacity planning | Monitoring is documented; the specific readings are not | Practice |
| Root cause and recurring issue analysis; incident classification by impact; escalation | Live in "How Support Flows" (prioritized by business impact, root cause dealt with) | Confirmed |
| Change management; maintenance schedules | Partner A: scheduled maintenance. Change management is not named. | Practice |
| Operational reporting; IT improvement planning; license records | Partner A: monthly reporting, IT roadmap, software asset management | Partner-documented |
| Vulnerability remediation; vulnerability scanning | Partner A: vulnerability scanning, gap remediation | Partner-documented |
| Restore tests; backup health checks | Partner A: routine recovery testing. Partner B: "If we say something is protected, we've tested it." | Partner-documented |
| Multi-factor authentication; role-based access; access reviews; account provisioning and removal | Partner A | Partner-documented |
| Conditional access; single sign-on; least privilege | Not found as service claims | Practice |
| Mobile device management; configuration policies; remote lock and wipe | Partner A: "remote lock, selective wipe ... access removal" | Partner-documented |
| Tenant, user and license administration; Exchange Online, SharePoint, OneDrive, Teams | Both partners | Confirmed / Partner-documented |
| Anti-phishing and email filtering | Partner A: Microsoft-focused filtering to reduce phishing exposure | Partner-documented |
| SPF, DKIM and DMARC | Not found | Practice |
| Endpoint protection and detection (EDR) | Partner A: EDR. Partner B: endpoint protection and monitoring. | Partner-documented |
| Alert review and escalation within the agreed scope | Partner A: "investigates alerts". Partner B: scope set by agreement. | Partner-documented |
| Join, work, leave lifecycle | Live: onboarding and offboarding. Partner A: access removal procedures. | Partner-documented |
| Application health and error monitoring | Partner A: application monitoring. Live: application support. | Partner-documented |
| Bug investigation; planned maintenance; dependency and configuration management; database and API monitoring | TLS's own software work; live line "Applications we build for you can stay supported and maintained after launch" | Practice (TLS) |
| Websites: availability, hosting, DNS, SSL/TLS certificates, updates, backups | Not on either partner site. In the brief. Scoped on the page to software TLS builds, and other applications by agreement. | Practice (TLS): **confirm** |
| Release pipelines (CI/CD); release coordination; deployment checks; rollback planning; production incident investigation | Not on either partner site. TLS's own delivery practice. | Practice (TLS): **confirm** |
| Logs, metrics and traces; performance and capacity reviews; post-incident reviews | Not found | Practice (TLS): **confirm** |

Held back from this page: 24/7 monitoring or support (both partners advertise it; the brief says claim it only if coverage is confirmed), response times, SLAs, a security operations center, managed detection and response, digital forensics, ransomware guarantees, compliance certification, formal site reliability engineering, SLIs and SLOs, application performance monitoring as a named service, immutable backups, Microsoft 365 backup, Apple device management by name (all **Excluded** or **Proposed**).

## 4. Diagrams and scenarios (Illustrative)

| Item | Page | What it teaches | Label on the page |
|---|---|---|---|
| 01 Connected business network | Cloud | Connect, encrypt, segment, fail over, run | "Illustrative architecture" |
| 02 Layered security | Cloud | Five complementary layers; a refused request is logged; no layer catches everything | "Illustrative layered controls" |
| 03 Recovery timeline | Cloud | RPO and RTO; a backup is not a recovery plan | "Illustrative. Targets are agreed per system" |
| 05 Operational health | Managed IT | Detection and planned maintenance before anyone is affected | "Illustrative sample data" (bars and words, no figures) |
| 06 Employee lifecycle | Managed IT | Join, work, leave | None needed: a checklist, not data |
| 07 Managed device | Managed IT | Enroll, configure, patch, and an alert sent to a person | "Illustrative device lifecycle" |
| 08 Application observability | Managed IT | Signals narrow the search; a person confirms the cause | "Illustrative sample signals" |
| Four infrastructure use cases | Cloud | How a common situation would be approached | "Illustrative Infrastructure Use Cases"; each card "Illustrative scenario" |
| Four managed IT scenarios | Managed IT | Same | "Illustrative Managed IT Scenarios"; each card "Illustrative scenario" |

Diagram 04 (before and after infrastructure) was not built: the brief ties it to a real project, and the existing "From Accumulated to Designed" map already tells that story.

**No verified project exists** for either service in the repo's sources, so no project, client, technology-in-use or result is claimed. When a real project is approved, it should be written up as a case study in Insights and linked from the use-case section.

## 5. Needed from TLS

1. Approval of the draft copy on both pages, in particular the lines marked **Practice** and **confirm** above.
2. A decision on each **Partner-documented** technology in section 1 (switch on in `src/data/tech.ts`).
3. Whether SD-WAN, intrusion prevention and EDR should stay (thin or single-partner evidence).
4. Whether website support, release pipelines and observability are services TLS wants to offer, and to whom.
5. Real, authorized project examples (scope, technologies, who delivered, results, permission), if any exist.
6. Monitoring and support hours, if a coverage statement should ever be published.
