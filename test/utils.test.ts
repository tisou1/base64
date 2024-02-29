import {getLcm} from '../utils'

it('最小公倍数test', () => {
  expect(getLcm(6,8)).toBe(24)
  expect(getLcm(3,4)).toBe(12)
})