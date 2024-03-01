import {getLcm, chunk, strToByte, byteToStr} from '../utils'

it('最小公倍数test', () => {
  expect(getLcm(6,8)).toBe(24)
  expect(getLcm(3,4)).toBe(12)
})


it('分组函数chunk', () => {
  const array = [1,2,3,4,5,6,7,8,9,0]
  expect(chunk(array, 3)).toEqual([[1,2,3],[4,5,6],[7,8,9,],[0]])
  expect(chunk(array, 4)).toEqual([[1,2,3,4],[5,6,7,8],[9,0]])
  expect(chunk(array, 5)).toEqual([[1,2,3,4,5],[6,7,8,9,0]])
})


it('strToByte函数测试', () => {
  expect(strToByte('foobar')).toMatchInlineSnapshot(`
    Uint8Array [
      102,
      111,
      111,
      98,
      97,
      114,
    ]
  `)

  expect(Array.from(strToByte('siry'))).toEqual([115, 105, 114, 121])
})

it('byteToStr函数测试', () => {
  expect(byteToStr(new Uint8Array([102,111,111,98,97,114]))).toBe('foobar')
})