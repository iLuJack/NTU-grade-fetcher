export function convertToCSV(data, headers) {
    // First row is headers
    const headerRow = headers.join(',');
    
    // Convert each data row to CSV
    const rows = data.map(row => 
        headers.map(header => 
            `"${(row[header] || '').toString().replace(/"/g, '""')}"`
        ).join(',')
    );

    // Combine headers and rows
    return [headerRow, ...rows].join('\n');
}

export function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
} 