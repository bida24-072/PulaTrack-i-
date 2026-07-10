// src/lib/csvExport.js
// Converts an array of transaction objects into a downloadable CSV file.
export function exportTransactionsToCSV(transactions, filename = "pulatrack-transactions.csv") {
  if (!transactions || transactions.length === 0) return;

  const headers = ["Date", "Type", "Category", "Amount (P)", "Note"];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString("en-GB"),
    t.type,
    t.category,
    t.amount,
    (t.note || "").replace(/,/g, ";"),
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
