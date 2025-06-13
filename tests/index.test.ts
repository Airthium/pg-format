import format, { string as formatString, ident, literal } from '../lib'
import reserved from '../lib/reserved'

const testDate = new Date(Date.UTC(2012, 11, 14, 13, 6, 43, 152))
const testArray = ['abc', 1, true, null, testDate]
const testIdentArray = ['abc', 'AbC', 1, true, testDate]
const testObject = { a: 1, b: 2 }
const testNestedArray = [
  [1, 2],
  [3, 4],
  [5, 6]
]

describe('format', () => {
  const testNestedArray = [
    [1, 2],
    [3, 4],
    [5, 6]
  ]

  test('format - string', () => {
    let res: string

    res = format('some %s', undefined)
    expect(res).toBe('some ')

    res = format('some %s', false)
    expect(res).toBe('some f')

    res = format('some %s', true)
    expect(res).toBe('some t')

    res = format('some %s', new Date(0))
    expect(res).toBe('some 1970-01-01 00:00:00.000+00')

    res = format('some %s', Buffer.from('string'))
    expect(res).toBe('some \\x737472696e67')

    res = format('some %s', ['a'])
    expect(res).toBe('some a')

    res = format('some %s', {})
    expect(res).toBe('some {}')

    res = format('some %s here', 'thing')
    expect(res).toBe('some thing here')

    res = format('some %s thing %s', 'long', 'here')
    expect(res).toBe('some long thing here')
  })

  test('format - string using position field', () => {
    let res: string

    res = format('some %1$s', 'thing')
    expect(res).toBe('some thing')

    res = format('some %1$s %1$s', 'thing')
    expect(res).toBe('some thing thing')

    res = format('some %1$s %s', 'thing', 'again')
    expect(res).toBe('some thing again')

    res = format('some %1$s %2$s', 'thing', 'again')
    expect(res).toBe('some thing again')

    res = format('some %1$s %2$s %1$s', 'thing', 'again')
    expect(res).toBe('some thing again thing')

    res = format('some %1$s %2$s %s %1$s', 'thing', 'again', 'some')
    expect(res).toBe('some thing again some thing')

    // Error using position 0
    expect(() => format('some %0$s', 'thing')).toThrow()

    // Error with too few arguments
    expect(() => format('some %2$s', 'thing')).toThrow()
  })

  test('format - nested array as string', () => {
    const res = format('many %s %s', 'things', testNestedArray)
    expect(res).toBe('many things (1, 2), (3, 4), (5, 6)')
  })

  test('format - %%', () => {
    let res: string

    res = format('some %%', 'thing')
    expect(res).toBe('some %')

    res = format('just %% a %s', 'test')
    expect(res).toBe('just % a test')

    res = format('%1$%', 'thing')
    expect(res).toBe('%1$%')
  })

  test('format - %I', () => {
    let res: string

    expect(() => format('some %I', undefined)).toThrow(
      'SQL identifier cannot be null or undefined'
    )

    res = format('some %I', false)
    expect(res).toBe('some "f"')

    res = format('some %I', Object.keys(reserved)[0])
    expect(res).toBe('some "AES128"')

    res = format('some %I', true)
    expect(res).toBe('some "t"')

    res = format('some %I', new Date(0))
    expect(res).toBe('some "1970-01-01 00:00:00.000+00"')

    expect(() => format('some %I', Buffer.from('string'))).toThrow(
      'SQL identifier cannot be a buffer'
    )

    res = format('some %I', ['a'])
    expect(res).toBe('some a')

    expect(() => format('some %I', {})).toThrow(
      'SQL identifier cannot be an object'
    )

    res = format('some %I', '"foo/bar/baz"')
    expect(res).toBe('some """foo/bar/baz"""')

    res = format('some %I', 'foo/bar/baz')
    expect(res).toBe('some "foo/bar/baz"')

    // Error array of array as an identifier
    expect(() => format('many %I %I', 'foo/bar/baz', testNestedArray)).toThrow()

    res = format('some %1$I', 'thing')
    expect(res).toBe('some thing')

    res = format('some %1$I %1$I', 'thing')
    expect(res).toBe('some thing thing')

    res = format('some %1$I %I', 'thing', 'again')
    expect(res).toBe('some thing again')

    res = format('some %1$I %2$I', 'thing', 'again')
    expect(res).toBe('some thing again')

    res = format('some %1$I %2$I %1$I', 'thing', 'again')
    expect(res).toBe('some thing again thing')

    res = format('some %1$I %2$I %I %1$I', 'thing', 'again', 'huh')
    expect(res).toBe('some thing again huh thing')

    // Error poistion 0
    expect(() => format('some %0$I', 'thing')).toThrow()

    // Error too few arguments
    expect(() => format('some %2$I', 'thing')).toThrow()
  })

  test('format - %L', () => {
    let res: string

    res = format('some %L', undefined)
    expect(res).toBe('some NULL')

    res = format('some %L', false)
    expect(res).toBe("some 'f'")

    res = format('some %L', true)
    expect(res).toBe("some 't'")

    res = format('some %L', new Date(0))
    expect(res).toBe("some '1970-01-01 00:00:00.000+00'")

    res = format('some %L', Buffer.from('string'))
    expect(res).toBe("some E'\\\\x737472696e67'")

    res = format('some %L', ['a', true])
    expect(res).toBe("some 'a','t'")

    res = format('some %L', {})
    expect(res).toBe("some '{}'::jsonb")

    res = format('some %L', "'foo/bar/baz'")
    expect(res).toBe("some '''foo/bar/baz'''")

    res = format('some %L', 'foo\\bar\\baz')
    expect(res).toBe("some E'foo\\\\bar\\\\baz'")

    res = format('%L', "Tobi's")
    expect(res).toBe("'Tobi''s'")

    res = format('%L', testNestedArray)
    expect(res).toBe("('1', '2'), ('3', '4'), ('5', '6')")

    res = format('some %1$L', 'thing')
    expect(res).toBe("some 'thing'")
    res = format('some %1$L %1$L', 'thing')
    expect(res).toBe("some 'thing' 'thing'")

    res = format('some %1$L %L', 'thing', 'again')
    expect(res).toBe("some 'thing' 'again'")

    res = format('some %1$L %2$L', 'thing', 'again')
    expect(res).toBe("some 'thing' 'again'")

    res = format('some %1$L %2$L %1$L', 'thing', 'again')
    expect(res).toBe("some 'thing' 'again' 'thing'")

    res = format('some %1$L %2$L %L %1$L', 'thing', 'again', 'some')
    expect(res).toBe("some 'thing' 'again' 'some' 'thing'")

    // Error position 0
    expect(() => format('some %0$L', 'thing')).toThrow()

    // Error too few arguments
    expect(() => format('some %2$L', 'thing')).toThrow()
  })
})

