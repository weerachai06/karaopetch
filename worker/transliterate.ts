// Deterministic Korean (Hangul) -> Thai phonetic transliteration.
//
// Each Hangul syllable is decomposed into its jamo (onset / vowel / coda) via
// Unicode math, then mapped directly to Thai. A liaison pass moves a syllable's
// coda onto a following vowel-initial syllable, matching Korean 연음 pronunciation
// (e.g. 좋아 -> jo-a, 음악은 -> eu-ma-geun). Non-Hangul text (English, spaces,
// punctuation, section markers) passes through untouched.

const HANGUL_RANGE = /[가-힣ᄀ-ᇿ㄰-㆏]/
const HANGUL_SYLLABLE_START = 0xac00
const HANGUL_SYLLABLE_END = 0xd7a3

export function containsHangul(text: string): boolean {
  return HANGUL_RANGE.test(text)
}

export interface LinePair {
  original: string
  transliteration: string | null
}

// Onset (초성) jamo index 0-18 -> Thai initial consonant ('' = silent ㅇ).
const ONSETS = [
  'ก', 'ก', 'น', 'ด', 'ต', 'ร', 'ม', 'บ', 'ป', 'ซ',
  'ซ', '', 'จ', 'จ', 'ช', 'ค', 'ท', 'พ', 'ฮ',
]

// Coda (종성) jamo index 0-27 -> Thai final consonant ('' = no coda).
const CODAS = [
  '', 'ก', 'ก', 'ก', 'น', 'น', 'น', 'ด', 'ล', 'ก',
  'ม', 'ล', 'ล', 'ล', 'บ', 'ล', 'ม', 'บ', 'บ', 'ด',
  'ด', 'ง', 'ด', 'ด', 'ก', 'ด', 'บ', 'ด',
]

// Simple coda jamo index -> onset jamo index when it liaisons onto the next
// vowel-initial syllable.
const CODA_TO_ONSET: Record<number, number> = {
  1: 0, 2: 1, 4: 2, 7: 3, 8: 5, 16: 6, 17: 7, 19: 9, 20: 10,
  22: 12, 23: 14, 24: 15, 25: 16, 26: 17,
}
const CODA_DROPS = new Set([27]) // ㅎ elides before a vowel

// Compound codas splitting under liaison. When the second element is ㅎ it
// elides and the first element itself moves (keepCoda 0); otherwise the first
// element stays as coda and the second moves onto the next syllable.
const DOUBLE_CODA: Record<number, { keepCoda: number; moveOnset: number }> = {
  3: { keepCoda: 1, moveOnset: 9 }, // ㄳ ㄱ+ㅅ
  5: { keepCoda: 4, moveOnset: 12 }, // ㄵ ㄴ+ㅈ
  6: { keepCoda: 0, moveOnset: 2 }, // ㄶ ㄴ+ㅎ
  9: { keepCoda: 8, moveOnset: 0 }, // ㄺ ㄹ+ㄱ
  10: { keepCoda: 8, moveOnset: 6 }, // ㄻ ㄹ+ㅁ
  11: { keepCoda: 8, moveOnset: 7 }, // ㄼ ㄹ+ㅂ
  12: { keepCoda: 8, moveOnset: 9 }, // ㄽ ㄹ+ㅅ
  13: { keepCoda: 8, moveOnset: 16 }, // ㄾ ㄹ+ㅌ
  14: { keepCoda: 8, moveOnset: 17 }, // ㄿ ㄹ+ㅍ
  15: { keepCoda: 0, moveOnset: 5 }, // ㅀ ㄹ+ㅎ
  18: { keepCoda: 17, moveOnset: 9 }, // ㅄ ㅂ+ㅅ
}

// Base vowel wrappers: (consonant core, coda) -> Thai syllable string.
function baseA(c: string, k: string) { return k ? c + 'ั' + k : c + 'า' }
function baseAe(c: string, k: string) { return 'แ' + c + k }
function baseEo(c: string, k: string) { return c + 'อ' + k }
function baseE(c: string, k: string) { return 'เ' + c + k }
function baseO(c: string, k: string) { return 'โ' + c + k }
function baseU(c: string, k: string) { return k ? c + 'ุ' + k : c + 'ู' }
function baseEu(c: string, k: string) { return k ? c + 'ึ' + k : c + 'ือ' }
function baseI(c: string, k: string) { return k ? c + 'ิ' + k : c + 'ี' }
function baseUi(c: string, k: string) { return c + 'ึย' + k }

