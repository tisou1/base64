
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

/**
 * lodash的chunk简易实现
 * @param array number[]
 * @param size number
 * @returns number[]
 */
 export function chunk(array: number[], size: number):number[][] {
  // 防御性编程，确保传入的数组是有效的
  if (!Array.isArray(array) || size <= 0) {
    throw new Error('Invalid input. Please provide a valid array and a positive chunk size.');
  }

  const result = [];
  let index = 0;

  // 遍历数组，每次取出指定大小的元素，构成一个新的数组块
  while (index < array.length) {
    result.push(array.slice(index, index + size));
    index += size;
  }

  return result;
}


/**
 * 字符串的字符转为一个整数，表示给定索引处的 UTF-16 码元
 * @param str string
 * @returns 
 */
export function strToByte(str: string): Uint8Array {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}

/**
 * 返回一个由给定索引处的单个 UTF-16 码元构成的新字符串。
 * @param bytes Uint8Array
 * @returns string
 */
export function byteToStr(bytes: Uint8Array): string {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(bytes);
}


function strToByte2(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length)
  for(let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i)
  }
  return bytes
}

// Buffer只能在node环境下使用
function strToByte3(str: string) {
  const bytes = Buffer.from(str)
  return new Uint8Array(bytes)
}



/**
 * 浏览器环境直接调用atob方法
 * @param base64 
 * @param encoding 
 * @returns 
 */
export function nodeAtob(base64: string, encoding: BufferEncoding = 'base64') {
  let buff = Buffer.from(base64, encoding)
  let str = buff.toString('utf-8')
  return str
}

/**
 * 使用node本身进行字符串的base64编码 浏览器环境直接调用btoa方法
 * @param str 
 */
export function nodeBtoa(str: string) {
  let buff = Buffer.from(str); // 默认用 utf-8 编码格式解释字符串
  let base64data = buff.toString('base64');
  return base64data
}