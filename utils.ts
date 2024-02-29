
/**
 * 求最大公约数 - 辗转相除法
 * @param a number
 * @param b number
 * @returns number
 */
function getGcd(a, b) {
  let max = Math.max(a, b);
  let min = Math.min(a, b);
  if (max % min === 0) {
      return min;
  } else {
      return getGcd(max % min, min);
  }
}

/**
 * 最小公倍数 - 使用a,b相乘除最大公约数得
 * @param a number
 * @param b number
 * @returns number
 */
export function getLcm(a, b) {
  return a * b / getGcd(a, b);
}