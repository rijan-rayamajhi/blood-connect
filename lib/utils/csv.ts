export function jsonToCsv(items: Record<string, string | number | boolean | null | undefined>[]): string {
    if (!items || items.length === 0) return '';
    const headers = Object.keys(items[0]);
    const csvRows = [
        headers.join(','),
        ...items.map(row =>
            headers.map(fieldName => {
                const val = row[fieldName];
                if (val === null || val === undefined) return '';
                const str = String(val);
                if (str.includes(',') || str.includes('\n') || str.includes('"')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',')
        )
    ];
    return csvRows.join('\r\n');
}
