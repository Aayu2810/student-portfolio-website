// QR Code Generator Utility

export const generateQRCode = async (data: string) => {
  try {
    // For now, return a URL to a QR code generator service
    // In a real implementation, you would use a QR code library like qrcode
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
    
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export const qrUtils = {
  generate: generateQRCode,
  // TODO: Add more QR utility functions
}
