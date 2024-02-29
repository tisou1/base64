/**
 * 
 * 数字249 转换为base8(八进制)
 * 
 * 249的二进制为  11111001
 * 八进制列举 digits = ['0', '1', '2', '3', '4', '5', '6', '7']
 * 
 * 将249转换为八进制的371. 以三位一组011 111 001
 * 每组代表在digits数组的索引,从低位开始,我们使用位掩码一次提取3位
 * 使用按位与(&) 依次提取  digit = number(249) & 0x7(111) = 1
 * number右移  number = number >> 3  (000  011 111) 16 + 8 + 4 + 2 + 1
 * 
 * 依次操作的结果是3 7 1
 * 
 */


function toBase8(num: number): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7']
  // const result = [];
  // while(num > 0) {
  //   let digit = digits[num & 0x7]
  //   result.push(digit)
  //   num = num >> 3
  // }
  // return result

  return toBaseCommon(num, digits, 3);
}

console.log(
  "base8:",
  toBase8(249)
);

function toBaseCommon(num: number, digits: string[], n: number): string {
  // const digits = ['0', '1', '2', '3', '4', '5', '6', '7']
  const result = [];
  while(num > 0) {
    let digit = digits[num & (2**n - 1)]
    result.push(digit)
    num = num >> n
  }
  return result.reverse().join('')
}


// ==== 同样是方法将249编码为base16(每个字符4位) =====
// 因此我们将定义16个字符并修改掩码以一次提取4位
function toBase16(num: number): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
 

  return toBaseCommon(num, digits, 4);
}


console.log(
  "base16:",
  toBase16(249)
);


/**
 * 
 * base32编码
 *  const digits = ['A', 'B']
 * 
 * 这次测试的带编码字符串为foobar 结果为 MZXW6YTBOI======
 */
// const digits = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','2','3', '4','5','6','7']


function toBase32(str: string):string {
  const digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".split("")
  let base32Result = ''

  // 字符串转为字节数组
  const bytes = strToByte(str)

  // 拿到字节数组后, 5个一组(要是直接使用lodash的chunk方法,要么手写)
  const chunks = chunk(Array.from(bytes), 5)
  // console.log(chunks,'>>>');
  chunks.forEach((chunk) => {

    // 后续要处理长度不够40位的
    // RFC 规定，如果最后一组包含少于 40 位，则必须用零填充，直到总位数能被 5 整除。每组 5 个字节应产生 8 个编码字符。
    // 如果最后一个块产生的字符少于 8 个，我们将用 = 填充剩余空间。
    // 1. 计算chunk的长度所占的比特位
    let bitsInChunk = chunk.length * 8
    // 这次要编码的次数
    let numOfChara = Math.ceil((bitsInChunk / 5)) // 向上取整 
    // 要填充的长度
    let padding = bitsInChunk < 40 ? 5 - bitsInChunk % 5 : 0

    let buf = 0n;
    chunk.forEach((byte) => {
      // 使用bigInt, 不然会有精度丢失问题
      buf = (buf << 8n) + BigInt(byte)
      // console.log((buf).toString(2), "临时的")
    })
    // 如果位数不够需要填充
    buf <<= BigInt(padding)
    // 会得到40位的二进制, 然后再5个一组,从digits中取值
    const result = [];
    while(buf > 0) {
      let digit = digits[Number(buf & 31n)]
      result.push(digit)
      buf = buf >> 5n
    }

    let chunkRes = result.reverse().join('')
    // 填充 (8 - numOfChara)个'='
    for(let i = 0; i < 8-numOfChara ; i++) {
      chunkRes += '='
    }

    console.log(chunkRes,'临时的结果');
    base32Result += chunkRes
  })
  console.log('最终的结果:', base32Result)
  return base32Result
}

const base32Digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".split("")

