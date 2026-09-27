/**
 * Client testimonials — verbatim from the reviews sheet, attributed exactly.
 * source: 14l3c8EBTcWbMgiaQrEG1iVOcNndLP1iXntZTG2-hDp8 (TLS Client Reviews 2026-09-27)
 * Do not edit wording. Do not invent. Mayank's position reads exactly
 * "CEO · TLS advisor" (CLAUDE.md decision 6).
 */
export interface Testimonial {
  name: string;
  company?: string;
  position: string;
  initials: string;
  date: string; // ISO
  stars: number;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    name: 'Greg Hackbart',
    company: 'UV Concepts',
    position: 'Chief Growth Officer',
    initials: 'G.H.',
    date: '2026-08-06',
    stars: 5,
    quote:
      'I am writing to share our experience working with True Lean Solutions and to highly recommend your team to anyone in need of Salesforce support and development. Over the course of several months, True Lean Solutions has handled a wide range of contracted Salesforce work for us, including custom object creation, dashboard and report development, ongoing system maintenance, and user education. At every level, the work has been outstanding.\n\nWhat stands out most is how responsive and organized your team is. Requests are answered quickly, and every project or task is managed with clear, consistent communication. We always know exactly where things stand, what remains to be done on our end, what your team needs from us to move forward, and how billing works. That level of transparency has made our partnership easy, enjoyable and productive.\n\nBeyond responsiveness, your team brings a genuine depth of Salesforce expertise built over many years. Rather than simply executing on requests as they come in, your team consistently asks the right questions to understand the outcome we are really trying to achieve. That habit of asking “why” has repeatedly led us toward better, more usable solutions than what we originally had in mind, and it reflects the kind of thoughtful partnership that is hard to find.\n\nJust as important as the technical work is the experience of working with your people. Across the entire True Lean Solutions team, we have found everyone to be genuinely nice, honest, and enjoyable to work with. Hemang, who served as our main point of contact and project manager, has been fantastic, and a big part of why this partnership has felt so easy and trustworthy.\n\nI would recommend True Lean Solutions to any organization looking for Salesforce support, whether the need is as simple as adding a few fields or as complex as building new objects, flows, or fully customized solutions. Your team’s combination of technical depth, responsiveness, and genuine care for our outcomes has made a real difference for us, and we are grateful for the partnership.\n\nPlease feel free to use this letter as a reference, and don’t hesitate to have prospective clients reach out to me directly if it would be helpful.',
  },
  {
    name: 'Hisayoshi Miyata',
    company: 'NRI North America',
    position: 'Managing Director',
    initials: 'H.M.',
    date: '2026-02-28',
    stars: 5,
    quote:
      'We truly appreciate the opportunity to work with the TLS team.\n\nWe’ve been very pleased with the strong engagement and the consistent efforts your team has made to be a thoughtful and reliable partner throughout our collaboration.',
  },
  {
    name: 'Mayank Pujara',
    position: 'CEO · TLS advisor',
    initials: 'M.P.',
    date: '2026-03-11',
    stars: 5,
    quote:
      'I had been using a stock tracking application built in Microsoft Excel and VBA for years, but it had been broken for over 1.5 years and no one was able to fix it. The file was critical for tracking my trades and monitoring performance, and its failure significantly disrupted my workflow.\n\nHemang from True Lean Solutions quickly understood the Excel-VBA system, identified the root cause, and fixed the application in a matter of hours. Within the same timeframe, he also added new functionality that improved trade tracking and overall usability.\n\nI now have a fully functional, stable, and enhanced system, and I highly recommend True Lean Solutions for solving complex technical problems quickly and efficiently.',
  },
];
