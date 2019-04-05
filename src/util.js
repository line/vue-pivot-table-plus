export function downloadTableWithTSV (cols, colFields, rows, rowFields, rowHeaderSize, values) {
  let filename = getFilenameByDate(new Date()) + '.tsv'
  formatAndDownloadWithText(cols, colFields, rows, rowFields, rowHeaderSize, values, '\t', filename)
}

export function downloadTableWithCSV (cols, colFields, rows, rowFields, rowHeaderSize, values) {
  let filename = getFilenameByDate(new Date()) + '.csv'
  formatAndDownloadWithText(cols, colFields, rows, rowFields, rowHeaderSize, values, ',', filename)
}

function toDoubleDigits (num) {
  return ('0' + num).slice(-2)
}

function getFilenameByDate (date) {
  let y = date.getFullYear()
  let m = toDoubleDigits(date.getMonth() + 1)
  let d = toDoubleDigits(date.getDate())
  let h = toDoubleDigits(date.getHours())
  let _m = toDoubleDigits(date.getMinutes())
  let s = toDoubleDigits(date.getSeconds())
  return y + m + d + '-' + h + _m + s
}

function formatAndDownloadWithText (cols, colFields, rows, rowFields, rowHeaderSize, values, delimiter, filename) {
  let text = ''
  colFields.map((_, colFieldIndex) => {
    for (let i = 0; i < rowHeaderSize; i++) {
      text += delimiter
    }
    cols.map((col) => {
      text += `${col[colFieldIndex]}`
      text += delimiter
    })
    text += '\n'
  })

  rows.map((row) => {
    text += rowFields.map((_, rowFieldIndex) => row[rowFieldIndex]).join(delimiter)
    text += rowHeaderSize > 0 ? delimiter : ''
    text += cols.map((col) => values[JSON.stringify({ col, row })]).join(delimiter)
    text += '\n'
  })

  const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
  const blob = new Blob([bom, text], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}
