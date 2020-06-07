'use strict'

const fs = require('fs')

function uncompress(buf, originalLength) {
    let extra = buf.readInt32LE(0)
    let body = buf.slice(4)
    
    if (extra !== 0) {
        if (extra !== 8) {
            throw new Error(`Current parameter (extra=${extra}) isn\'t tested, use with caution.`)
        }
        return uncompress_body(body, originalLength, buf[0])
    }
    return body
}

function uncompress_body(inBuf, originalLength, extra) {
    let outBuf = Buffer.alloc(originalLength)
    let iptr = 0 // inBuf pointer
    let optr = 0 // outBuf pointer
    while (iptr < inBuf.length) {
        let op
        let num
        if (extra === 8) {
            op = inBuf[iptr]
            num = inBuf[iptr + 1]
        } else {
            let int16 = inBuf.readUInt16LE(iptr)
            op = ((1 << extra) - 1) & int16
            num = ((-1 << extra) & int16) >> extra
        }
        if (op) {
            let cpptr = optr - num - 1
            if (op > num + 1) {
                for (let i = 0; i < op; i++) {
                    outBuf[optr] = outBuf[cpptr]
                    cpptr++
                    optr++
                }
            } else {
                outBuf.copy(outBuf, optr, cpptr, cpptr + op)
                // memmove(optr, cpptr, op)
                optr += op
            }
            outBuf[optr] = inBuf[iptr + 2]
            optr++
            iptr += 3
        } else {
            iptr += 2
            if (num) {
                inBuf.copy(outBuf, optr, iptr, iptr + num)
                // memmove(optr, iptr, num)
                optr += num
                iptr += num
            }
        }
    }
    if (optr !== outBuf.length) {
        throw new Error(`Wrong Original Length! expect: ${originalLength}, actual: ${optr}`)
    }

    return outBuf
}

module.exports = { uncompress }