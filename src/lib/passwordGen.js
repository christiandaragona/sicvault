const AMBIGUOUS = new Set('0Ol1|I')

export function generateStandard(opts) {
  let upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let lower   = 'abcdefghijklmnopqrstuvwxyz'
  let numbers = '0123456789'
  let symbols = opts.customSymbols || '!@#$%^&*'

  const excluded = new Set((opts.excludeCustom || '').split(''))
  if (opts.excludeAmbiguous) {
    upper   = [...upper].filter(c => !AMBIGUOUS.has(c)).join('')
    lower   = [...lower].filter(c => !AMBIGUOUS.has(c)).join('')
    numbers = [...numbers].filter(c => !AMBIGUOUS.has(c)).join('')
    symbols = [...symbols].filter(c => !AMBIGUOUS.has(c)).join('')
  }
  upper   = [...upper].filter(c => !excluded.has(c)).join('')
  lower   = [...lower].filter(c => !excluded.has(c)).join('')
  numbers = [...numbers].filter(c => !excluded.has(c)).join('')
  symbols = [...symbols].filter(c => !excluded.has(c)).join('')

  const pool = [
    opts.upper   ? upper   : '',
    opts.lower   ? lower   : '',
    opts.numbers ? numbers : '',
    opts.symbols ? symbols : '',
  ].join('')

  if (!pool) return ''

  const len = Math.max(4, Math.min(128, parseInt(opts.length) || 20))
  const rand = chars => chars[Math.floor(Math.random() * chars.length)]

  const mandatory = []
  if (opts.upper)   for (let i = 0; i < (parseInt(opts.minUpper)   || 0) && upper;   i++) mandatory.push(rand(upper))
  if (opts.lower)   for (let i = 0; i < (parseInt(opts.minLower)   || 0) && lower;   i++) mandatory.push(rand(lower))
  if (opts.numbers) for (let i = 0; i < (parseInt(opts.minNumbers) || 0) && numbers; i++) mandatory.push(rand(numbers))
  if (opts.symbols) for (let i = 0; i < (parseInt(opts.minSymbols) || 0) && symbols; i++) mandatory.push(rand(symbols))

  const rest = Array.from({ length: Math.max(0, len - mandatory.length) }, () => rand(pool))
  const all  = [...mandatory, ...rest]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]]
  }
  return all.join('')
}

export function generatePronounceable(len) {
  const consonants = 'bcdfghjklmnprstvwxyz'
  const vowels     = 'aeiou'
  let out = ''
  for (let i = 0; i < len; i++) {
    out += i % 2 === 0
      ? consonants[Math.floor(Math.random() * consonants.length)]
      : vowels[Math.floor(Math.random() * vowels.length)]
  }
  const num = Math.floor(Math.random() * 90 + 10)
  const sym = '!@#$%'[Math.floor(Math.random() * 5)]
  return out.slice(0, -3) + num + sym
}

export function generatePassphrase(wordlist) {
  const words = Array.from({ length: 4 }, () => wordlist[Math.floor(Math.random() * wordlist.length)])
  return words.join('-') + '-' + Math.floor(Math.random() * 900 + 100)
}

export function calcEntropy(password) {
  let pool = 0
  if (/[A-Z]/.test(password)) pool += 26
  if (/[a-z]/.test(password)) pool += 26
  if (/[0-9]/.test(password)) pool += 10
  if (/[^A-Za-z0-9]/.test(password)) pool += 32
  if (pool === 0) return 0
  return Math.min(100, Math.round((password.length * Math.log2(pool)) / 128 * 100))
}
