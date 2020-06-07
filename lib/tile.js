'use strict'

// UnTile logic by @xdanieldzd (MIT)
// https://github.com/xdanieldzd/GXTConvert/blob/master/GXTConvert/Conversion/PostProcessing.cs

const tileOrder = [
     0,  1,  8,  9,  2,  3, 10, 11,
    16, 17, 24, 25, 18, 19, 26, 27,
     4,  5, 12, 13,  6,  7, 14, 15,
    20, 21, 28, 29, 22, 23, 30, 31,
    32, 33, 40, 41, 34, 35, 42, 43,
    48, 49, 56, 57, 50, 51, 58, 59,
    36, 37, 44, 45, 38, 39, 46, 47,
    52, 53, 60, 61, 54, 55, 62, 63
]

function getTilePixelIndex(t, x, y, width) {
    // a >> 3   <=>   Math.floor(a / 8)
    // a & 7    <=>   a % 8
    return ((tileOrder[t] >> 3) + y) * width + ((tileOrder[t] & 7) + x)
}

function untile(pixelData, width, height, bytesPerPixel) {
    let untiled = Buffer.alloc(pixelData.length)
    let s = 0
    for (let y = 0; y < height; y += 8) {
        for (let x = 0; x < width; x += 8) {
            for (let t = 0; t < (8 * 8); t++) {
                let pixelOffset = getTilePixelIndex(t, x, y, width) * bytesPerPixel
                pixelData.copy(untiled, pixelOffset, s, s + bytesPerPixel)
                s += bytesPerPixel
            }
        }
    }

    return untiled
}

module.exports = { untile }
