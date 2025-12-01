"use client";

import { useState, useEffect } from "react";
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
import { FileText } from "lucide-react";

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
  itemType: "file" | "folder";
}

export function RenameDialog({
  isOpen,
  onClose,
  onRename,
  currentName,
  itemType,
}: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState("");

  // Reset name when dialog opens with new item
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setError("");
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (newName.trim() === currentName.trim()) {
      setError("Name is unchanged");
      return;
    }

    // For files, check if extension exists
    if (itemType === "file") {
      const hasExtension = /\.[^.]+$/.test(newName);
      if (!hasExtension) {
        setError("File must have an extension (e.g., .pdf, .jpg)");
        return;
      }
    }

    // Call the rename function
    onRename(newName.trim());
    onClose();
  };

  const handleCancel = () => {
    setNewName(currentName);
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Rename {itemType === "file" ? "File" : "Folder"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter a new name for "{currentName}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
  <div className="grid gap-2">
    <Label className="text-white">
      New Name
    </Label>
    <Input
      value={newName}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setNewName(e.target.value);
        setError("");
      }}
      placeholder={`Enter ${itemType} name`}
      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-400"
      autoFocus
    />
    {error && (
      <p className="text-sm text-red-400 mt-1">{error}</p>
    )}
  </div>
</div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}