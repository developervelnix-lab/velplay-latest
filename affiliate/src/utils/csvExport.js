/**
 * Shared Utility to export tabular data to CSV format and trigger browser download.
 * @param {string} filename - Base name for the downloaded file.
 * @param {Array<string>} headers - Header row column titles.
 * @param {Array<Array<any>>|Array<Object>} data - Data rows.
 */
export const exportToCSV = (filename, headers, data) => {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }

  const lines = [];

  // Include UTF-8 BOM for proper currency character rendering in MS Excel
  if (headers && headers.length) {
    lines.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));
  }

  data.forEach(row => {
    let values = [];
    if (Array.isArray(row)) {
      values = row;
    } else if (typeof row === 'object' && row !== null) {
      values = Object.values(row);
    }
    const line = values.map(val => {
      let cell = val === null || val === undefined ? '' : String(val);
      cell = cell.replace(/"/g, '""');
      return `"${cell}"`;
    }).join(',');
    lines.push(line);
  });

  const csvContent = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
