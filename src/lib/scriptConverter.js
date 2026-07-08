/**
 * Script conversion utilities for "Three scripts from one take"
 *
 * Converts subtitle text between Roman Hinglish, Native (Devanagari),
 * and English translation scripts.
 *
 * Uses lookup-based approximation for common Hinglish → Devanagari mapping,
 * and a simple English translation map for common phrases.
 */

const HINGLISH_TO_DEVANAGARI = {
  bhai: "भाई",
  suno: "सुनो",
  yaar: "यार",
  hai: "है",
  nahi: "नहीं",
  karo: "करो",
  hain: "हैं",
  mera: "मेरा",
  tera: "तेरा",
  kya: "क्या",
  aaj: "आज",
  kal: "कल",
  bahut: "बहुत",
  accha: "अच्छा",
  theek: "ठीक",
  chalo: "चलो",
  dekho: "देखो",
  aap: "आप",
  tum: "तुम",
  main: "मैं",
  hum: "हम",
  kaise: "कैसे",
  kab: "कब",
  kahan: "कहाँ",
  kyun: "क्यों",
  kyuki: "क्योंकि",
  lekin: "लेकिन",
  aur: "और",
  toh: "तो",
  phir: "फिर",
  abhi: "अभी",
  wahi: "वही",
  samajh: "समझ",
  baat: "बात",
  kaam: "काम",
  din: "दिन",
  raat: "रात",
  saal: "साल",
  dost: "दोस्त",
  pyar: "प्यार",
  " life ": " लाइफ ",
  game: "गेम",
  startup: "स्टार्टअप",
  hustle: "हसल",
  consistency: "कंसिस्टेंसी",
  push: "पुश",
  follow: "फॉलो",
  results: "रिजल्ट्स",
  video: "वीडियो",
  focus: "फोकस",
  content: "कंटेंट",
  creator: "क्रिएटर",
  time: "टाइम",
  moment: "मोमेंट",
};

const HINGLISH_TO_ENGLISH = {
  bhai: "brother/dude",
  suno: "listen",
  yaar: "friend",
  hai: "is",
  nahi: "no/not",
  karo: "do",
  hain: "are",
  mera: "my",
  tera: "your",
  kya: "what",
  aaj: "today",
  kal: "yesterday/tomorrow",
  bahut: "very/much",
  accha: "good/okay",
  theek: "fine/alright",
  chalo: "let's go",
  dekho: "look/see",
  aap: "you (formal)",
  tum: "you (informal)",
  main: "I",
  hum: "we",
  kaise: "how",
  kab: "when",
  kahan: "where",
  kyun: "why",
  kyuki: "because",
  lekin: "but",
  aur: "and",
  toh: "so/then",
  phir: "then/again",
  abhi: "now/just now",
  wahi: "the same",
  samajh: "understand",
  baat: "thing/matter",
  kaam: "work",
  din: "day",
  raat: "night",
  saal: "year",
  dost: "friend",
  pyar: "love",
  sirf: "only/just",
  har: "every/each",
  thoda: "a little",
  iske: "of this",
  baare: "about",
  mein: "in",
  nehi: "no/not",
  kar: "do",
  sakte: "can",
  ho: "are/be",
  sakta: "can",
};

/**
 * Convert Roman Hinglish text to Devanagari script.
 * Falls back to original word for unknown terms.
 */
export function hinglishToDevanagari(text) {
  let result = text;
  for (const [key, val] of Object.entries(HINGLISH_TO_DEVANAGARI)) {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    result = result.replace(regex, val);
  }
  return result;
}

/**
 * Convert Roman Hinglish text to English translation.
 */
export function hinglishToEnglish(text) {
  let result = text;
  for (const [key, val] of Object.entries(HINGLISH_TO_ENGLISH)) {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    result = result.replace(regex, val);
  }
  return result;
}

/**
 * Capitalize first letter of each segment
 */
export function capitalizeSegment(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert subtitles to a different script.
 * @param {Array} subtitles - Array of {id, start, end, text}
 * @param {string} script - "roman" | "native" | "english"
 */
export function convertSubtitles(subtitles, script) {
  return subtitles.map((s) => {
    let newText = s.text;
    if (script === "native") {
      newText = hinglishToDevanagari(s.text);
    } else if (script === "english") {
      newText = hinglishToEnglish(s.text);
    }
    return { ...s, text: capitalizeSegment(newText) };
  });
}
