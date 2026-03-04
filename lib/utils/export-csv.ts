/**
 * Export an array of objects to a CSV file and trigger download.
 */
export function exportToCSV(filename: string, rows: Record<string, string | number | boolean | null | undefined>[]) {
    if (rows.length === 0) return

    const headers = Object.keys(rows[0])

    const csvLines = [
        headers.join(","),
        ...rows.map((row) =>
            headers
                .map((h) => {
                    const val = row[h]
                    if (val === null || val === undefined) return '""'
                    const str = String(val).replace(/"/g, '""')
                    return `"${str}"`
                })
                .join(",")
        ),
    ]

    const csvContent = csvLines.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

/**
 * Generate a standardized report filename with date.
 */
export function reportFilename(prefix: string): string {
    const date = new Date().toISOString().split("T")[0]
    return `bloodconnect-${prefix}-${date}.csv`
}
