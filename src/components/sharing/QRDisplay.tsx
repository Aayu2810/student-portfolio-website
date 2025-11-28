"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QRDisplayProps {
  url: string;
  title?: string;
  size?: number;
}

export function QRDisplay({ url, title = "Scan to Access", size = 200 }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
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

    canvas.width = size + 40;
    canvas.height = size + 40;

    img.onload = () => {
      if (ctx) {
        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw QR code centered
        ctx.drawImage(img, 20, 20, size, size);
      }

      // Download
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "qr-code.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card className="p-6 bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="space-y-4">
        {/* Title */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">
            Point your camera at the QR code
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center p-6 bg-white rounded-xl">
          <QRCodeSVG
            id="qr-code-svg"
            value={url}
            size={size}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* URL Display */}
        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-xs text-gray-400 break-all">{url}</p>
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
  );
}