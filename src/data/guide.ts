/**
 * The current lead magnet: one guide, offered site-wide for an email address
 * (Hemang, 2026-11-21; see docs/decisions.md). The copy here describes the
 * PDF's own contents (its cover: 5 steps, 6 worksheets, a plan to December 31).
 * source: Drive 1YMc0Ts_swzw36ka4AENLJmxznN272MuP (the PDF in public/resources).
 */
import { site } from './site';

export const guide = {
  /** Sent with every submission and written to the sheet. */
  id: 'field-guide-2027',
  title: "Don't Carry That Problem Into 2027",
  kicker: 'Free field guide',
  /** One line for the floating card. */
  promise: 'Define, price and fix the business problem you carried all year, before December 31.',
  facts: ['5 practical steps', '6 printable worksheets', '18 pages'],
  /** Public path of the PDF; a download card for this file becomes the form. */
  file: '/resources/dont-carry-that-problem-into-2027-field-guide.pdf',
  /** The Insights post the guide belongs to; the card's title links to it. */
  post: '/insights/dont-carry-that-problem-into-2027/',
  /** Name the browser saves the PDF under. */
  downloadName: 'Dont-Carry-That-Problem-Into-2027-Field-Guide.pdf',
  button: 'Download the guide',
  /** The guide is tied to the year end: the floating card stops after this day. */
  lastDay: '2026-12-31',
  /** Pages where the floating card never appears. */
  quietPaths: ['/contact/', '/privacy-policy/', '/terms-of-service/', '/404/', '/tali/'],
} as const;

/** The form is live only once its endpoint is set. */
export const guideEnabled: boolean = site.guideEndpoint.length > 0;