// Vowel (중성) jamo index 0-20. glide inserts ย (y) or ว (w) after the onset.
const VOWELS: { glide: string; base: (c: string, k: string) => string }[] = [
  { glide: '', base: baseA }, // ㅏ a
  { glide: '', base: baseAe }, // ㅐ ae
  { glide: 'ย', base: baseA }, // ㅑ ya
  { glide: 'ย', base: baseAe }, // ㅒ yae
  { glide: '', base: baseEo }, // ㅓ eo
  { glide: '', base: baseE }, // ㅔ e
  { glide: 'ย', base: baseEo }, // ㅕ yeo
  { glide: 'ย', base: baseE }, // ㅖ ye
  { glide: '', base: baseO }, // ㅗ o
  { glide: 'ว', base: baseA }, // ㅘ wa
  { glide: 'ว', base: baseAe }, // ㅙ wae
  { glide: 'ว', base: baseE }, // ㅚ oe
  { glide: 'ย', base: baseO }, // ㅛ yo
  { glide: '', base: baseU }, // ㅜ u
  { glide: 'ว', base: baseEo }, // ㅝ wo
  { glide: 'ว', base: baseE }, // ㅞ we
  { glide: 'ว', base: baseI }, // ㅟ wi
  { glide: 'ย', base: baseU }, // ㅠ yu
  { glide: '', base: baseEu }, // ㅡ eu
  { glide: '', base: baseUi }, // ㅢ ui
  { glide: '', base: baseI }, // ㅣ i
]

interface Jamo {
  onset: number
  vowel: number
  coda: number
}

function decompose(code: number): Jamo {
  const x = code - HANGUL_SYLLABLE_START
  return { onset: Math.floor(x / 588), vowel: Math.floor((x % 588) / 28), coda: x % 28 }
}

function applyLiaison(syllables: Jamo[]): Jamo[] {
  for (let i = 0; i < syllables.length - 1; i++) {
    const cur = syllables[i]
    const next = syllables[i + 1]
    if (cur.coda === 0 || next.onset !== 11) continue // next must be vowel-initial
    if (cur.coda in DOUBLE_CODA) {
      const { keepCoda, moveOnset } = DOUBLE_CODA[cur.coda]
      cur.coda = keepCoda
      next.onset = moveOnset
    } else if (CODA_DROPS.has(cur.coda)) {
      cur.coda = 0
    } else if (cur.coda in CODA_TO_ONSET) {
      next.onset = CODA_TO_ONSET[cur.coda]
      cur.coda = 0
    }
    // ㅇ (21) stays in place
  }
  return syllables
}

function mapSyllable({ onset, vowel, coda }: Jamo): string {
  const onsetThai = ONSETS[onset]
  const codaThai = CODAS[coda]
  const v = VOWELS[vowel]
  let core: string
  if (v.glide) {
    core = onsetThai === '' ? v.glide : onsetThai + v.glide
  } else {
    core = onsetThai === '' ? 'อ' : onsetThai
  }
  return v.base(core, codaThai)
}

export function hangulToThai(text: string): string {
  let out = ''
  let run: Jamo[] = []
  const flush = () => {
    if (run.length) {
      out += applyLiaison(run).map(mapSyllable).join('-')
      run = []
    }
  }
  for (const ch of text) {
    const code = ch.codePointAt(0)!
    if (code >= HANGUL_SYLLABLE_START && code <= HANGUL_SYLLABLE_END) {
      run.push(decompose(code))
    } else {
      flush()
      out += ch
    }
  }
  flush()
  return out
}

export function transliterateLines(lines: string[]): LinePair[] {
  return lines.map((original) => ({
    original,
    transliteration: containsHangul(original) ? hangulToThai(original) : original,
  }))
}
