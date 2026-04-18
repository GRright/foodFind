const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function crc32(buf) {
  let table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    table[i] = c
  }
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function createPNG(width, height, pixels) {
  const rawData = []
  for (let y = 0; y < height; y++) {
    rawData.push(0)
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      rawData.push(pixels[idx], pixels[idx+1], pixels[idx+2], pixels[idx+3])
    }
  }
  const rawBuf = Buffer.from(rawData)
  const compressed = zlib.deflateSync(rawBuf, { level: 9 })

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0)
    const typeB = Buffer.from(type)
    const crcData = Buffer.concat([typeB, data])
    const crcV = Buffer.alloc(4); crcV.writeUInt32BE(crc32(crcData), 0)
    return Buffer.concat([len, typeB, data, crcV])
  }

  const iend = chunk('IEND', Buffer.alloc(0))
  const idat = chunk('IDAT', compressed)
  const ihdrC = chunk('IHDR', ihdr)

  return Buffer.concat([sig, ihdrC, idat, iend])
}

function drawIcon(size, drawFn) {
  const pixels = new Uint8Array(size * size * 4)
  const center = size / 2
  const scale = size / 81

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      const result = drawFn(x / scale, y / scale, 40.5, 40.5)
      if (result === null || result === undefined) {
        pixels[idx] = pixels[idx+1] = pixels[idx+2] = pixels[idx+3] = 0
      } else if (typeof result === 'object') {
        pixels[idx] = result.r || 0
        pixels[idx+1] = result.g || 0
        pixels[idx+2] = result.b || 0
        pixels[idx+3] = result.a !== undefined ? result.a : 255
      } else {
        const c = result
        pixels[idx] = pixels[idx+1] = pixels[idx+2] = c
        pixels[idx+3] = 255
      }
    }
  }
  return createPNG(size, size, pixels)
}

function roundedRect(x, y, cx, cy, w, h, r) {
  if (x < cx - w/2 || x > cx + w/2 || y < cy - h/2 || y > cy + h/2) return null
  const lx = Math.abs(x - (cx - w/2)), rx = Math.abs(x - (cx + w/2))
  const ty = Math.abs(y - (cy - h/2)), by = Math.abs(y - (cy + h/2))
  const dx = Math.min(lx, rx), dy = Math.min(ty, by)
  if (dx >= r && dy >= r) return true
  if ((dx < r && dy >= r) || (dx >= r && dy < r)) {
    const cornerX = x < cx ? (cx - w/2 + r) : (cx + w/2 - r)
    const cornerY = y < cy ? (cy - h/2 + r) : (cy + h/2 - r)
    const dist = Math.sqrt((x-cornerX)**2 + (y-cornerY)**2)
    return dist <= r
  }
  return dx*dx/(r*r) + dy*dy/(r*r) <= 1
}

const outDir = path.join(__dirname, 'src', 'static', 'tabbar')

const HOME_NORMAL = { r:153, g:153, b:153 }
const HOME_ACTIVE = { r:7, g:193, b:96 }
const MENU_NORMAL = { r:153, g:153, b:153 }
const MENU_ACTIVE = { r:7, g:193, b:96 }
const PROFILE_NORMAL = { r:153, g:153, b:153 }
const PROFILE_ACTIVE = { r:7, g:193, b:96 }

function homeIcon(x, y, cx, cy) {
  if (!roundedRect(x,y,cx,cy,36,32,6)) return null
  const roofPoints = [[cx-22, cy-8], [cx, cy-20], [cx+22, cy-8]]
  let inRoof = false
  for (let i = 0; i < roofPoints.length-1; i++) {
    const [x1,y1] = roofPoints[i], [x2,y2] = roofPoints[i+1]
    if ((x-x1)*(y2-y1) - (y-y1)*(x2-x1) <= 0 &&
        x >= Math.min(x1,x2)-2 && x <= Math.max(x1,x2)+2 &&
        y >= Math.min(y1,y2)-2 && y <= Math.max(y1,y2)+2) inRoof = true
  }
  if (inRoof) return HOME_NORMAL
  if (roundedRect(x,y,cx,cy+2,28,18,4)) return HOME_NORMAL
  if (roundedRect(x,y,cx-8,cy+6,8,12,2)) return HOME_NORMAL
  if (roundedRect(x,y,cx+8,cy+6,8,12,2)) return HOME_NORMAL
  return null
}
function menuIcon(x, y, cx, cy) {
  if (!roundedRect(x,y,cx,cy,34,38,5)) return null
  if (roundedRect(x,y,cx,cy-14,22,4,2)) return MENU_NORMAL
  if (roundedRect(x,y,cx,cy-6,22,4,2)) return MENU_NORMAL
  if (roundedRect(x,y,cx,cy+2,22,4,2)) return MENU_NORMAL
  if (roundedRect(x,y,cx,cy+10,22,4,2)) return MENU_NORMAL
  if (roundedRect(x,y,cx+10,cy,8,28,3)) return MENU_NORMAL
  return null
}
function profileIcon(x, y, cx, cy) {
  const dist = Math.sqrt((x-cx)**2 + (y-cy)**2)
  if (dist > 20 || dist < 13) return null
  if (roundedRect(x,y,cx,cy-2,16,6,3)) return PROFILE_NORMAL
  if (roundedRect(x,y,cx-5,cy+4,6,8,3)) return PROFILE_NORMAL
  if (roundedRect(x,y,cx+5,cy+4,6,8,3)) return PROFILE_NORMAL
  return null
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

fs.writeFileSync(path.join(outDir, 'home.png'), drawIcon(81, homeIcon))
fs.writeFileSync(path.join(outDir, 'home-active.png'), drawIcon(81, (x,y,cx,cy)=>{
  const r = homeIcon(x,y,cx,cy); return r === null ? null : HOME_ACTIVE
}))
fs.writeFileSync(path.join(outDir, 'menu.png'), drawIcon(81, menuIcon))
fs.writeFileSync(path.join(outDir, 'menu-active.png'), drawIcon(81, (x,y,cx,cy)=>{
  const r = menuIcon(x,y,cx,cy); return r === null ? null : MENU_ACTIVE
}))
fs.writeFileSync(path.join(outDir, 'profile.png'), drawIcon(81, profileIcon))
fs.writeFileSync(path.join(outDir, 'profile-active.png'), drawIcon(81, (x,y,cx,cy)=>{
  const r = profileIcon(x,y,cx,cy); return r === null ? null : PROFILE_ACTIVE
}))

console.log('TabBar icons generated successfully!')
console.log(`Output: ${outDir}`)
console.log('Files: home.png, home-active.png, menu.png, menu-active.png, profile.png, profile-active.png')