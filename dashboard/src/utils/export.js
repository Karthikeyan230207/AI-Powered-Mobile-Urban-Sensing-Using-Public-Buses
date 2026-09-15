/**
 * Utility functions for exporting data to CSV and JSON downloads.
 */

export function downloadCSV(data = [], filename = "incidents.csv") {
  if (!data || data.length === 0) return;

  const headers = [
    "id",
    "incident_type",
    "severity",
    "confidence",
    "status",
    "verified",
    "priority_score",
    "latitude",
    "longitude",
    "bus_number",
    "description",
    "detected_at",
  ];

  const rows = data.map((item) =>
    headers
      .map((header) => {
        let val = item[header];
        if (val === null || val === undefined) val = "";
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(data = {}, filename = "urban_sensing_backup.json") {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const link = document.createElement("a");
  link.setAttribute("href", jsonString);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