// 解码
function base32ToStr(base32: string): string {
  let base32Str = ''
  // 1. 删除填充字符'='
  base32 = base32.replaceAll('=','')

  // 2. 将字符拆分为数组
  const base32Array = base32.split('')

  // 3. 将每个字符转换为 digits 数组中的索引
  const byteArray = base32Array.map(base => {
    return base32Digits.findIndex(digit => digit === base)
  })

  // 4. 将数组划分为 8 个字节的块（40 位 = 8 * 5 编码位）。
  const byteArrayChunks = chunk(byteArray, 8);

  // 5. 计算给定块代表的原始字节数（当最后一个块少于 40 位时）。
  byteArrayChunks.forEach(byteArrayChunk => {
    // 6. 计算编码时应用的位填充。
    let number_of_original_bytes = Math.floor((byteArrayChunk.length * 5 / 8))
    let padding = byteArrayChunk.length < 8 ? 5 - (number_of_original_bytes * 8) % 5 : 0

    let buf = 0n
    byteArrayChunk.forEach(byte => {
      // 向左5位
      buf = (buf << 5n) + BigInt(byte)
       console.log((buf).toString(2), "临时的")
    })
    // 移除填充的比特位
    buf >>= BigInt(padding)

    // 7. 将字节组合成一个数字并去除填充。
    const result = []
    while(buf > 0) {
      result.push(Number(buf & 255n))
      // 向右8位
      buf = buf >> 8n
    }
    let chunkRes = result.toReversed();

    // 8. 通过一次提取 1 个字节（8 位）来解码该数字。
    // byte转字符
    let str = byteToStr(new Uint8Array(chunkRes))
    base32Str += str
  })



  return base32Str
}

console.log(
  'base32:',
  toBase32('foobar')
);

console.log(
  '解码base32:',
  base32ToStr('MZXW6YTBOI======')
);


function strToByte(str: string): Uint8Array {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}

function byteToStr(bytes: Uint8Array): string {
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
// console.log(
//   strToByte('foobar'),
//   strToByte2('foobar'),
//   strToByte3('foobar')
// );

function chunk(array: number[], size: number):number[][] {
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
 * 常量的定义
 */
const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split('')
// 要填充的字符
const PADDING_CHAR = '='
const BITS_PER_BYTE = 8 // 一个字节占8个比特位
// 一个char要占几个比特位
const BITS_PER_CHAR = Math.round(Math.log2(BASE64_ALPHABET.length))
// 最小公倍数
const BITS_PER_CHUNK = BITS_PER_CHAR

const CHARS_PER_CHUNK = BITS_PER_CHUNK / BITS_PER_CHAR 
const CHUNK_LENGTH = BITS_PER_CHUNK / BITS_PER_BYTE  
const ENCODING_MASK = BASE64_ALPHABET.length - 1 
const DECODING_MASK = 0xff

function toBase64(str: string):string {
  const digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".split("")
  let base32Result = ''

  // 字符串转为字节数组
  const bytes = strToByte(str)

  // 拿到字节数组后, 5个一组(要是直接使用lodash的chunk方法,要么手写)
  const chunks = chunk(Array.from(bytes), 5)
  // console.log(chunks,'>>>');
  chunks.forEach((chunk) => {

    // 后续要处理长度不够40位的
    // RFC 规定，如果最后一组包含少于 40 位，则必须用零填充，直到总位数能被 5 整除。每组 5 个字节应产生 8 个编码字符。
    // 如果最后一个块产生的字符少于 8 个，我们将用 = 填充剩余空间。
    // 1. 计算chunk的长度所占的比特位
    let bitsInChunk = chunk.length * 8
    // 这次要编码的次数
    let numOfChara = Math.ceil((bitsInChunk / 5)) // 向上取整 
    // 要填充的长度
    let padding = bitsInChunk < 40 ? 5 - bitsInChunk % 5 : 0

    let buf = 0n;
    chunk.forEach((byte) => {
      // 使用bigInt, 不然会有精度丢失问题
      buf = (buf << 8n) + BigInt(byte)
      // console.log((buf).toString(2), "临时的")
    })
    // 如果位数不够需要填充
    buf <<= BigInt(padding)
    // 会得到40位的二进制, 然后再5个一组,从digits中取值
    const result = [];
    while(buf > 0) {
      let digit = digits[Number(buf & 31n)]
      result.push(digit)
      buf = buf >> 5n
    }

    let chunkRes = result.reverse().join('')
    // 填充 (8 - numOfChara)个'='
    for(let i = 0; i < 8-numOfChara ; i++) {
      chunkRes += '='
    }

    console.log(chunkRes,'临时的结果');
    base32Result += chunkRes
  })
  console.log('最终的结果:', base32Result)
  return base32Result
}
