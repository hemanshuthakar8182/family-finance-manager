import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./currency";

export interface MonthlyPDFReportData {
  familyName: string;
  monthName: string;
  year: number;
  generatedAt: Date;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    savingsRate: number;
  };
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
    color?: string;
  }>;
  members: Array<{
    name: string;
    role: string;
    amount: number;
    percentage: number;
  }>;
  topTransactions?: Array<{
    date: string;
    description: string;
    category: string;
    amount: number;
  }>;
}

export function generateMonthlyPDFReport(data: MonthlyPDFReportData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Colors
  const primaryColor = [15, 118, 110]; // #0F766E Teal
  const darkTextColor = [30, 41, 59]; // Slate 800
  const lightTextColor = [100, 116, 139]; // Slate 500
  const expenseColor = [225, 29, 72]; // Rose 600
  const incomeColor = [5, 150, 105]; // Emerald 600

  // ── 1. Top Header Banner ──
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`${data.familyName || "Family"} Financial Statement`, margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Monthly Financial Statement & Audit Report", margin, 19);

  // Date & Period (Top right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${data.monthName} ${data.year}`, pageWidth - margin, 12, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Family: ${data.familyName}`, pageWidth - margin, 18, { align: "right" });
  doc.text(`Generated: ${data.generatedAt.toLocaleDateString()}`, pageWidth - margin, 23, {
    align: "right",
  });

  let currentY = 36;

  // ── 2. Executive Summary Cards ──
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Executive Summary", margin, currentY);
  currentY += 4;

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 20;

  const kpis = [
    {
      label: "TOTAL INCOME",
      val: formatCurrency(data.summary.totalIncome),
      color: incomeColor,
    },
    {
      label: "TOTAL EXPENSES",
      val: formatCurrency(data.summary.totalExpense),
      color: expenseColor,
    },
    {
      label: "NET SAVINGS",
      val: formatCurrency(data.summary.netSavings),
      color: data.summary.netSavings >= 0 ? incomeColor : expenseColor,
    },
    {
      label: "SAVINGS RATE",
      val: `${Math.round(data.summary.savingsRate)}%`,
      color: primaryColor,
    },
  ];

  kpis.forEach((kpi, i) => {
    const x = margin + i * (cardWidth + 3);
    // Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, "FD");

    // Label
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(kpi.label, x + 4, currentY + 6);

    // Value
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(kpi.val, x + 4, currentY + 14);
  });

  currentY += cardHeight + 10;

  // ── 3. Category Spending Breakdown Table ──
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Expense Breakdown by Category", margin, currentY);
  currentY += 2;

  const categoryRows = data.categories.map((c) => [
    c.name,
    formatCurrency(c.amount),
    `${c.percentage.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Category", "Amount Spent", "% of Total Outflow"]],
    body: categoryRows.length > 0 ? categoryRows : [["No expenses recorded", "₹0", "0%"]],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: darkTextColor as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right", fontStyle: "bold" },
      2: { halign: "right" },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a page break
  if (currentY + 50 > pageHeight) {
    doc.addPage();
    currentY = 20;
  }

  // ── 4. Family Member Spending Breakdown ──
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Spending by Family Member", margin, currentY);
  currentY += 2;

  const memberRows = data.members.map((m) => [
    m.name,
    m.role,
    formatCurrency(m.amount),
    `${m.percentage.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Family Member", "Role", "Amount Spent", "Share %"]],
    body: memberRows.length > 0 ? memberRows : [["No member data", "-", "₹0", "0%"]],
    theme: "striped",
    headStyles: {
      fillColor: [51, 65, 85], // Slate 700
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: darkTextColor as [number, number, number],
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      2: { halign: "right", fontStyle: "bold" },
      3: { halign: "right" },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ── 5. Top Significant Expenses ──
  if (data.topTransactions && data.topTransactions.length > 0) {
    if (currentY + 50 > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Significant Monthly Expenses", margin, currentY);
    currentY += 2;

    const txRows = data.topTransactions.map((tx) => [
      tx.date,
      tx.description,
      tx.category,
      formatCurrency(tx.amount),
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["Date", "Description", "Category", "Amount"]],
      body: txRows,
      theme: "striped",
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: darkTextColor as [number, number, number],
      },
      columnStyles: {
        0: { cellWidth: 26 },
        3: { halign: "right", fontStyle: "bold", textColor: expenseColor as [number, number, number] },
      },
    });
  }

  // ── Footer on all pages ──
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);

    doc.text(
      `Family Personal Finance Manager • Confidential Financial Record`,
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, {
      align: "right",
    });
  }

  // Download PDF file
  const sanitizedFamily = data.familyName.replace(/\s+/g, "_");
  const fileName = `Financial_Statement_${sanitizedFamily}_${data.monthName}_${data.year}.pdf`;
  doc.save(fileName);
}
