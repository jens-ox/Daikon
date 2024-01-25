/** * Static Pseudo-constants ***/
export const MAX_VALUE = 9007199254740991
export const MIN_VALUE = -9007199254740991

export const dec2hex = (i: number) => (i + 0x10000).toString(16).substring(-4).toUpperCase()

type NestedArray<T> = Array<T | NestedArray<T>>

// https://stackoverflow.com/a/12588826
export const createArray = (...dimensions: number[]): NestedArray<number> => {
  if (dimensions.length > 1) {
    const dim = dimensions[0]
    const rest = dimensions.slice(1)
    const newArray = []
    for (let i = 0; i < dim; i++) {
      newArray[i] = createArray(...rest)
    }
    return newArray
  } else {
    return Array(dimensions[0]).fill(undefined)
  }
}

export const getStringAt = (dataview: DataView, start: number, length: number) => {
  let str = ''

  for (let ctr = 0; ctr < length; ctr += 1) {
    const ch = dataview.getUint8(start + ctr)

    if (ch !== 0) {
      str += String.fromCharCode(ch)
    }
  }

  return str
}

export const trim = (str: string) => str.replace(/^\s\s*/, '').replace(/\s\s*$/, '')

export const stripLeadingZeros = (str: string) => str.replace(/^[0]+/g, '')

export const safeParseInt = (str: string) => {
  str = stripLeadingZeros(str)
  if (str.length > 0) {
    return parseInt(str, 10)
  }

  return 0
}

export const convertCamcelCaseToTitleCase = (str: string) => {
  const result = str.replace(/([A-Z][a-z])/g, ' $1')
  return trim(result.charAt(0).toUpperCase() + result.slice(1))
}

export const safeParseFloat = function (str: string) {
  str = stripLeadingZeros(str)
  if (str.length > 0) {
    return parseFloat(str)
  }

  return 0
}

// http://stackoverflow.com/questions/8361086/convert-byte-array-to-numbers-in-javascript
export const bytesToDouble = function (data: number[]) {
  const sign = (data[0] & (1 << 7)) >> 7

  const exponent = ((data[0] & 127) << 4) | ((data[1] & (15 << 4)) >> 4)

  if (exponent === 0) return 0
  if (exponent === 0x7ff) return sign ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY

  const mul = Math.pow(2, exponent - 1023 - 52)
  const mantissa =
    data[7] +
    data[6] * Math.pow(2, 8) +
    data[5] * Math.pow(2, 8 * 2) +
    data[4] * Math.pow(2, 8 * 3) +
    data[3] * Math.pow(2, 8 * 4) +
    data[2] * Math.pow(2, 8 * 5) +
    (data[1] & 15) * Math.pow(2, 8 * 6) +
    Math.pow(2, 52)

  return Math.pow(-1, sign) * mantissa * mul
}

export const concatArrayBuffers = function (buffer1: Buffer, buffer2: Buffer) {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
  tmp.set(new Uint8Array(buffer1), 0)
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
  return tmp.buffer
}

export const concatArrayBuffers2 = function (buffers: Buffer[]) {
  let length = 0
  let offset = 0

  for (let ctr = 0; ctr < buffers.length; ctr += 1) {
    length += buffers[ctr].byteLength
  }

  const tmp = new Uint8Array(length)

  for (let ctr = 0; ctr < buffers.length; ctr += 1) {
    tmp.set(new Uint8Array(buffers[ctr]), offset)
    offset += buffers[ctr].byteLength
  }

  return tmp.buffer
}

export const fillBuffer = function (array: number[], buffer: DataView, offset: number, numBytes: number) {
  if (numBytes === 1) {
    for (let ctr = 0; ctr < array.length; ctr += 1) {
      buffer.setUint8(offset + ctr, array[ctr])
    }
  } else if (numBytes === 2) {
    for (let ctr = 0; ctr < array.length; ctr += 1) {
      buffer.setUint16(offset + ctr * 2, array[ctr], true)
    }
  }
}

export const fillBufferRGB = function (array: number[], buffer: DataView, offset: number) {
  const numElements = Math.round(array.length / 3)

  for (let ctr = 0; ctr < numElements; ctr += 1) {
    const r = array[ctr * 3]
    const g = array[ctr * 3 + 1]
    const b = array[ctr * 3 + 2]

    buffer.setUint8(offset + ctr, Math.round((r + b + g) / 3))
  }
}

export const bind = function (scope, fn, args, appendArgs) {
  if (arguments.length === 2) {
    return function () {
      return fn.apply(scope, arguments)
    }
  }

  const method = fn
  const slice = Array.prototype.slice

  return function () {
    let callArgs = args || arguments

    if (appendArgs === true) {
      callArgs = slice.call(arguments, 0)
      callArgs = callArgs.concat(args)
    } else if (typeof appendArgs === 'number') {
      callArgs = slice.call(arguments, 0) // copy arguments first
      Array.insert(callArgs, appendArgs, args)
    }

    return method.apply(scope || window, callArgs)
  }
}

// http://stackoverflow.com/questions/203739/why-does-instanceof-return-false-for-some-literals
export const isString = function (s) {
  return typeof s === 'string' || s instanceof String
}

// http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
export const isValidDate = function (d) {
  if (Object.prototype.toString.call(d) === '[object Date]') {
    if (isNaN(d.getTime())) {
      return false
    } else {
      return true
    }
  } else {
    return false
  }
}

export const swap32 = function (val) {
  return ((val & 0xff) << 24) | ((val & 0xff00) << 8) | ((val >> 8) & 0xff00) | ((val >> 24) & 0xff)
}

export const swap16 = function (val) {
  return ((((val & 0xff) << 8) | ((val >> 8) & 0xff)) << 16) >> 16 // since JS uses 32-bit when bit shifting
}

// http://stackoverflow.com/questions/18638900/javascript-crc32
export const makeCRCTable = function () {
  let c
  const crcTable = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    crcTable[n] = c
  }
  return crcTable
}

export const crcTable = makeCRCTable()

export const crc32 = function (dataView) {
  let crc = 0 ^ -1

  for (let i = 0; i < dataView.byteLength; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ dataView.getUint8(i)) & 0xff]
  }

  return (crc ^ -1) >>> 0
}

export const createBitMask = function (numBytes, bitsStored, unsigned) {
  let mask = 0xffffffff
  mask >>>= (4 - numBytes) * 8 + (numBytes * 8 - bitsStored)

  if (unsigned) {
    if (numBytes === 1) {
      mask &= 0x000000ff
    } else if (numBytes === 2) {
      mask &= 0x0000ffff
    } else if (numBytes === 4) {
      mask &= 0xffffffff
    } else if (numBytes === 8) {
      mask = 0xffffffff
    }
  } else {
    mask = 0xffffffff
  }

  return mask
}
