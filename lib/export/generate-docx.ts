import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export async function generateDocx(title: string, content: string, styles?: any): Promise<Blob> {
  const headingFont = styles?.fontHeading || "Arial";
  const bodyFont = styles?.fontBody || "Calibri";
  const primaryColor = styles?.primaryColor?.replace("#", "") || "000000";
  const secondaryColor = styles?.secondaryColor?.replace("#", "") || "444444";

  // Simple paragraph splitting by double newline
  const paragraphs = content.split(/\n\s*\n/).map(text => {
    // Check if it looks like a heading (e.g. starts with Chapter or #)
    // Note: The AI generator outputs HTML-like structure sometimes or markdown.
    // For now we assume plain text or markdown-ish.
    
    return new Paragraph({
      children: [
        new TextRun({
            text: text.trim(),
            font: bodyFont,
            size: 24, // 12pt
            color: "000000" // Body text usually black/dark grey
        })
      ],
      spacing: {
        after: 200, // Space after paragraph
      },
    });
  });

  const doc = new Document({
    styles: {
        default: {
            heading1: {
                run: {
                    font: headingFont,
                    size: 56, // 28pt
                    bold: true,
                    color: primaryColor,
                },
                paragraph: {
                    spacing: { after: 240 },
                },
            },
            heading2: {
                run: {
                    font: headingFont,
                    size: 42, // 21pt
                    bold: true,
                    color: secondaryColor,
                },
                paragraph: {
                    spacing: { before: 240, after: 120 },
                },
            },
        },
    },
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            spacing: {
                after: 400
            },
            children: [
                new TextRun({
                    text: title,
                    font: headingFont,
                    size: 64, // 32pt
                    bold: true,
                    color: primaryColor
                })
            ]
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
