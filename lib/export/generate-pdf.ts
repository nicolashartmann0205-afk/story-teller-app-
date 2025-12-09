import jsPDF from "jspdf";

export function generatePdf(title: string, content: string): Blob {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(24);
  // Centered title roughly
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(title, 20, 20);
  
  // Content
  doc.setFontSize(12);
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  const lineHeight = 7;
  
  const splitText = doc.splitTextToSize(content, maxWidth);
  
  let cursorY = 40;
  
  // Iterate through lines to handle page breaks
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


