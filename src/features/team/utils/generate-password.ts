import { randomInt } from 'crypto'

const LOWER = 'abcdefghjkmnpqrstuvwxyz'
const UPPER = 'ABCDEFGHJKMNPQRSTUVWXYZ'
const DIGITS = '23456789'
const SYMBOLS = '!@#$%&*'
const ALL = LOWER + UPPER + DIGITS + SYMBOLS

function pick(charset: string) {
  return charset[randomInt(charset.length)]
}

// A 12-character password guaranteed to contain a lowercase letter, an
// uppercase letter, a digit, and a symbol, avoiding visually ambiguous
// characters (0/O, 1/l/I) since these get read aloud or typed by hand.
export function generateTempPassword(): string {
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)]
  const rest = Array.from({ length: 8 }, () => pick(ALL))
  const chars = [...required, ...rest]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
