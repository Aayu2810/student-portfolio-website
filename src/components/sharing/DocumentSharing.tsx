"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, Check, File, FileText, Image as ImageIcon, ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Document } from "@/types/locker.types";

interface DocumentSharingProps {
  documents: Document[];
}

export function DocumentSharing({ documents }: DocumentSharingProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [currentQRIndex, setCurrentQRIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shareMode, setShareMode] = useState<"combined" | "individual">("combined");

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="w-8 h-8" />;
    } else if (fileType === "application/pdf") {
      return <FileText className="w-8 h-8" />;
    }
    return <File className="w-8 h-8" />;
  };

  const getShareUrl = (docId: string) => {
    return `https://campuscred.com/shared/${docId}`;
  };

  const getCombinedShareUrl = (docIds: string[]) => {
    const idsParam = docIds.join(',');
    return `https://campuscred.com/shared/collection/${idsParam}`;
  };

  const handleDocumentClick = (docId: string, index: number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedIndex !== null) {
      // Shift-click: select range
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = documents.slice(start, end + 1).map(d => d.id);
      
      // Add all documents in range to selection
      setSelectedDocuments(prev => {
        const newSelection = [...prev];
        rangeIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    } else {
      // Regular click: toggle selection
      setSelectedDocuments(prev => {
        if (prev.includes(docId)) {
          return prev.filter(id => id !== docId);
        } else {
          return [...prev, docId];
        }
      });
      setLastSelectedIndex(index);
    }
    
    // Reset to first QR code when selection changes
    setCurrentQRIndex(0);
  };

  const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
  const currentDoc = selectedDocs[currentQRIndex];

  const handleCopyLink = () => {
    let url: string;
    if (shareMode === "combined") {
      url = getCombinedShareUrl(selectedDocuments);
    } else {
      if (!currentDoc) return;
      url = getShareUrl(currentDoc.id);
    }
    
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const size = 240;
    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      if (ctx) {
        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw QR code centered
        ctx.drawImage(img, 20, 20, size - 40, size - 40);
      }

      // Download
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      if (shareMode === "combined") {
        downloadLink.download = `qr-collection-${selectedDocuments.length}-docs.png`;
      } else {
        downloadLink.download = `qr-${currentDoc?.name}.png`;
      }
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrevious = () => {
    setCurrentQRIndex(prev => (prev > 0 ? prev - 1 : selectedDocs.length - 1));
    setCopied(false);
  };

  const handleNext = () => {
    setCurrentQRIndex(prev => (prev < selectedDocs.length - 1 ? prev + 1 : 0));
    setCopied(false);
  };

  const getCurrentQRUrl = () => {
    if (shareMode === "combined") {
      return getCombinedShareUrl(selectedDocuments);
    } else {
      return currentDoc ? getShareUrl(currentDoc.id) : "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Select Document to Share</h3>
          {selectedDocuments.length > 0 && (
            <span className="text-sm text-purple-400">
              {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          Click to select, hold Shift + Click to select multiple
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc, index) => (
            <button
              key={doc.id}
              onClick={(e) => handleDocumentClick(doc.id, index, e)}
              className={cn(
                "p-4 rounded-lg border-2 transition-all text-left",
                "hover:scale-105 hover:shadow-lg",
                selectedDocuments.includes(doc.id)
                  ? "bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-400/30"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full h-24 rounded-lg bg-white/5">
                  <span className="text-purple-400">{getFileIcon(doc.fileType)}</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* QR Code Display */}
      {selectedDocs.length > 0 && (
        <Card className="p-6 bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="space-y-4">
            {/* Share Mode Toggle (only show for multiple selections) */}
            {selectedDocs.length > 1 && (
              <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                <button
                  onClick={() => setShareMode("combined")}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                    shareMode === "combined"
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <FolderOpen className="w-4 h-4" />
                  Combined Link
                </button>
                <button
                  onClick={() => setShareMode("individual")}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                    shareMode === "individual"
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <File className="w-4 h-4" />
                  Individual Links
                </button>
              </div>
            )}

            {/* Title with navigation */}
            <div className="text-center">
              {shareMode === "combined" ? (
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Share Collection: {selectedDocs.length} Documents
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedDocs.map(d => d.name).join(", ")}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  {selectedDocs.length > 1 && (
                    <Button
                      onClick={handlePrevious}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-purple-400/20"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      Share: {currentDoc?.name}
                    </h3>
                    {selectedDocs.length > 1 && (
                      <p className="text-xs text-purple-400 mt-1">
                        {currentQRIndex + 1} of {selectedDocs.length}
                      </p>
                    )}
                  </div>
                  {selectedDocs.length > 1 && (
                    <Button
                      onClick={handleNext}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-purple-400/20"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-400 mt-2">
                Point your camera at the QR code
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center p-6 bg-white rounded-xl">
              <QRCodeSVG
                id="qr-code-svg"
                value={getCurrentQRUrl()}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* URL Display */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs text-gray-400 break-all">
                {getCurrentQRUrl()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex-1 border-white/10 hover:bg-purple-400/20"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                size="sm"
                className="flex-1 border-white/10 hover:bg-purple-400/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
