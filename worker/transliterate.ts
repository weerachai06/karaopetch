const HANGUL_RANGE = /[가-힣ᄀ-ᇿ㄰-㆏]/

export function containsHangul(text: string): boolean {
  return HANGUL_RANGE.test(text)
}

export interface LinePair {
  original: string
  transliteration: string | null
}

const SYSTEM_PROMPT = `ช่วยแปลงเนื้อเพลงต่อไปนี้ให้อยู่ในรูปแบบ "คำอ่านภาษาไทยทับศัพท์" โดยมีเงื่อนไขดังนี้:

ส่วนที่เป็นภาษาเกาหลี/ภาษาอื่น: ให้เขียนเป็นคำอ่านภาษาไทย โดยใส่เครื่องหมายขีดกลาง (-) แยกเสียงระดับพยางค์ให้ชัดเจนตามจังหวะการร้อง (เช่น ออ-ริน มัม-โซก)

ส่วนที่เป็นภาษาอังกฤษ: ให้คงรูปตัวพิมพ์ภาษาอังกฤษไว้ตามเดิม ไม่ต้องแปลงเป็นคำอ่านภาษาไทย (เช่น We're blooming, yeah, keep dreamin', my heart)

โครงสร้างเพลง: ให้คงรูปแบบท่อน [Intro], [Verse], [Chorus], [Bridge] ไว้เหมือนเดิม ห้ามตัดออก

อินพุตแต่ละบรรทัดจะขึ้นต้นด้วยหมายเลขบรรทัดตามด้วยวงเล็บปิด เช่น "1) เนื้อเพลงบรรทัดแรก"
ให้ตอบกลับเป็นบรรทัดผลลัพธ์จำนวนเท่ากับอินพุตทุกประการ หนึ่งบรรทัดอินพุตต่อหนึ่งบรรทัดผลลัพธ์ โดยคงหมายเลขบรรทัดไว้ในรูปแบบเดียวกัน เช่น "1) คำอ่านภาษาไทยทับศัพท์" ห้ามเพิ่มคำอธิบายอื่นใดนอกจากบรรทัดผลลัพธ์`

const RETRY_SUFFIX =
  '\n\nสำคัญ: ผลลัพธ์ครั้งก่อนมีจำนวนบรรทัดไม่ตรงกับอินพุต กรุณาตอบกลับให้มีจำนวนบรรทัดเท่ากับอินพุตทุกประการ หนึ่งบรรทัดอินพุตต่อหนึ่งบรรทัดผลลัพธ์เท่านั้น'

const LINE_PATTERN = /^(\d+)\)\s?(.*)$/

function formatInput(lines: string[]): string {
  return lines.map((line, i) => `${i + 1}) ${line}`).join('\n')
}

function parseOutput(text: string): Map<number, string> {
  const result = new Map<number, string>()
  for (const rawLine of text.split('\n')) {
    const match = LINE_PATTERN.exec(rawLine.trim())
    if (!match) continue
    const index = Number(match[1])
    result.set(index, match[2])
  }
  return result
}

function extractText(response: unknown): string {
  if (typeof response === 'string') return response
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>
    if (typeof obj.response === 'string') return obj.response
    const choice = (obj.choices as Record<string, unknown>[] | undefined)?.[0]
    const message = choice?.message as Record<string, unknown> | undefined
    if (typeof message?.content === 'string') return message.content
    if (typeof choice?.text === 'string') return choice.text
  }
  return ''
}

function maxTokensFor(lineCount: number): number {
  return Math.min(8192, Math.max(1024, lineCount * 120))
}

async function callQwen(
  ai: Ai,
  lines: string[],
  systemPrompt: string,
): Promise<Map<number, string>> {
  const response = await ai.run('@cf/qwen/qwen3-30b-a3b-fp8', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: formatInput(lines) },
    ],
    max_tokens: maxTokensFor(lines.length),
  })

  const text = extractText(response)
  return parseOutput(text)
}

export async function transliterateLines(ai: Ai, lines: string[]): Promise<LinePair[]> {
  let parsed = await callQwen(ai, lines, SYSTEM_PROMPT)

  if (parsed.size !== lines.length) {
    parsed = await callQwen(ai, lines, SYSTEM_PROMPT + RETRY_SUFFIX)
  }

  return lines.map((original, i) => ({
    original,
    transliteration: parsed.get(i + 1) ?? null,
  }))
}

export async function hashText(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
