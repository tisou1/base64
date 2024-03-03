## base64编码

### typescript实现node/web下的base64编码

[参考链接](https://ptrchm.com/posts/base32-explained/)

### 实现思路

像十进制数字使用10位数字表示一样, base $2^n$编码是表示数字(字节)的另一种方式,n越大表示就越紧凑
可用位数决定了单个字符可以表示多少位,例如: 使用二进制一位可以表示两种字符组合. 类似的在Base64中(base $2^6$)中,我们可以将6位数据编码为单个字符($2^6$ = 6位的64个字符组合)

**实现的方式有很多种,这里使用的是按位运算方式.**

当拿到要编码的字符串, 会将其转化为对应的Unicode字符集编码数组

```ts
export function strToByte(str: string): Uint8Array {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}
```

如'foobar'字符串就会得到`[102, 111, 111, 98, 97, 114]`的Unit8Array数组

然后根据选择的base $2^n$编码方式,对数组再进行分组.  在base64中这里n为6, 一个字节为8个比特位,所以取6和8的最小公倍数24, 也就是说一组24个比特位也就是3 * 8 = 24, 即三个字符为一组,分为了`[[102, 111, 111], [ 98, 97, 114]]`

然后再对每组进行分别编码处理, 我们这里选择了按位运算的方式,所以呢,需要将每组的三个数进行按位运算进行拼接,具体的二进制位运算如下
```
01100110 01101111 01101111
f        o        o

01100110 << 8  
0110011000000000 + 01101111 =  0110011001101111 
0110011001101111  << 8
011001100110111100000000 + 01101111 = 011001100110111101101111

第一组最终得到 011001100110111101101111
```

这时候对二进制进行6位一组分开得到  011001 100110 111101 101111

得到的6位二进制,可表示的最大值得范围为0 ~ 2 $6$ = 64 个

这时候就需要我们创建一个长度为64的字符集,来进行编码,这里使用的是[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648)定义的字符集
即`const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split('')`

后续需要我们做的就是将上一步得到一组4个6位长度的编码对应到BASE64_ALPHABET的索引取值

> 索引取值这一步, 也需要进行按位移动,一次弹出6个比特位, 代码的实现就是利用掩码(0x3f)和向右位移6位来依次取值

```
011001100110111101101111 & 0x3f (63 111111 $2^6$ -1) = 01101111
011001100110111101101111 >> 6 = 011001100110111101

011001100110111101 & 0x3f = 111101
011001100110111101 >> 6 = 011001100110

011001100110 & 0x3f = 100110
011001100110 >> 6 = 011001

011001 & 0x3f = 011001
011001 >> 6 = 0   (此时为0结束比特位移动)
```

将`011001 100110 111101 101111`转为10进制就是`25 38 61 47`对应`BASE64_ALPHABET`的索引结果为`Z m 9 v`

上面每组都是24比特的, 可能会出现一组不满24比特的情况, 这时候就需要进行补位填充了,当然补的都是0,
比如最后一个只有8个比特,此时肯定不够,所以我们需要补4个比特位凑齐12(大于8的最小能整除6的数)个比特位,这样可以以6个一组进行分  
然后为了凑齐一组是4个字符,我们需要在补充比特位之后还需要填充两个字符

```ts
  const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split('')
  // 要填充的字符
  const PADDING_CHAR = '='
  const BITS_PER_BYTE = 8 // 一个字节占8个比特位
  // 字母表中单个字符的编码位数 6  2**6 = 64
  const BITS_PER_CHAR = Math.round(Math.log2(BASE64_ALPHABET.length))
  // 后面以6比特取索引 
  const BITS_PER_CHUNK = getLcm(BITS_PER_CHAR, BITS_PER_BYTE)
  // chunk每组得到base64编码字符的个数4 (一组24比特位,按照6个比特位组成BASE64_ALPHABET索引对应的字符)
  const CHARS_PER_CHUNK = BITS_PER_CHUNK / BITS_PER_CHAR // 4
  // 将字符按照3个一组进行拆分(一组24比特位)
  const CHUNK_LENGTH = BITS_PER_CHUNK / BITS_PER_BYTE   // 3
  // 编码时的掩码
  const ENCODING_MASK = BASE64_ALPHABET.length - 1

  // .....

  // 1. 计算chunk的长度所占的比特位
  let bitsInChunk = chunk.length * BITS_PER_BYTE // 24  编码4次
  // 这次要编码的次数
  let numOfChara = Math.ceil((bitsInChunk * CHARS_PER_CHUNK / BITS_PER_CHUNK )) // 向上取整 
  // let numOfChara = Math.ceil((bitsInChunk  / BITS_PER_CHAR )) // 向上取整 
  // 要填充的长度
  let padding = bitsInChunk < BITS_PER_CHUNK ? BITS_PER_CHAR - bitsInChunk % BITS_PER_CHAR : 0

  // ...

  let chunkRes = result.reverse().join('')
  // 填充 (CHARS_PER_CHUNK - numOfChara)个'='
  for (let i = 0; i < CHARS_PER_CHUNK - numOfChara; i++) {
    chunkRes += PADDING_CHAR
  }
```

[完整代码](./index.ts#L186)

## base64解码

有了前面base64编码的经验,解码就简单了.

### 解码思路

首先我们知道一个base64编码的字符串,每个字符是占了6个比特位
故而我们需要将4个字符分为一组  即一组为24(4 * 6)个比特位

在将字符分组前,需要先去除填充的字符(这里我们使用的填充字符是'=') 

然后将字符转为对应的`BASE64_ALPHABET`索引再将索引数组进行分组

然后我们需要进行按为移动,每次向左移动6位

最后每次取出8个比特位转为对应的字符unicode码, 然后再转成相对应的字符进行拼接即可

> 需要注意的是, 当我们还有补位的情况时,也需要再额外的计算一下. 像编码时那样,如果是补了4个比特位,那么在最后按8位转换为字符之前需要再进行向右位移4位来去掉补的位数

```ts
    // ...
    byteArrayChunks.forEach(byteArrayChunk => {
      // 编码时的字节数
      let number_of_original_bytes = Math.floor(
        (byteArrayChunk.length * BITS_PER_CHAR) / BITS_PER_BYTE
      ) 
      // 填充的比特位位数
      let padding =
        byteArrayChunk.length < CHARS_PER_CHUNK
          ? BITS_PER_CHAR -
            ((number_of_original_bytes * BITS_PER_BYTE) % BITS_PER_CHAR) // 6 - (1*8) % 6 = 4 这里补了4个比特位
          : 0

      let buf = 0n
      byteArrayChunk.forEach(byte => {
        // 向左6位
        buf = (buf << BigInt(BITS_PER_CHAR)) + BigInt(byte)
      })
      // 移除填充的比特位
      buf >>= BigInt(padding)
      // ....
    }
    // ...

```

以字符'foobarr'对应的base64编码字符串'Zm9vYmFycg=='为例, 将'Zm9vYmFycg=='中的填充字符'='去掉得到'Zm9vYmFycg'
首先将字符串转为对应的`BASE64_ALPHABET`索引数组`[25, 38, 61, 47, 24 , 38, 5, 50, 28, 32]`,然后进行4个一组分组为`[[25, 38, 61, 47], [24 , 38, 5, 50] [28, 32]]`. 下面每组进行按位移动,这里演示一个完整的第一组和第三组

第一组:
  对应的二进制位 011001  100110 111101 101111 (25, 38, 61, 47)

```
011001 << 6
01100100000000 + 100110 = 011001100110

011001100110 << 6
011001100110000000 + 111101 = 011001100110111101

011001100110111101 << 6
011001100110111101000000 + 101111 = 011001100110111101101111


011001100110111101101111 // 按八位拆开为 01100110 01101111 01101111
即对应unicode码位为102 111 111, 准尉对应的字符为 f o o

[Unicode编码表](https://zh.wikipedia.org/wiki/Unicode%E5%AD%97%E7%AC%A6%E5%88%97%E8%A1%A8)

```

同理第二组对应的字符为: bar


第三组:
  因为第三组不满足一组有4个字符,所以在位移之前需要计算一下要处理的比特位数

```ts
    let number_of_original_bytes = Math.floor(
      (byteArrayChunk.length * BITS_PER_CHAR) / BITS_PER_BYTE
    ) // 1
    // Math.foor((2 * 6) / 8) = 1
    let padding =
      byteArrayChunk.length < CHARS_PER_CHUNK
        ? BITS_PER_CHAR -
          ((number_of_original_bytes * BITS_PER_BYTE) % BITS_PER_CHAR)
        : 0
    // 满足第一个条件,所以计算为 6 - ((1 * 8) % 6) = 6 - 2 = 4,也就是说要清除4个比特位
    let buf = 0n
    byteArrayChunk.forEach(byte => {
      // 向左6位
      buf = (buf << BigInt(BITS_PER_CHAR)) + BigInt(byte)
      console.log(buf.toString(2), '>>>')
    })
    // 移除填充的比特位
    buf >>= BigInt(padding)
```

  对应的二进制位为 011100 100000
```
  011100 << 6
  011100000000 + 100000 =  011100100000

  向右移动4位,去除填充的比特位得: 01110010
  然后8位一组分为: 01110001
  即对应unicode码位为114, 准尉对应的字符为 r
```

结合三组得到的字符最终结果为: foobarr

[完整代码](./index.ts#L261)