describe('formatString(val)', () => {
  it('should coerce to a string', () => {
    expect(formatString()).toBe('')
    expect(formatString(null)).toBe('')
    expect(formatString(true)).toBe('t')
    expect(formatString(false)).toBe('f')
    expect(formatString(0)).toBe('0')
    expect(formatString(15)).toBe('15')
    expect(formatString(-15)).toBe('-15')
    expect(formatString(45.13)).toBe('45.13')
    expect(formatString(-45.13)).toBe('-45.13')
    expect(formatString('something')).toBe('something')
    expect(formatString(testArray)).toBe('abc,1,t,2012-12-14 13:06:43.152+00')
    expect(formatString(testNestedArray)).toBe('(1, 2), (3, 4), (5, 6)')
    expect(formatString(testDate)).toBe('2012-12-14 13:06:43.152+00')
    expect(formatString(testObject)).toBe('{"a":1,"b":2}')
  })
})

describe('ident(val)', () => {
  it('should quote when necessary', () => {
    expect(ident('foo')).toBe('foo')
    expect(ident('_foo')).toBe('_foo')
    expect(ident('_foo_bar$baz')).toBe('_foo_bar$baz')
    expect(ident('test.some.stuff')).toBe('"test.some.stuff"')
    expect(ident('test."some".stuff')).toBe('"test.""some"".stuff"')
  })

  it('should quote reserved words', () => {
    expect(ident('desc')).toBe('"desc"')
    expect(ident('join')).toBe('"join"')
    expect(ident('cross')).toBe('"cross"')
  })

  it('should quote', () => {
    expect(ident(true)).toBe('"t"')
    expect(ident(false)).toBe('"f"')
    expect(ident(0)).toBe('"0"')
    expect(ident(15)).toBe('"15"')
    expect(ident(-15)).toBe('"-15"')
    expect(ident(45.13)).toBe('"45.13"')
    expect(ident(-45.13)).toBe('"-45.13"')
    expect(ident(testIdentArray)).toBe(
      'abc,"AbC","1","t","2012-12-14 13:06:43.152+00"'
    )
    expect(() => {
      ident(testNestedArray)
    }).toThrow(Error)
    expect(ident(testDate)).toBe('"2012-12-14 13:06:43.152+00"')
  })

  it('should throw when undefined', () => {
    expect(() => {
      ident()
    }).toThrow('SQL identifier cannot be null or undefined')
  })

  it('should throw when null', () => {
    expect(() => {
      ident(null)
    }).toThrow('SQL identifier cannot be null or undefined')
  })

  it('should throw when object', () => {
    expect(() => {
      ident({})
    }).toThrow('SQL identifier cannot be an object')
  })
})

describe('literal(val)', () => {
  it('should return NULL for null', () => {
    expect(literal(null)).toBe('NULL')
    expect(literal()).toBe('NULL')
  })

  it('should quote', () => {
    expect(literal(true)).toBe("'t'")
    expect(literal(false)).toBe("'f'")
    expect(literal(0)).toBe("'0'")
    expect(literal(15)).toBe("'15'")
    expect(literal(-15)).toBe("'-15'")
    expect(literal(45.13)).toBe("'45.13'")
    expect(literal(-45.13)).toBe("'-45.13'")
    expect(literal('hello world')).toBe("'hello world'")
    expect(literal(testArray)).toBe(
      "'abc','1','t',NULL,'2012-12-14 13:06:43.152+00'"
    )
    expect(literal(testNestedArray)).toBe("('1', '2'), ('3', '4'), ('5', '6')")
    expect(literal(testDate)).toBe("'2012-12-14 13:06:43.152+00'")
    expect(literal(testObject)).toBe('\'{"a":1,"b":2}\'::jsonb')
  })

  it('should format quotes', () => {
    expect(literal("O'Reilly")).toBe("'O''Reilly'")
  })

  it('should format backslashes', () => {
    expect(literal('\\whoop\\')).toBe("E'\\\\whoop\\\\'")
  })
})
