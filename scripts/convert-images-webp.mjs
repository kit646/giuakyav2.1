import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const imagesRoot = path.resolve('public/extracted_data/images')

function collectPngFiles(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectPngFiles(fullPath))
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      results.push(fullPath)
    }
  }
  return results
}

const pngFiles = collectPngFiles(imagesRoot)
let totalPngBytes = 0
let totalWebpBytes = 0
let convertedCount = 0

// Process in bounded batches so Sharp doesn't exhaust memory/libuv threads
const BATCH_SIZE = 12
for (let i = 0; i < pngFiles.length; i += BATCH_SIZE) {
  const batch = pngFiles.slice(i, i + BATCH_SIZE)
  await Promise.all(
    batch.map(async (pngPath) => {
      const webpPath = pngPath.replace(/\.png$/i, '.webp')
      const pngStat = fs.statSync(pngPath)
      totalPngBytes += pngStat.size

      await sharp(pngPath).webp({ quality: 80, effort: 4 }).toFile(webpPath)
      const webpStat = fs.statSync(webpPath)
      totalWebpBytes += webpStat.size
      convertedCount += 1
    })
  )
}

const savedBytes = totalPngBytes - totalWebpBytes
const savedPct = totalPngBytes > 0 ? ((savedBytes / totalPngBytes) * 100).toFixed(1) : '0.0'

console.log(`Converted ${convertedCount} PNG files to WebP (quality: 80)`)
console.log(`Total PNG size:  ${(totalPngBytes / (1024 * 1024)).toFixed(2)} MB`)
console.log(`Total WebP size: ${(totalWebpBytes / (1024 * 1024)).toFixed(2)} MB (-${savedPct}%)`)
