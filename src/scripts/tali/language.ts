/**
 * Tali's language layer: turns what a visitor typed into clean, comparable
 * text before anything tries to understand it.
 *
 *   emoji ...... 👋 → "hi", 👍 → "ok", 🙏 → "thanks", 😂 → "haha"
 *   normalize .. lower case, no punctuation, "&" → "and"
 *   slang ...... u → you, abt → about, thx → thanks, wanna → want to, …
 *   typos ...... "meting inteligence" → "meeting intelligence" (Damerau–
 *                Levenshtein against the words Tali knows)
 *
 * No DOM, no network: shared by understand.ts, general.ts and engine.ts.
 */
import { ENTITIES } from './knowledge';

const EMOJI: [RegExp, string][] = [
  [/👋|🙋/gu, ' hi '],
  [/👍|👌|✅|🆗|🤝/gu, ' ok '],
  [/🙏/gu, ' thanks '],
  [/❤️|❤|😍|🥰|💯|🔥|👏|🙌|🤩/gu, ' love it '],
  [/😂|🤣|😆|😄|😁|😅|😹/gu, ' haha '],
  [/😊|🙂|😀|☺️|😃/gu, ' smile '],
];

export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9.+\-\s]/g, ' ')
    // Sentence-ending dots go; dots inside a word (make.com) stay.
    .replace(/\.+(?=\s|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Informal spellings → the words the rest of Tali expects. */
const SLANG: Record<string, string> = {
  u: 'you', yu: 'you', ur: 'your', urs: 'yours', r: 'are', abt: 'about', bout: 'about',
  pls: 'please', plz: 'please', plss: 'please', pleasee: 'please',
  thx: 'thanks', thnx: 'thanks', thanx: 'thanks', thnks: 'thanks', tnx: 'thanks', tks: 'thanks',
  ty: 'thank you', tysm: 'thank you so much', tyvm: 'thank you very much',
  wanna: 'want to', gonna: 'going to', gotta: 'have to', lemme: 'let me', gimme: 'give me', kinda: 'kind of', sorta: 'sort of',
  whats: 'what is', wats: 'what is', wat: 'what', hows: 'how is', thats: 'that is', whos: 'who is', wheres: 'where is', its: 'it is',
  dont: 'do not', doesnt: 'does not', didnt: 'did not', cant: 'cannot', wont: 'will not', isnt: 'is not', arent: 'are not',
  im: 'i am', ive: 'i have', youre: 'you are', theyre: 'they are', whatre: 'what are',
  hlo: 'hello', helo: 'hello', hallo: 'hello', hellow: 'hello', heyo: 'hey', hai: 'hi', gm: 'good morning',
  ppl: 'people', bc: 'because', cuz: 'because', coz: 'because', info: 'information', msg: 'message',
  k: 'ok', kk: 'ok', okk: 'ok', okie: 'ok', oki: 'ok', okey: 'okay', alr: 'alright',
  yeah: 'yes', yea: 'yes', yep: 'yes', yup: 'yes', nah: 'no', nope: 'no',
  hru: 'how are you', wyd: 'what are you doing', sup: 'what is up', wassup: 'what is up', wazzup: 'what is up',
  cya: 'see you', ttyl: 'talk later', brb: 'be right back',
};

/** Damerau–Levenshtein distance, capped (early exit above `max`). */
export function dist(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let best = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      best = Math.min(best, d[i][j]);
    }
    if (best > max) return max + 1;
  }
  return d[a.length][b.length];
}

/* Two vocabularies:
   TARGETS ... Tali's own words (solutions, pricing, problems, small talk).
               A typo is corrected towards one of these: "meting" → "meeting".
   KNOWN ..... every word Tali recognizes, including everyday English. A known
               word is never "corrected" ("would" stays "would", "tali" stays
               "tali"), and nothing is ever corrected *into* everyday English. */
const TARGETS = new Set<string>();
const KNOWN = new Set<string>();
const split = (s: string) => norm(s).split(' ').filter((w) => w.length >= 3);
/** Add Tali's own vocabulary: recognized, and a typo-correction target. */
export const learn = (s: string) =>
  split(s).forEach((w) => {
    TARGETS.add(w);
    KNOWN.add(w);
  });
/** Add words that must be left alone, but never corrected towards. */
export const protect = (s: string) => split(s).forEach((w) => KNOWN.add(w));

