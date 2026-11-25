type Cell = string | number | null | undefined
export function csvContent(rows: Cell[][]) {
  return (
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((cell) => {
            let value = String(cell ?? '')
            if (typeof cell === 'string' && /^[\s\uFEFF]*[=+@-]|^[\t\r\n]/.test(value)) value = "'" + value
            return '"' + value.replaceAll('"', '""') + '"'
          })
          .join(','),
      )
      .join('\r\n')
  )
}
export function downloadCsv(filename: string, rows: Cell[][]) {
  const url = URL.createObjectURL(new Blob([csvContent(rows)], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename + '.csv'
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
