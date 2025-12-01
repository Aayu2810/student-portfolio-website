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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderItem {
  id: string;
  name: string;
  path: string;
}

interface MoveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (folderId: string) => void;
  currentFolderId?: string;
  itemName: string;
  folders: FolderItem[];
}

export function MoveDialog({
  isOpen,
  onClose,
  onMove,
  currentFolderId,
  itemName,
  folders,
}: MoveDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleMove = () => {
    if (selectedFolderId) {
      onMove(selectedFolderId);
      onClose();
      setSelectedFolderId(null);
    }
  };

  const handleCancel = () => {
    setSelectedFolderId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-purple-400" />
            Move to Folder
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Select a destination folder for "{itemName}"
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ScrollArea className="h-[300px] rounded-md border border-white/10 bg-white/5 p-4">
            <div className="space-y-2">
              {/* Root folder option */}
              <button
                onClick={() => setSelectedFolderId("root")}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                  "hover:bg-purple-400/20",
                  selectedFolderId === "root"
                    ? "bg-purple-400/30 border border-purple-400/50"
                    : "bg-white/5 border border-white/10",
                  currentFolderId === "root" && "opacity-50 cursor-not-allowed"
                )}
                disabled={currentFolderId === "root"}
              >
                <Home className="w-5 h-5 text-purple-400" />
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">Root Folder</p>
                  <p className="text-sm text-gray-400">Main directory</p>
                </div>
                {selectedFolderId === "root" && (
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                )}
              </button>

              {/* List of folders */}
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                    "hover:bg-purple-400/20",
                    selectedFolderId === folder.id
                      ? "bg-purple-400/30 border border-purple-400/50"
                      : "bg-white/5 border border-white/10",
                    currentFolderId === folder.id && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={currentFolderId === folder.id}
                >
                  <Folder className="w-5 h-5 text-purple-400" />
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">{folder.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Home className="w-3 h-3" />
                      {folder.path.split("/").filter(Boolean).map((part, idx, arr) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span>{part}</span>
                          {idx < arr.length - 1 && <ChevronRight className="w-3 h-3" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedFolderId === folder.id && (
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                  )}
                </button>
              ))}

              {folders.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No folders available</p>
                </div>
              )}
            </div>
          </ScrollArea>
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
            onClick={handleMove}
            disabled={!selectedFolderId}
            className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Move Here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}