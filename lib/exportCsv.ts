// Dependency-free spreadsheet export. Produces a UTF-8 CSV (with BOM) that
// Excel / Google Sheets open natively as a real spreadsheet — correct columns,
// no comma-mangling, no extra libraries to ship.

function escapeCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value)
  // Quote when the cell contains a comma, quote, or newline; escape inner quotes.
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function downloadCsv(filename: string, headers: string[], rows: (unknown[])[]) {
  const lines = [headers, ...rows].map((r) => r.map(escapeCell).join(','))
  // \uFEFF BOM makes Excel detect UTF-8 (keeps ₹, accents, emoji intact).
  const csv = '\uFEFF' + lines.join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
