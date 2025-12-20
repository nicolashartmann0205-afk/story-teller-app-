"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useMap } from "../map-context";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetRef: React.RefObject<HTMLDivElement | null>;
}

export function ExportDialog({ isOpen, onClose, targetRef }: ExportDialogProps) {
  const { storyId } = useMap();
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<"png" | "pdf">("png");

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!targetRef.current) return;
    setIsExporting(true);

    try {
      // We need to target the scrollable content's child to get the full width
      // The targetRef should point to the container with overflow-auto, 
      // but we want to capture its scrollHeight/Width. 
      // Actually, better to pass the specific content element ref.
      // For now, let's assume targetRef points to the wrapper of the view content.
      
      const element = targetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        width: element.scrollWidth,
        height: element.scrollHeight,
        x: 0,
        y: 0
      });

      const filename = `story-map-${storyId}-${new Date().toISOString().split("T")[0]}`;

      if (format === "png") {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `${filename}.png`;
        link.click();
      } else {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "landscape" : "portrait",
          unit: "px",
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`${filename}.pdf`);
      }
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export map. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Export Story Map</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Format
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormat("png")}
                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                  format === "png"
                    ? "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                PNG Image
              </button>
              <button
                onClick={() => setFormat("pdf")}
                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                  format === "pdf"
                    ? "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                PDF Document
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <span className="animate-spin">⏳</span> Exporting...
              </>
            ) : (
              "Export"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

