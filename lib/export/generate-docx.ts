import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export async function generateDocx(title: string, content: string): Promise<Blob> {
  // Simple paragraph splitting by double newline
  const paragraphs = content.split(/\n\s*\n/).map(text => {
    return new Paragraph({
      children: [new TextRun(text.trim())],
      spacing: {
        after: 200, // Space after paragraph
      },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            spacing: {
                after: 400
            }
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}


