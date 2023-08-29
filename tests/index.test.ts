import format from '../lib'
import reserved from '../lib/reserved'

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
    expect(() => format('some %0$s', 'thing')).toThrowError()

    // Error with too few arguments
    expect(() => format('some %2$s', 'thing')).toThrowError()
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

    expect(() => format('some %I', undefined)).toThrowError(
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

    expect(() => format('some %I', Buffer.from('string'))).toThrowError(
      'SQL identifier cannot be a buffer'
    )

    res = format('some %I', ['a'])
    expect(res).toBe('some a')

    expect(() => format('some %I', {})).toThrowError(
      'SQL identifier cannot be an object'
    )

    res = format('some %I', '"foo/bar/baz"')
    expect(res).toBe('some """foo/bar/baz"""')

    res = format('some %I', 'foo/bar/baz')
    expect(res).toBe('some "foo/bar/baz"')

    // Error array of array as an identifier
    expect(() =>
      format('many %I %I', 'foo/bar/baz', testNestedArray)
    ).toThrowError()

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
    expect(() => format('some %0$I', 'thing')).toThrowError()

    // Error too few arguments
    expect(() => format('some %2$I', 'thing')).toThrowError()
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
    expect(() => format('some %0$L', 'thing')).toThrowError()

    // Error too few arguments
    expect(() => format('some %2$L', 'thing')).toThrowError()
  })
})
