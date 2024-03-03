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

import { getLcm, chunk, strToByte, byteToStr } from './utils'

function toBase8(num: number): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7']
  // const result = [];
  // while(num > 0) {
  //   let digit = digits[num & 0x7]
  //   result.push(digit)
  //   num = num >> 3
  // }
  // return result

  return toBaseCommon(num, digits, 3)
}

console.log('base8:', toBase8(249))

function toBaseCommon(num: number, digits: string[], n: number): string {
  // const digits = ['0', '1', '2', '3', '4', '5', '6', '7']
  const result = []
  while (num > 0) {
    let digit = digits[num & (2 ** n - 1)]
    result.push(digit)
    num = num >> n
  }
  return result.reverse().join('')
}

// ==== 同样是方法将249编码为base16(每个字符4位) =====
// 因此我们将定义16个字符并修改掩码以一次提取4位
function toBase16(num: number): string {
  const digits = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
  ]

  return toBaseCommon(num, digits, 4)
}
console.log('base16:', toBase16(249))

/**
 *
 * base32编码
 *  const digits = ['A', 'B']
 *
 * 这次测试的带编码字符串为foobar 结果为 MZXW6YTBOI======
 */
// const digits = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','2','3', '4','5','6','7']

function toBase32(str: string): string {
  const digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('')
  let base32Result = ''

  // 字符串转为字节数组
  const bytes = strToByte(str)

  // 拿到字节数组后, 5个一组(要是直接使用lodash的chunk方法,要么手写)
  const chunks = chunk(Array.from(bytes), 5)

  chunks.forEach(chunk => {
    // 后续要处理长度不够40位的
    // RFC 规定，如果最后一组包含少于 40 位，则必须用零填充，直到总位数能被 5 整除。每组 5 个字节应产生 8 个编码字符。
    // 如果最后一个块产生的字符少于 8 个，我们将用 = 填充剩余空间。
    // 1. 计算chunk的长度所占的比特位
    let bitsInChunk = chunk.length * 8
    // 这次要编码的次数
    let numOfChara = Math.ceil(bitsInChunk / 5) // 向上取整
    // 要填充的长度
    let padding = bitsInChunk < 40 ? 5 - (bitsInChunk % 5) : 0

    let buf = 0n
    chunk.forEach(byte => {
      // 使用bigInt, 不然会有精度丢失问题
      buf = (buf << 8n) + BigInt(byte)
      // console.log((buf).toString(2), "临时的")
    })
    // 如果位数不够需要填充
    buf <<= BigInt(padding)
    // 会得到40位的二进制, 然后再5个一组,从digits中取值
    const result = []
    while (buf > 0) {
      let digit = digits[Number(buf & 31n)]
      result.push(digit)
      buf = buf >> 5n
    }

    let chunkRes = result.reverse().join('')
    // 填充 (8 - numOfChara)个'='
    for (let i = 0; i < 8 - numOfChara; i++) {
      chunkRes += '='
    }

    // console.log(chunkRes,'临时的结果');
    base32Result += chunkRes
  })
  // console.log('最终的结果:', base32Result)
  return base32Result
}

const base32Digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('')

// 解码
function base32ToStr(base32: string): string {
  let base32Str = ''
  // 1. 删除填充字符'='
  base32 = base32.replaceAll('=', '')

  // 2. 将字符拆分为数组
  const base32Array = base32.split('')

  // 3. 将每个字符转换为 digits 数组中的索引
  const byteArray = base32Array.map(base => {
    return base32Digits.findIndex(digit => digit === base)
  })

  // 4. 将数组划分为 8 个字节的块（40 位 = 8 * 5 编码位）。
  const byteArrayChunks = chunk(byteArray, 8)

  // 5. 计算给定块代表的原始字节数（当最后一个块少于 40 位时）。
  byteArrayChunks.forEach(byteArrayChunk => {
    // 6. 计算编码时应用的位填充。
    let number_of_original_bytes = Math.floor((byteArrayChunk.length * 5) / 8)
    let padding =
      byteArrayChunk.length < 8 ? 5 - ((number_of_original_bytes * 8) % 5) : 0

    let buf = 0n
    byteArrayChunk.forEach(byte => {
      // 向左5位
      buf = (buf << 5n) + BigInt(byte)
    })
    // 移除填充的比特位
    buf >>= BigInt(padding)

    // 7. 将字节组合成一个数字并去除填充。
    const result = []
    while (buf > 0) {
      result.push(Number(buf & 255n))
      // 向右8位
      buf = buf >> 8n
    }
    let chunkRes = result.toReversed()

    // 8. 通过一次提取 1 个字节（8 位）来解码该数字。
    // byte转字符
    let str = byteToStr(new Uint8Array(chunkRes))
    base32Str += str
  })

  return base32Str
}

console.log('base32:', toBase32('foobar'))

console.log('解码base32:', base32ToStr('MZXW6YTBOI======'))

