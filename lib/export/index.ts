import { saveAs } from "file-saver";
import { generateTxt } from "./generate-txt";
import { generateMarkdown } from "./generate-markdown";
import { generateDocx } from "./generate-docx";
import { generatePdf } from "./generate-pdf";

export type ExportFormat = "txt" | "md" | "docx" | "pdf";

export async function exportStory(title: string, content: string, format: ExportFormat) {
  const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${format}`;
  
  let blob: Blob;
  
  switch (format) {
    case "txt":
      blob = new Blob([generateTxt(title, content)], { type: "text/plain;charset=utf-8" });
      saveAs(blob, filename);
      break;
    case "md":
        blob = new Blob([generateMarkdown(title, content)], { type: "text/markdown;charset=utf-8" });
        saveAs(blob, filename);
        break;
    case "docx":
        blob = await generateDocx(title, content);
        saveAs(blob, filename);
        break;
    case "pdf":
        blob = generatePdf(title, content);
        saveAs(blob, filename);
        break;
  }
}



