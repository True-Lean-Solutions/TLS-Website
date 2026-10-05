/**
 * Ordinary conversation: greetings, thanks, goodbyes, "how are you",
 * reactions, and questions about Tali itself. Answered locally and briefly,
 * never from the knowledge base, with no sales pitch and no chips where
 * they'd be noise (after "thanks" or "bye").
 *
 * Replies vary with the turn, so Tali doesn't repeat itself word for word.
 */
import { CONTACT } from './knowledge';
import type { Reply } from './engine';
import type { Social } from './understand';

/** Pick a variant for this turn (deterministic, so tests are stable). */
export const variant = <T>(list: T[], turn: number) => list[turn % list.length];

/** "hiiii" → "Hiiii", "good morning" → "Good morning", anything else → "Hi". */
export function greetingWord(text: string) {
  const m = text.match(/^(hi+|hey+|hello+|hiya|howdy|good (morning|afternoon|evening|day))/);
  if (!m) return 'Hi';
  const w = m[0];
  return w.charAt(0).toUpperCase() + w.slice(1);
}

export function socialReply(kind: Social, opts: { text: string; turn: number; starters: string[] }): Reply {
  const { text, turn, starters } = opts;
  const v = <T>(list: T[]) => variant(list, turn);
  switch (kind) {
    case 'greeting':
      return {
        intent: 'greeting',
        mood: 'idle',
        text: `${greetingWord(text)}! 👋 ${turn <= 1 ? "I'm Tali. " : ''}${v(['What can I help you with?', 'What can I help you with today?', 'What are you working on?'])}`,
        chips: starters.slice(0, 3),
      };
    case 'howAreYou':
      return {
        intent: 'smalltalk',
        text: v(["I'm doing great and ready to help. What are you working on?", 'All good here, thanks for asking! What can I help you with?', "Doing well! What's on your mind today?"]),
      };
    case 'whatDoing':
      return { intent: 'smalltalk', text: "I'm here to help you explore TLS, answer questions, or figure out where to start." };
    case 'present':
      return { intent: 'smalltalk', text: "I'm here! 👋 What can I help you with?" };
    case 'thanks':
      return { intent: 'thanks', mood: 'success', text: v(["You're welcome! 😊", 'Happy to help!', 'Anytime. Let me know if you want to explore anything else.']) };
    case 'bye':
      return { intent: 'goodbye', mood: 'success', text: v(['See you! 👋', "Sounds good. I'll be here if you need anything else.", 'Take care! 👋']) };
    case 'ack':
      return { intent: 'ack', text: v(["Sounds good. I'm here if you need anything.", 'Got it. Just ask whenever you\'re ready.', 'Okay! What would you like to look at next?']) };
    case 'positive':
      return { intent: 'ack', text: v(['Thanks! 😊 What would you like to explore?', 'Glad you think so. What can I help you with?', 'Glad that helps! Anything else on your mind?']) };
    case 'laugh':
      return { intent: 'ack', text: v(['😄 What else can I help you with?', 'Ha! Anything else I can help with?']) };
    case 'identity':
      return {
        intent: 'identity',
        text: "I'm Tali, the AI assistant for True Lean Solutions. I can help you explore TLS solutions, answer questions about our services and products, or help you figure out what might fit your business challenge.",
      };
    case 'isBot':
      return {
        intent: 'identity',
        text: "Yes — I'm Tali, an AI assistant, not a person. I know True Lean Solutions well, and I can help you think through a business or technology challenge.",
      };
    case 'isHuman':
      return {
        intent: 'identity',
        text: "No — I'm Tali, an AI assistant. If you'd like to talk to a person, the team is easy to reach.",
        links: [CONTACT.page],
      };
    case 'capabilities':
      return {
        intent: 'identity.capabilities',
        text: 'I can help you explore TLS solutions, answer questions about our services and products, or help you think through a business or technology challenge.',
        chips: starters.slice(0, 3),
      };
  }
}
