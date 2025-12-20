import jsPDF from "jspdf";

export function generatePdf(title: string, content: string, styles?: any): Blob {
  const doc = new jsPDF();
  
  // Style Config
  const primaryColor = styles?.primaryColor || "#000000";
  const secondaryColor = styles?.secondaryColor || "#444444";
  const headingFont = styles?.fontHeading?.toLowerCase().includes("serif") ? "times" : "helvetica";
  const bodyFont = styles?.fontBody?.toLowerCase().includes("serif") ? "times" : "helvetica";

  // Title
  doc.setFont(headingFont, "bold");
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(title, 20, 20);
  
  // Content
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(12);
  doc.setTextColor("#000000"); // Keep body text black for readability usually, or use secondaryColor?
  
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  const lineHeight = 7;
  
  const splitText = doc.splitTextToSize(content, maxWidth);
  
  let cursorY = 40;
  
  for (let i = 0; i < splitText.length; i++) {
    if (cursorY + lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(splitText[i], margin, cursorY);
    cursorY += lineHeight;
  }
  
  return doc.output("blob");
}
