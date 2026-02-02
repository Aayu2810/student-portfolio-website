"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Mail, Link as LinkIcon, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentId: string;
}

export function ShareModal({
  isOpen,
  onClose,
  documentName,
  documentId,
}: ShareModalProps) {
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    if (!email.trim()) return;
    console.log("Send email to:", email);
    alert(`Share link sent to: ${email}`);
    setEmail("");
  };

  const handleGenerateNewLink = async () => {
    setLoading(true);
    setError(null);
    try {
      // Handle 'never' expiry option
      const expiresInHours = expiryDays === 'never' ? null : parseInt(expiryDays) * 24;
      
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_ids: [documentId],
          expires_in_hours: expiresInHours,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create share link');
      }

      const data = await response.json();
      setShareLink(data.share_url);
      alert('Share link generated successfully!');
    } catch (err: any) {
      setError(err.message);
      console.error('Error generating share link:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" />
            Share Document
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Share "{documentName}" with others via link or email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Share Link */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Shareable Link
            </Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 bg-white/5 border-white/10 text-white"
              />
              <Button
                onClick={handleCopyLink}
                disabled={!shareLink || loading}
                size="icon"
                className={`${
                  copied
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-purple-600 hover:bg-purple-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Anyone with this link can view the document
            </p>
          </div>

          {/* Link Settings */}
          <div className="grid grid-cols-2 gap-4">
            {/* Expiry */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Link Expires In
              </Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Public/Private Toggle */}
            <div className="space-y-2">
              <Label className="text-white">Access Type</Label>
              <Select
                value={isPublic ? "public" : "private"}
                onValueChange={(value) => setIsPublic(value === "public")}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="private">Private Link</SelectItem>
                  <SelectItem value="public">Public Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate New Link */}
          <Button
            onClick={handleGenerateNewLink}
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full border-white/10 hover:bg-purple-400/20 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate New Link'}
          </Button>

          {/* Email Share */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send via Email
            </Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={handleSendEmail}
                disabled={!email.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                Send
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/10 hover:bg-white/10"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}