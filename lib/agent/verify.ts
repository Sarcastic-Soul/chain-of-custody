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
