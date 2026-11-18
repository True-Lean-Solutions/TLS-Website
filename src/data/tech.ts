/**
 * Technologies named on the Managed IT and Cloud & Infrastructure pages
 * (2026-11-18). source: Hemang's technical-depth brief (2026-11-18) and the
 * partner capability research of the same day; the full record is
 * docs/capability-matrix.md.
 *
 * ONLY `confirmed` ENTRIES ARE SHOWN ON THE SITE. The brief lists the rest as
 * candidates, to be published once Hemang confirms each one. To publish a
 * technology, change its status to 'confirmed' here; nothing else needs to
 * change.
 *
 *   confirmed ...... already published on the site with approval, or a named
 *                    part of a platform that is.
 *   partner ........ a delivery partner documents it as a service on its own
 *                    site. Needs commercial confirmation.
 *   partner-thin ... a delivery partner mentions it only in passing, or shows
 *                    only a logo. Needs commercial confirmation.
 *   proposed ....... named in the brief; no evidence found. Needs technical
 *                    confirmation.
 */
export type TechStatus = 'confirmed' | 'partner' | 'partner-thin' | 'proposed';
export type TechPage = 'cloud' | 'it';

export interface Tech {
  name: string;
  status: TechStatus;
}
export interface TechCategory {
  title: string;
  pages: TechPage[];
  items: Tech[];
}

const t = (status: TechStatus, ...names: string[]): Tech[] => names.map((name) => ({ name, status }));

export const techCategories: TechCategory[] = [
  {
    title: 'Cloud platforms',
    pages: ['cloud', 'it'],
    items: [
      // Live on Cloud & Infrastructure since 2026-11-18 ("Managed cloud on AWS, Microsoft Azure and Google Cloud").
      ...t('confirmed', 'Microsoft Azure', 'Amazon Web Services (AWS)', 'Google Cloud'),
      ...t('proposed', 'Azure Virtual Machines', 'Azure Virtual Network', 'Azure App Service', 'Azure Virtual Desktop', 'Amazon EC2', 'Amazon VPC', 'Amazon S3'),
    ],
  },
  {
    title: 'Microsoft 365',
    pages: ['it'],
    items: [
      // "Microsoft 365 administration" is live on Managed IT; the four below are its parts.
      ...t('confirmed', 'Microsoft 365', 'Exchange Online', 'SharePoint', 'OneDrive', 'Microsoft Teams'),
      ...t('partner-thin', 'Microsoft Entra ID'),
      ...t('proposed', 'Microsoft Intune', 'Microsoft Defender for Business', 'Microsoft Defender for Office 365'),
    ],
  },
  {
    title: 'Communications and collaboration',
    pages: ['cloud'],
    items: [
      // "Microsoft Teams phones and conferencing" is live on Cloud & Infrastructure.
      ...t('confirmed', 'Microsoft 365', 'Microsoft Teams Phone'),
    ],
  },
  {
    title: 'Network infrastructure',
    pages: ['cloud'],
    items: [...t('partner-thin', 'Cisco Meraki', 'Fortinet', 'Ubiquiti UniFi'), ...t('proposed', 'Cisco', 'Aruba Networking', 'SonicWall', 'Palo Alto Networks')],
  },
  {
    title: 'Servers and virtualization',
    pages: ['cloud', 'it'],
    items: [...t('partner', 'Windows Server', 'Active Directory'), ...t('proposed', 'Linux', 'VMware', 'Microsoft Hyper-V')],
  },
  {
    title: 'Devices and operating systems',
    pages: ['it'],
    items: [...t('partner', 'Windows', 'macOS', 'iOS and iPadOS', 'Apple Business Manager', 'Jamf', 'Google Workspace'), ...t('proposed', 'Android')],
  },
  {
    title: 'Endpoint security',
    pages: ['it'],
    items: [...t('partner', 'SentinelOne'), ...t('partner-thin', 'CrowdStrike Falcon'), ...t('proposed', 'Microsoft Defender for Endpoint', 'Sophos', 'Huntress')],
  },
  {
    title: 'Cloud and network security',
    pages: ['cloud'],
    items: [
      ...t('proposed', 'Microsoft Defender for Cloud', 'Azure Key Vault', 'Azure Firewall', 'Azure Policy', 'AWS IAM', 'AWS CloudTrail', 'AWS Security Hub', 'Amazon GuardDuty', 'Google Cloud Security Command Center', 'Fortinet FortiGate'),
    ],
  },
  {
    title: 'Backup and recovery',
    pages: ['cloud', 'it'],
    items: [...t('partner-thin', 'Veeam', 'Datto'), ...t('proposed', 'Acronis', 'Azure Backup', 'Azure Site Recovery')],
  },
  {
    title: 'Monitoring and service management',
    pages: ['it'],
    items: [...t('partner-thin', 'ConnectWise', 'N-able', 'Kaseya'), ...t('proposed', 'NinjaOne', 'Datto RMM', 'HaloPSA', 'Jira Service Management')],
  },
  {
    title: 'Application monitoring and delivery',
    pages: ['it'],
    items: [
      ...t('proposed', 'Azure Monitor', 'Azure Application Insights', 'Amazon CloudWatch', 'Google Cloud Operations', 'Grafana', 'Prometheus', 'OpenTelemetry', 'Sentry', 'Datadog', 'GitHub Actions', 'Azure DevOps'),
    ],
  },
  {
    title: 'Infrastructure automation',
    pages: ['cloud'],
    items: [...t('proposed', 'Terraform', 'Azure Bicep', 'AWS CloudFormation', 'Ansible', 'Docker', 'Kubernetes')],
  },
];

/** The categories to show on a page: confirmed technologies only. */
export function techFor(page: TechPage): { title: string; items: string[] }[] {
  return techCategories
    .filter((c) => c.pages.includes(page))
    .map((c) => ({ title: c.title, items: c.items.filter((i) => i.status === 'confirmed').map((i) => i.name) }))
    .filter((c) => c.items.length > 0);
}
