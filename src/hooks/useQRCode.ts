import { useState, useCallback, useEffect } from 'react';

export interface QRCodeOptions {
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
}

export interface QRCodeData {
  id: string;
  url: string;
  dataURL: string;
  documentId?: string;
  shareId?: string;
  createdAt: Date;
  expiresAt?: Date;
  scanCount: number;
}

interface QRCodeState {
  qrCodes: Map<string, QRCodeData>;
  isGenerating: boolean;
  error: string | null;
}

export const useQRCode = () => {
  const [state, setState] = useState<QRCodeState>({
    qrCodes: new Map(),
    isGenerating: false,
    error: null,
  });

  // Generate QR code
  const generateQRCode = useCallback(
    async (
      data: string,
      options: QRCodeOptions = {}
    ): Promise<QRCodeData | null> => {
      setState((prev) => ({ ...prev, isGenerating: true, error: null }));

      try {
        const defaultOptions: QRCodeOptions = {
          size: 256,
          bgColor: '#ffffff',
          fgColor: '#000000',
          level: 'M',
          includeMargin: true,
          ...options,
        };

        // Generate QR code on the server
        const response = await fetch('/api/qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data,
            options: defaultOptions,
          }),
        });

        if (!response.ok) throw new Error('QR code generation failed');

        const qrCodeData: QRCodeData = await response.json();

        setState((prev) => {
          const newMap = new Map(prev.qrCodes);
          newMap.set(qrCodeData.id, qrCodeData);
          return {
            ...prev,
            qrCodes: newMap,
            isGenerating: false,
          };
        });

        return qrCodeData;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'QR generation failed',
          isGenerating: false,
        }));
        return null;
      }
    },
    []
  );

  // Generate QR code for document share
  const generateDocumentQR = useCallback(
    async (
      documentId: string,
      shareId: string,
      options?: QRCodeOptions
    ): Promise<QRCodeData | null> => {
      const shareURL = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/shared/${shareId}`;
      
      const qrOptions: QRCodeOptions = {
        size: 300,
        bgColor: '#0f0f1e',
        fgColor: '#a78bfa',
        level: 'H',
        includeMargin: true,
        ...options,
      };

      const qrData = await generateQRCode(shareURL, qrOptions);

      if (qrData) {
        // Associate with document
        setState((prev) => {
          const newMap = new Map(prev.qrCodes);
          const updatedData = {
            ...qrData,
            documentId,
            shareId,
          };
          newMap.set(qrData.id, updatedData);
          return { ...prev, qrCodes: newMap };
        });

        return { ...qrData, documentId, shareId };
      }

      return null;
    },
    [generateQRCode]
  );

  // Download QR code as image
  const downloadQRCode = useCallback((qrCodeId: string, filename?: string) => {
    const qrData = state.qrCodes.get(qrCodeId);
    if (!qrData) {
      console.error('QR code not found');
      return;
    }

    const link = document.createElement('a');
    link.href = qrData.dataURL;
    link.download = filename || `qr-code-${qrCodeId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state.qrCodes]);

  // Get QR code by ID
  const getQRCode = useCallback(
    (qrCodeId: string): QRCodeData | null => {
      return state.qrCodes.get(qrCodeId) || null;
    },
    [state.qrCodes]
  );

  // Get QR code by document ID
  const getQRCodeByDocument = useCallback(
    (documentId: string): QRCodeData | null => {
      for (const qrData of Array.from(state.qrCodes.values())) {
        if (qrData.documentId === documentId) {
          return qrData;
        }
      }
      return null;
    },
    [state.qrCodes]
  );

  // Delete QR code
  const deleteQRCode = useCallback(async (qrCodeId: string) => {
    try {
      const response = await fetch(`/api/qr/${qrCodeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete QR code');

      setState((prev) => {
        const newMap = new Map(prev.qrCodes);
        newMap.delete(qrCodeId);
        return { ...prev, qrCodes: newMap };
      });
    } catch (error) {
      console.error('Failed to delete QR code:', error);
      throw error;
    }
  }, []);

  // Track QR code scan
  const trackScan = useCallback(async (qrCodeId: string) => {
    try {
      const response = await fetch(`/api/qr/${qrCodeId}/scan`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to track scan');

      const updatedData = await response.json();

      setState((prev) => {
        const newMap = new Map(prev.qrCodes);
        const existing = newMap.get(qrCodeId);
        if (existing) {
          newMap.set(qrCodeId, {
            ...existing,
            scanCount: updatedData.scanCount,
          });
        }
        return { ...prev, qrCodes: newMap };
      });
    } catch (error) {
      console.error('Failed to track scan:', error);
    }
  }, []);

  // Get scan statistics
  const getScanStats = useCallback(
    async (qrCodeId: string) => {
      try {
        const response = await fetch(`/api/qr/${qrCodeId}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');

        return await response.json();
      } catch (error) {
        console.error('Failed to get scan stats:', error);
        return null;
      }
    },
    []
  );

  // Generate branded QR code with logo
  const generateBrandedQR = useCallback(
    async (
      data: string,
      logoURL: string,
      options?: QRCodeOptions
    ): Promise<QRCodeData | null> => {
      const brandedOptions: QRCodeOptions = {
        ...options,
        imageSettings: {
          src: logoURL,
          height: 40,
          width: 40,
          excavate: true,
        },
      };

      return await generateQRCode(data, brandedOptions);
    },
    [generateQRCode]
  );

  // Validate QR code data
  const validateQRData = useCallback((data: string): boolean => {
    try {
      // Check if it's a valid URL
      new URL(data);
      return true;
    } catch {
      // If not a URL, check if it's not empty and not too long
      return data.length > 0 && data.length <= 4296; // QR code max capacity
    }
  }, []);

  // Clear all QR codes
  const clearAllQRCodes = useCallback(() => {
    setState((prev) => ({
      ...prev,
      qrCodes: new Map(),
    }));
  }, []);

  // Auto-cleanup expired QR codes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setState((prev) => {
        const newMap = new Map(prev.qrCodes);
        let hasExpired = false;

        for (const [id, qrData] of Array.from(newMap.entries())) {
          if (qrData.expiresAt && qrData.expiresAt < now) {
            newMap.delete(id);
            hasExpired = true;
          }
        }

        return hasExpired ? { ...prev, qrCodes: newMap } : prev;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    qrCodes: Array.from(state.qrCodes.values()),
    isGenerating: state.isGenerating,
    error: state.error,
    generateQRCode,
    generateDocumentQR,
    generateBrandedQR,
    downloadQRCode,
    getQRCode,
    getQRCodeByDocument,
    deleteQRCode,
    trackScan,
    getScanStats,
    validateQRData,
    clearAllQRCodes,
  };
};
