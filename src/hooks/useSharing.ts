// Sharing Logic Hook
import { useState } from 'react';

interface ShareLink {
  id: string;
  documentId: string;
  url: string;
  expiresAt: string;
  createdAt: string;
  permissions: 'view' | 'edit';
}

export function useSharing() {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);

  const createShare = async (documentId: string, options: { 
    expiresAt?: string; 
    permissions?: 'view' | 'edit' 
  } = {}) => {
    setLoading(true);
    try {
      // In a real implementation, this would call an API
      // For now, we'll simulate creating a share link
      const newShareLink: ShareLink = {
        id: `share-${Date.now()}`,
        documentId,
        url: `https://campuscred.com/shared/${documentId}-${Math.random().toString(36).substring(2, 10)}`,
        expiresAt: options.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        permissions: options.permissions || 'view'
      };
      
      setShareLinks(prev => [...prev, newShareLink]);
      return newShareLink;
    } catch (error) {
      console.error('Error creating share link:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const revokeShare = async (shareId: string) => {
    setLoading(true);
    try {
      // In a real implementation, this would call an API
      setShareLinks(prev => prev.filter(link => link.id !== shareId));
    } catch (error) {
      console.error('Error revoking share link:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    shareLinks,
    createShare,
    revokeShare,
    loading,
  };
}
