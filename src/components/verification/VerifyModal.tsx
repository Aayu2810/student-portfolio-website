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
import { CheckCircle, XCircle, FileText, BadgeCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (action: "approve" | "reject", reason?: string) => void;
  documentName: string;
  documentType: string;
  canVerify?: boolean;
}

export function VerifyModal({
  isOpen,
  onClose,
  onVerify,
  documentName,
  documentType,
  canVerify = true,
}: VerifyModalProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [addRVCELogo, setAddRVCELogo] = useState(true); // Default to true for verification
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!action) {
      setError("Please select an action");
      return;
    }

    if (action === "approve" && addRVCELogo) {
      // When approving, we'll add the RVCE logo in the backend
      onVerify(action);
    } else if (action === "reject") {
      onVerify(action, rejectionReason);
    } else {
      onVerify(action);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setAction(null);
    setAddRVCELogo(true); // Reset to default
    setRejectionReason("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Verify Document
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Review and verify "{documentName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Info */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-sm text-gray-400">Document Type</p>
            <p className="text-white font-medium">{documentType}</p>
          </div>

          <>
              {/* Action Selection */}
              <div className="space-y-2">
                <Label className="text-white">Verification Action</Label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Approve Button */}
                  <button
                    onClick={() => {
                      setAction("approve");
                      setError("");
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      action === "approve"
                        ? "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20"
                        : "bg-white/5 border-white/10 hover:bg-green-500/10 hover:border-green-500/30"
                    }`}
                  >
                    <CheckCircle
                      className={`w-8 h-8 mx-auto mb-2 ${
                        action === "approve" ? "text-green-400" : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        action === "approve" ? "text-green-400" : "text-gray-400"
                      }`}
                    >
                      Approve
                    </p>
                  </button>

                  {/* Reject Button */}
                  <button
                    onClick={() => {
                      setAction("reject");
                      setError("");
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      action === "reject"
                        ? "bg-red-500/20 border-red-500 shadow-lg shadow-red-500/20"
                        : "bg-white/5 border-white/10 hover:bg-red-500/10 hover:border-red-500/30"
                    }`}
                  >
                    <XCircle
                      className={`w-8 h-8 mx-auto mb-2 ${
                        action === "reject" ? "text-red-400" : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        action === "reject" ? "text-red-400" : "text-gray-400"
                      }`}
                    >
                      Reject
                    </p>
                  </button>
                </div>
              </div>

              {/* Add RVCE Logo Option (only for approval) */}
              {action === "approve" && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      <BadgeCheck className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="add-rvce-logo"
                          checked={addRVCELogo}
                          onCheckedChange={(checked) => setAddRVCELogo(!!checked)}
                          className="border-white/30 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                        <Label htmlFor="add-rvce-logo" className="text-white font-medium">
                          Add RVCE Authentication Logo
                        </Label>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Add the official RVCE verification logo to authenticate this document
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason (only for rejection) */}
              {action === "reject" && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason" className="text-white">
                    Rejection Reason
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Enter the reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    rows={3}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
          </>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-white/10 hover:bg-white/10"
          >
            Close
          </Button>
          {canVerify && (
          <Button
            onClick={handleSubmit}
            disabled={!action}
            className={`${
              action === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : action === "reject"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {action === "approve" 
              ? addRVCELogo 
                ? "Approve with RVCE Logo" 
                : "Approve Document" 
              : action === "reject" 
                ? "Reject Document" 
                : "Submit"}
          </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}