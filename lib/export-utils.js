// Export utilities for JSON and CSV

export function exportToJSON(data, filename = "export.json") {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToCSV(data, filename = "export.csv") {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = []

  csvRows.push(headers.join(","))

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      const escaped = ("" + value).replace(/"/g, '\\"')
      return `"${escaped}"`
    })
    csvRows.push(values.join(","))
  }

  const csvString = csvRows.join("\n")
  const blob = new Blob([csvString], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
