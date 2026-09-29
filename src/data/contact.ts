/**
 * Contact page: the four stages the contact form is presented in. UI labels
 * only. The form's fields, labels, validation and sending are unchanged (see
 * ContactForm.astro and CLAUDE.md § Contact form contract).
 * Source: Hemang's Contact page brief, 2026-09-29.
 */
export const contactStages = [
  { n: '01', name: 'About you' },
  { n: '02', name: 'Timeline' },
  { n: '03', name: 'The problem' },
  { n: '04', name: "Let's talk" },
] as const;