ENTITIES.forEach((e) => [e.name, ...e.aliases].forEach(learn));
[
  'price pricing cost costs much fee fees rate budget charge charges charging process steps work works started start include includes included features details security secure private privacy data controlled control deploy deployment premises fit suitable solutions services offer offers provide provides company team founder founded history story clients customers insights articles blog case studies contact email phone call book demo discuss project help choose recommend thanks hello goodbye human person expert automation automate automated integration software meeting visibility assessment baseline',
  'service solution article insight project process',
  'nice cool okay great awesome amazing perfect understood helpful bye later anyone anybody haha hehe smile lovely excellent alright',
  'difference between compare versus define definition example',
  'copying copied paste retyping rekeying entering entry manual manually wasting spending moving transfer emails spreadsheet spreadsheets excel approvals approval approve approving reporting reports report dashboard requests request tickets invoices disconnected legacy outdated problem struggling challenge',
  'customer client request inquiry inquiries invoice purchase platform platforms',
  'instructions prompt reveal configuration certification certified compliant compliance guarantee guaranteed policy refund employees weekends',
  'artificial intelligence machine learning language model generative agent agents chatbot workflow robotic api apis interface middleware custom saas cloud computing crm erp cybersecurity analytics dashboards business seo search engine optimization staff augmentation contract hire digital transformation lean thinking mvp minimum viable product',
].forEach(learn);
[
  'tali free built made created programmed trained morning afternoon evening night code source own owner talk talking meaning means mean change changes promise promises come comes world weather football cricket movie music recipe joke',
  'actually instead forget never mind wait about this that these those them something anything everything nothing else other another more tell explain please sounds good doing there love sweet neat noted',
  'copy typing hours waste spend form forms system systems tools talk connected sync slow issue issues trouble order orders ticket feeds review reviews someone somewhere mix internal',
  'safe safety same save sale sales stack shop sharing share track trust term terms time times today tomorrow week weekly month monthly year yearly ignore secret system',
  'would could should which their there where when while with from have they will been were said each does done here many such through being really every needs needed helps still thing things people already again both before never always maybe sure kind sort part place point number around without within using used able best better different long little right left down keep find found feel seem move live stay turn case line hand hour week days ready sound just know take into year good than then look only over also back after first well even want because give most very your make made like think working worked going getting wants wanted knows thank show shows told looks looking says thought trying tried whats whatever whole wish worth wrong yours yourself',
  'above across against along among anything anyway apart asked away basic basically become began behind below beside beyond bring brings came cannot care certain clear close coming course current daily deal doesnt during early easy either enough ever fact fast few fine follow full gets given gives goes gone group hard having heard high hold home however idea important inside keep kept knew known large last least less level likely list lose lost lots main makes making manage matter might minute minutes miss money must name near next none often once open others pass past plan possible pretty quick quickly quite rather real reason reach rest seen send sent several short side since single small sometimes soon stop taken taking those though three till together took toward true under unless until upon useful usually various ways went whether whose wonder word words write written years yesterday young',
].forEach(protect);

export function correct(word: string) {
  if (word.length < 4 || KNOWN.has(word) || /\d/.test(word)) return word;
  const max = word.length >= 7 ? 2 : 1;
  let best = word;
  let bestD = max + 1;
  for (const w of TARGETS) {
    if (Math.abs(w.length - word.length) > max || w[0] !== word[0]) continue;
    const d = dist(word, w, max);
    if (d < bestD) (best = w), (bestD = d);
  }
  return best;
}

/** Emoji → words, normalize, expand slang, fix typos. */
export function clean(raw: string) {
  let s = raw;
  for (const [re, word] of EMOJI) s = s.replace(re, word);
  return norm(s)
    .split(' ')
    .flatMap((w) => (SLANG[w] ?? w).split(' '))
    .map(correct)
    .join(' ')
    .trim();
}

export const STOP = new Set(
  'a an the i im me my we our you your to of for and or is are be can do does did it this that what how who which in on at with about any some please want need would like could should tell show give get have has'.split(' ')
);

export const has = (t: string, re: RegExp) => re.test(t);
export const wordIn = (t: string, phrase: string) =>
  new RegExp(`(^|\\s)${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|\\s)`).test(t);
export const words = (t: string) => (t ? t.split(' ').length : 0);
