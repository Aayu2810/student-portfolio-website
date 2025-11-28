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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, AlertTriangle } from "lucide-react";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
  documentName: string;
}

export function RejectModal({
  isOpen,
  onClose,
  onReject,
  documentName,
}: RejectModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  // Common rejection reasons for quick selection
  const commonReasons = [
    "Document is not clear or readable",
    "Document appears to be a photocopy",
    "Document is expired",
    "Information doesn't match records",
    "Missing required information",
    "Invalid document type",
  ];

  const handleSubmit = () => {
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    onReject(rejectionReason.trim());
    handleClose();
  };

  const handleClose = () => {
    setRejectionReason("");
    setError("");
    onClose();
  };

  const handleQuickSelect = (reason: string) => {
    setRejectionReason(reason);
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] bg-slate-900/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            Reject Document
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Provide a clear reason for rejecting "{documentName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Message */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-300">
              The user will be notified and asked to resubmit. Be specific so they can correct the issue.
            </p>
          </div>

          {/* Quick Reasons */}
          <div className="space-y-2">
            <Label className="text-white">Common Reasons (Click to select)</Label>
            <div className="grid grid-cols-2 gap-2">
              {commonReasons.map((reason, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSelect(reason)}
                  className={`p-2 text-sm text-left rounded-lg border transition-all ${
                    rejectionReason === reason
                      ? "bg-red-500/20 border-red-500/50 text-red-300"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-red-500/10 hover:border-red-500/30"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div className="space-y-2">
            <Label className="text-white">Rejection Reason *</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setError("");
              }}
              placeholder="Provide a detailed reason for rejection or select from common reasons above..."
              className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-red-400"
            />
            <p className="text-xs text-gray-400">
              Be clear and specific so the user knows exactly what needs to be fixed.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-white/10 hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}