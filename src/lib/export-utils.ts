import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportColumn {
  header: string;
  key: string;
}

interface ExportOptions {
  title: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  currency: string;
  footerRow?: string[];
}

export function exportToExcel({ title, columns, data, footerRow }: ExportOptions) {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) => columns.map((c) => row[c.key] ?? ""));
  const wsData = [headers, ...rows];
  if (footerRow) wsData.push(footerRow);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = columns.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
  XLSX.writeFile(wb, `${title}.xlsx`);
}

export function exportToPDF({ title, columns, data, currency, footerRow }: ExportOptions) {
  const doc = new jsPDF({ orientation: "landscape" });

  // Title
  doc.setFontSize(16);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

  // Date
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString("ar-IQ"), doc.internal.pageSize.getWidth() / 2, 22, { align: "center" });

  const headers = columns.map((c) => c.header);
  const rows = data.map((row) => columns.map((c) => {
    const val = row[c.key];
    if (typeof val === "number") return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return String(val ?? "");
  }));

  autoTable(doc, {
    head: [headers],
    body: rows,
    foot: footerRow ? [footerRow] : undefined,
    startY: 28,
    styles: {
      font: "helvetica",
      fontSize: 10,
      halign: "center",
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [15, 118, 110], // teal-700
      textColor: 255,
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 250, 249],
    },
  });

  doc.save(`${title}.pdf`);
}
