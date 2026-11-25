import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve('public/extracted_data')
const sourcePath = path.join(dataDir, 'all_tests.json')
const indexPath = path.join(dataDir, 'tests_index.json')
const testsDir = path.join(dataDir, 'tests')

const raw = fs.readFileSync(sourcePath, 'utf8')
const allData = JSON.parse(raw)

fs.mkdirSync(testsDir, { recursive: true })

function toIndexItem(test) {
  if (!test) return null
  const paperFlags = {}
  for (const key of Object.keys(test.papers || {})) {
    if (test.papers[key]) {
      paperFlags[key] = true
    }
  }

  const entry = {
    test_id: test.test_id,
    title: test.title,
    papers: paperFlags,
  }
  if (test.test_number !== undefined) entry.test_number = test.test_number
  if (test.isOnline !== undefined) entry.isOnline = test.isOnline
  if (test.paper_type !== undefined) entry.paper_type = test.paper_type
  if (test.docTab !== undefined) entry.docTab = test.docTab
  if (test.highExamProb !== undefined) entry.highExamProb = test.highExamProb
  if (test.highExamProbParts !== undefined) entry.highExamProbParts = test.highExamProbParts
  if (test.highExamProbNote !== undefined) entry.highExamProbNote = test.highExamProbNote
  return entry
}

function writeTestDetail(test) {
  if (!test || !test.test_id) return 0
  const filePath = path.join(testsDir, `${test.test_id}.json`)
  const json = JSON.stringify(test)
  fs.writeFileSync(filePath, json, 'utf8')
  return Buffer.byteLength(json, 'utf8')
}

const detailSizes = []

const indexPayload = {
  tests: (allData.tests || []).map((t) => {
    detailSizes.push({ id: t.test_id, bytes: writeTestDetail(t) })
    return toIndexItem(t)
  }),
  sample_test: allData.sample_test
    ? (() => {
        detailSizes.push({
          id: allData.sample_test.test_id,
          bytes: writeTestDetail(allData.sample_test),
        })
        return toIndexItem(allData.sample_test)
      })()
    : null,
  online_tests: (allData.online_tests || []).map((t) => {
    detailSizes.push({ id: t.test_id, bytes: writeTestDetail(t) })
    return toIndexItem(t)
  }),
}

const indexJson = JSON.stringify(indexPayload)
fs.writeFileSync(indexPath, indexJson, 'utf8')

const srcBytes = Buffer.byteLength(raw, 'utf8')
const idxBytes = Buffer.byteLength(indexJson, 'utf8')
const maxDetail = detailSizes.reduce((a, b) => (b.bytes > a.bytes ? b : a), { id: '', bytes: 0 })

console.log(`Source all_tests.json: ${(srcBytes / 1024).toFixed(2)} KB`)
console.log(`Index tests_index.json: ${(idxBytes / 1024).toFixed(2)} KB (-${(((srcBytes - idxBytes) / srcBytes) * 100).toFixed(1)}%)`)
console.log(`Detail JSON files written: ${detailSizes.length} (largest: ${maxDetail.id}.json = ${(maxDetail.bytes / 1024).toFixed(2)} KB)`)
