import { nodeAtob, nodeBtoa } from '../utils'
import { toBase64, base64ToStr} from '../index'


it('base64编码测试', () => {
  expect(toBase64('foobar')).toBe(nodeBtoa('foobar'))
  expect(toBase64('asdhu')).toBe(nodeBtoa('asdhu'))
  expect(toBase64('rset4')).toBe(nodeBtoa('rset4'))
})


it('base64解码测试', () => {
  expect(base64ToStr('Zm9vYmFycg==')).toBe(nodeAtob('Zm9vYmFycg=='))
  expect(base64ToStr('Zm9vYmFycg==')).toBe('foobarr')
  expect(base64ToStr('rset')).toMatchInlineSnapshot(`"�ǭ"`)
  expect(nodeAtob('rset')).toMatchInlineSnapshot(`"�ǭ"`)
})