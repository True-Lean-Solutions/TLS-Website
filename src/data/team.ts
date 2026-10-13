/**
 * Core team and advisors. Verbatim from the About doc.
 * source: 17QpMfSbas3gC4XwfamL8SgRRytEN6Sj6UGkkwsEunKg (About Us 2026-09-27)
 * Photos downloaded into public/team/ (never Drive hotlinks). Since 2026-09-29
 * all but Sanket's are the office portraits Hemang supplied, cropped to a
 * shared eye line and head size (docs/sources.md §4).
 */
export interface Person {
  name: string;
  role: string;
  bio: string;
  photo: string; // path under public/, resolved with href()
  /** Omit when there is no profile to link: the card then shows no LinkedIn button. */
  linkedin?: string;
}

export const coreTeam: Person[] = [
  {
    name: 'Sajeed Lakhani',
    role: 'President & Founder',
    bio: "Sajeed founded True Lean Solutions with a clear vision: bring enterprise-grade technology thinking to small and mid-sized businesses that are ready to scale. He believes companies shouldn't need enterprise budgets to benefit from enterprise-level solutions — TLS delivers high-impact, practical solutions that improve efficiency, integrate systems, and enable data-driven decision-making.",
    photo: '/team/sajeed-lakhani.webp',
    linkedin: 'https://www.linkedin.com/in/sajeedlakhani/',
  },
  {
    name: 'Mack Akhani',
    role: 'CEO',
    bio: "Mack Akhani leads True Lean Solutions as CEO, bringing cross-industry experience across healthcare systems, global eCommerce, SaaS, and insurance. He joined TLS around a single conviction: that operational excellence isn't a consulting deliverable — it's a capability organizations have to own. Under his leadership, TLS translates Lean principles and structured delivery frameworks into measurable outcomes, helping clients move from operational chaos to sustainable, scalable performance.",
    photo: '/team/mack-akhani.webp',
    linkedin: 'https://www.linkedin.com/in/mackakhani/',
  },
  {
    name: 'Hemang Dwivedi',
    role: 'Operations and Technology Leader',
    bio: 'Hemang specializes in designing scalable technology solutions and system integrations across cloud, enterprise SaaS, and data platforms. He architects robust, cloud-enabled systems that improve performance, reliability, and data visibility — translating complex technical requirements into delivery-ready solutions. With experience spanning API development, workflow automation, and multi-platform integrations, Hemang bridges the gap between business operations and engineering execution. He has led technical workstreams across logistics, eCommerce, and professional services, consistently driving outcomes built to scale from day one.',
    photo: '/team/hemang-dwivedi.webp',
    linkedin: 'https://www.linkedin.com/in/hemang-dwivedi/',
  },
  {
    name: 'Kranthi Kumar Goli',
    role: 'QA Architect · Quality Engineering Lead · PMP Certified',
    bio: 'Kranthi is a QA Architect and PMP-certified leader who designs scalable automation frameworks and end-to-end quality ecosystems for enterprise platforms. He combines deep technical expertise in Selenium, Cucumber, TestNG, REST Assured, and CI/CD–DevOps integration with strong team leadership — coordinating onshore and offshore teams to deliver reliable, on-time outcomes. He builds resilient automation that turns manual testing into a fast safety net, catches defects early, reduces regression cycles, and embeds quality into the delivery pipeline. From strategy and architecture through execution and production, Kranthi owns project delivery with clear ownership and consistent follow-through across CRM and SaaS platforms.',
    photo: '/team/kranthi-kumar-goli.webp',
    linkedin: 'https://www.linkedin.com/in/kranthikumargoli/',
  },
  {
    name: 'Shruti Shrivastava',
    role: 'Marketing Manager',
    bio: 'Shruti specializes in strategic marketing and business growth across media and digital ecosystems. She focuses on building strong brand positioning and leading impactful campaigns that accelerate revenue and long-term value.',
    photo: '/team/shruti-shrivastava.webp',
    linkedin: 'https://www.linkedin.com/in/shruti-shrivastava-76308aa0/',
  },
];

export const advisors: Person[] = [
  {
    name: 'Nirav Kambodi',
    role: 'Advisor — Engineering & Delivery',
    bio: 'Nirav provides guidance on engineering best practices, delivery frameworks, and scalable solution design. His expertise helps ensure TLS solutions meet high standards of reliability, performance, and long-term sustainability.',
    photo: '/team/nirav-kambodi.webp',
    linkedin: 'https://www.linkedin.com/in/nirav-kambodi-011b9b76/',
  },
  {
    name: 'Mayank Pujara',
    role: 'Advisor — Product & Implementation',
    bio: 'Mayank advises TLS on aligning technology solutions with business needs, contributing strategic insight on implementation approaches, workflow optimization, and ensuring strong user adoption.',
    photo: '/team/mayank-pujara.webp',
    linkedin: 'https://www.linkedin.com/in/mayank-pujara-a0400a2/',
  },
  {
    name: 'Sanket Thakkar',
    role: 'Advisor — Growth & Strategy',
    bio: 'Sanket is a serial entrepreneur and the CEO & Co-Founder of IConflux Technologies, a software development company with a team of 100+ developers serving Fintech, Manufacturing, and Tech Startups globally. With over 13 years of building and scaling technology ventures, Sanket brings deep expertise in business growth, digital transformation, and POD-based delivery models. At TLS, he advises on growth strategy and market expansion.',
    photo: '/team/sanket-thakkar.webp',
    linkedin: 'https://www.linkedin.com/in/sanket-thakkar/',
  },
  // Hemang (2026-10-14, in chat): his LinkedIn entry, rewritten in the third
  // person like the other bios (approved by Hemang); dates left out until
  // confirmed. Office portrait cropped to the shared eye line.
  {
    name: 'Ketul Thakker',
    role: 'Advisor — Marketing Strategy & Campaigns',
    bio: "Ketul advises and mentors the CEO of True Lean Solutions on market positioning, marketing communications and campaign development. He helps translate TLS's delivery capabilities into clear client propositions and campaigns that reach the right audiences — refining messaging, guiding campaign design, and aligning marketing activity with business development priorities. Through ongoing collaboration with the CEO, he helps bring focus and consistency to how the company presents its services and pursues growth.",
    photo: '/team/ketul-thakker.webp',
    linkedin: 'https://www.linkedin.com/in/ketul-thakker-k-504b2824/',
  },
  // Hemang (2026-10-14, in chat): his copy, reframed with the dates removed
  // (Hemang); same facts. Office portrait cropped to the shared eye line.
  {
    name: 'Dharmendra Mistry',
    role: 'Former Advisor — Healthcare Operations & Solutions',
    bio: 'Dharmendra advised True Lean Solutions on healthcare operations and client delivery. A healthcare and medical technology executive with more than 30 years of experience, he built Biomet India from inception to about $10 million in four years, led the Zimmer Biomet integration in India, and headed Lumenis across India and South Asia. As co-founder of Valiant Care, he built and ran a 24/7 care service for seafarers, giving him first-hand experience of how clinical workflows really run. At TLS, he worked with hospitals and clinicians to find workflow gaps and turn them into clear requirements for the delivery team.',
    photo: '/team/dharmendra-mistry.webp',
    linkedin: 'https://www.linkedin.com/in/dharmendra-mistry-05470723/',
  },
];
