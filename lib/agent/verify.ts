/**
 * Load-bearing check: a quote is only usable if it is a verbatim substring of
 * the source document's body. Trims the quote, but otherwise does no fuzzy or
 * paraphrase matching, no case-folding, no whitespace normalization.
 */
export function verifyExactSubstring(quote: string, sourceBody: string): boolean {
  const trimmedQuote = quote.trim()
  if (trimmedQuote.length === 0) return false
  return sourceBody.includes(trimmedQuote)
}

const INJECTION_PATTERNS = [
  /\bSYSTEM(\s+OVERRIDE)?\s*:/,
  /\bignore\b[^.]{0,60}\binstructions?\b/i,
  /\b(rules|instructions)\b[^.]{0,40}\bno longer apply\b/i,
  /\btreat\b[^.]{0,40}\bas\b[^.]{0,30}\b(verified|established)\s+fact\b/i,
]

/**
 * A source document carrying text aimed at the agent (a fake system message, "ignore your
 * instructions") is untrusted as a whole: the rest of its text may have been planted to be quoted,
 * so nothing from it counts as evidence, even an exact substring.
 */
export function containsPromptInjection(sourceBody: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(sourceBody))
}