export function toBase64(str: string): string {
  /**
   * 常量的定义
   */
  const BASE64_ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('')
  // 要填充的字符
  const PADDING_CHAR = '='
  const BITS_PER_BYTE = 8 // 一个字节占8个比特位
  // 字母表中单个字符的编码位数 6  2**6 = 64 后面以6比特取索引
  const BITS_PER_CHAR = Math.round(Math.log2(BASE64_ALPHABET.length))
  // 最小公倍数,6 和8的最小公倍数 24（每个字节 8 位，每个字符 6 位）。
  const BITS_PER_CHUNK = getLcm(BITS_PER_CHAR, BITS_PER_BYTE)
  // chunk每组得到base64编码字符的个数4 (一组24比特位,按照6个比特位组成BASE64_ALPHABET索引对应的字符)
  const CHARS_PER_CHUNK = BITS_PER_CHUNK / BITS_PER_CHAR // 4
  // 将字符按照3个一组进行拆分(一组24比特位)
  const CHUNK_LENGTH = BITS_PER_CHUNK / BITS_PER_BYTE // 3
  // 编码时的掩码
  const ENCODING_MASK = BASE64_ALPHABET.length - 1
  const DECODING_MASK = 0xff // 解码时的掩码

  // 最终的结果
  let base32Result = ''

  // 字符串转为字节数组
  const bytes = strToByte(str)

  // 拿到字节数组后, 4个一组(要是直接使用lodash的chunk方法,要么手写)
  const chunks = chunk(Array.from(bytes), CHUNK_LENGTH)

  chunks.forEach(chunk => {
    // 1. 计算chunk的长度所占的比特位
    let bitsInChunk = chunk.length * BITS_PER_BYTE // 24  编码4次
    // 这次要编码的次数
    let numOfChara = Math.ceil((bitsInChunk * CHARS_PER_CHUNK) / BITS_PER_CHUNK) // 向上取整
    // let numOfChara = Math.ceil((bitsInChunk  / BITS_PER_CHAR )) // 向上取整
    // 要填充的长度
    let padding =
      bitsInChunk < BITS_PER_CHUNK
        ? BITS_PER_CHAR - (bitsInChunk % BITS_PER_CHAR)
        : 0

    // 进行按位移动
    let buf = 0n
    chunk.forEach(byte => {
      // 使用bigInt, 不然会有精度丢失问题
      buf = (buf << BigInt(BITS_PER_BYTE)) + BigInt(byte)
      // console.log((buf).toString(2), "临时的")
    })
    // 如果位数不够需要填充
    buf <<= BigInt(padding)

    const result = []
    while (buf > 0) {
      // 用掩码每次提取8个比特位
      let digit = BASE64_ALPHABET[Number(buf & BigInt(ENCODING_MASK))]
      result.push(digit)
      buf = buf >> BigInt(BITS_PER_CHAR)
    }

    let chunkRes = result.reverse().join('')
    // 填充 (CHARS_PER_CHUNK - numOfChara)个'='
    for (let i = 0; i < CHARS_PER_CHUNK - numOfChara; i++) {
      chunkRes += PADDING_CHAR
    }

    base32Result += chunkRes
  })

  return base32Result
}

console.log('base64测试:', toBase64('foobarr'))

// 解码
export function base64ToStr(base64: string): string {
  const BASE64_ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('')
  // 要填充的字符
  const PADDING_CHAR = '='
  const BITS_PER_BYTE = 8 // 一个字节占8个比特位
  // 字母表中单个字符的编码位数 6  2**6 = 64
  const BITS_PER_CHAR = Math.round(Math.log2(BASE64_ALPHABET.length))
  // 最小公倍数,6 和8的最小公倍数 24（每个字节 8 位，每个字符 6 位）。
  const BITS_PER_CHUNK = getLcm(BITS_PER_CHAR, BITS_PER_BYTE) // 6
  const CHARS_PER_CHUNK = BITS_PER_CHUNK / BITS_PER_CHAR // 4
  // const CHUNK_LENGTH = BITS_PER_CHUNK / BITS_PER_BYTE // 3
  // const ENCODING_MASK = BASE64_ALPHABET.length - 1 // 编码时的掩码
  // const DECODING_MASK = 0x3f // 解码时的掩码  63

  let base32Str = ''
  // 删除填充字符'='
  base64 = base64.replaceAll(PADDING_CHAR, '')

  const base64Array = base64.split('')

  const byteArray = base64Array.map(base => {
    return BASE64_ALPHABET.findIndex(digit => digit === base)
  })

  const byteArrayChunks = chunk(byteArray, CHARS_PER_CHUNK)

  byteArrayChunks.forEach(byteArrayChunk => {
    let number_of_original_bytes = Math.floor(
      (byteArrayChunk.length * BITS_PER_CHAR) / BITS_PER_BYTE
    ) // 3
    let padding =
      byteArrayChunk.length < CHARS_PER_CHUNK
        ? BITS_PER_CHAR -
          ((number_of_original_bytes * BITS_PER_BYTE) % BITS_PER_CHAR)
        : 0

    let buf = 0n
    byteArrayChunk.forEach(byte => {
      // 向左6位
      buf = (buf << BigInt(BITS_PER_CHAR)) + BigInt(byte)
      console.log(buf.toString(2), '>>>')
    })
    // 移除填充的比特位
    buf >>= BigInt(padding)

    const result = []
    while (buf > 0) {
      // 一次移动八位, 使用
      let a = Number(buf & BigInt(2 ** BITS_PER_BYTE - 1)) // 255
      result.push(a)
      // 向右8位
      buf = buf >> BigInt(BITS_PER_BYTE)
    }
    let chunkRes = result.toReversed()

    // 8. 通过一次提取 1 个字节（8 位）来解码该数字。
    // byte转字符
    let str = byteToStr(new Uint8Array(chunkRes))
    base32Str += str
  })

  return base32Str
}

console.log('base64解码:', base64ToStr('Zm9vYmFycg=='))
