'use strict'

const fs = require('fs')

const uncompress = require('./lib/uncompress')
const tile = require('./lib/tile')

/**
 * @param {Buffer} buf 
 */
function itp2dds(buf) {
    let ptr = 0;
    let magic = buf.readUInt32BE(ptr); ptr +=4
    switch (magic) {
        case 0x495450FF: // "ITP\xFF"
            break;
        case 999: // 0x3E7
        case 1000: // 0x3E8
        case 1001: // 0x3E9
        case 1002: // 0x3EA
        case 1003: // 0x3EB
        case 1004: // 0x3EC
        case 1005: // 0x3ED
        case 1006: // 0x3EE
            throw new Error('Unsupported ITP file, try [itxcnv](https://pokanchan.jp/dokuwiki/software/itxcnv) or [YamaNeko](https://github.com/Ouroboros/JuusanKoubou/tree/master/Source/Falcom/YamaNeko)');
        default:
            throw new Error('Unsupported ITP file, try other tools.');
    }

    let images_raw = []
    let width
    let height
    while (ptr < buf.length) {
        let type = buf.toString('utf8', ptr, ptr + 4); ptr += 4
        let length = buf.readUInt32LE(ptr); ptr += 4
        let data = buf.slice(ptr, ptr + length); ptr += length

        switch (type) {
            case 'IHDR':
                width = data.readUInt32LE(4)
                height = data.readUInt32LE(8)
                let version = data.readUInt32LE(24)
                switch (version) {
                    case 0: case 2:
                        throw new Error('Unsupported ITP file, try [it3cnv_Ys8](https://web.archive.org/web/20200607050641/https://heroesoflegend.org/forums/viewtopic.php?t=275&start=20)');
                    case 3:
                        break;
                    default:
                        throw new Error('Unsupported ITP file, try other tools.');
                }
                break;
            
            case 'IDAT':
                let block_count = data.readUInt32LE(12)
                let total_compressed = data.readUInt32LE(16)
                let total_original = data.readUInt32LE(24)

                let dptr = 28
                let image_raw = Buffer.allocUnsafe(total_original)
                let rptr = 0
                while (dptr < data.length) {
                    let size_compressed = data.readUInt32LE(dptr); dptr += 4
                    let size_original = data.readUInt32LE(dptr); dptr += 4
                    let compressed = data.slice(dptr, dptr + size_compressed); dptr += size_compressed

                    uncompress.uncompress(compressed, size_original).copy(image_raw, rptr); rptr += size_original
                }
                images_raw.push(image_raw)
                break;
        }
    }
    if (images_raw.length > 1) {
        console.log('Got more than 1 image, ignoring thumbnails.')
    }

    // a >> 2   <=>   Math.floor(a / 4)
    images_raw[0] = tile.untile(images_raw[0], width >> 2, height >> 2, 4 * 4 * 1)
    return bc72dds(images_raw[0], height, width)
}

function bc72dds(buf, height, width) {
    let ddsHead = Buffer.from([
        0x44, 0x44, 0x53, 0x20, // magic: DDS 
        0x7C, 0x00, 0x00, 0x00, // head size
        0x06, 0x00, 0x00, 0x00, // flags: DDSD_HEIGHT | DDSD_WIDTH
        0x00, 0x00, 0x00, 0x00, // height
        0x00, 0x00, 0x00, 0x00, // width
        0x00, 0x00, 0x00, 0x00, // pitchOrLinearSize
        0x00, 0x00, 0x00, 0x00, // depth
        0x01, 0x00, 0x00, 0x00, // mipMapCount: 1
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00,
        0x04, 0x00, 0x00, 0x00, 0x44, 0x58, 0x31, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,

        // DDS_HEADER_DXT10
        0x62, 0x00, 0x00, 0x00, // dxgiFormat: DXGI_FORMAT_BC7_UNORM
        0x03, 0x00, 0x00, 0x00, // resourceDimension: D3D10_RESOURCE_DIMENSION_TEXTURE2D
        0x00, 0x00, 0x00, 0x00, // miscFlag
        0x01, 0x00, 0x00, 0x00, // arraySize: 1
        0x00, 0x00, 0x00, 0x00  // miscFlags2: DDS_ALPHA_MODE_UNKNOWN
    ])

    ddsHead.writeUInt32LE(height, 12)
    ddsHead.writeUInt32LE(width, 16)
    ddsHead.writeUInt32LE(width, 20)
    
    return Buffer.concat([ddsHead, buf])
}

let myArgs = process.argv.slice(2)
if (myArgs.length < 1) {
    console.error('No file specified.')
    process.exit()
}

let success = 0

for (const file of myArgs) {
    console.log(`Processing ${file}...`)
    if (!file.toLowerCase().endsWith('.itp')) {
        console.error(`[Error] Only .itp supported`)
        continue
    }

    let outputFile = file.substr(0, file.length - 4) + '.dds'
    try {
        fs.writeFileSync(outputFile, itp2dds(fs.readFileSync(file)))
        console.log(`Done.`)
        success++
    } catch (e) {
        console.error(e)
    }
}

console.log(`Processed ${myArgs.length} file(s), ${success} succeed.`)