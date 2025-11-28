"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Eye,
  Download,
  Share2,
  Edit3,
  FolderInput,
  Trash2,
  Copy,
  Star,
  Archive,
} from "lucide-react";

interface DocumentActionsProps {
  documentId: string;
  documentName: string;
  onAction: (action: string, docId: string) => void;
  showStar?: boolean;
  showArchive?: boolean;
}

export function DocumentActions({
  documentId,
  documentName,
  onAction,
  showStar = false,
  showArchive = false,
}: DocumentActionsProps) {
  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onAction(action, documentId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-purple-400/20 data-[state=open]:bg-purple-400/20"
        >
          <MoreVertical className="w-4 h-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="end"
        className="w-56 bg-slate-800/95 backdrop-blur-md border-white/10"
      >
        {/* Preview */}
        <DropdownMenuItem
          onClick={(e) => handleAction("preview", e)}
          className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
        >
          <Eye className="w-4 h-4 text-purple-400" />
          <span>Preview</span>
        </DropdownMenuItem>

        {/* Download */}
        <DropdownMenuItem
          onClick={(e) => handleAction("download", e)}
          className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Download</span>
        </DropdownMenuItem>

        {/* Share */}
        <DropdownMenuItem
          onClick={(e) => handleAction("share", e)}
          className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
        >
          <Share2 className="w-4 h-4 text-green-400" />
          <span>Share</span>
        </DropdownMenuItem>

        {/* Copy Link */}
        <DropdownMenuItem
          onClick={(e) => handleAction("copyLink", e)}
          className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
        >
          <Copy className="w-4 h-4 text-cyan-400" />
          <span>Copy Link</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Star (Optional) */}
        {showStar && (
          <DropdownMenuItem
            onClick={(e) => handleAction("star", e)}
            className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
          >
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Add to Favorites</span>
          </DropdownMenuItem>
        )}

        {/* Rename */}
        <DropdownMenuItem
          onClick={(e) => handleAction("rename", e)}
          className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
        >
          <Edit3 className="w-4 h-4 text-amber-400" />
          <span>Rename</span>
        </DropdownMenuItem>

        {/* Move */}
        <DropdownMenuItem
          onClick={(e) => handleAction("move", e)}
          className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
        >
          <FolderInput className="w-4 h-4 text-indigo-400" />
          <span>Move to Folder</span>
        </DropdownMenuItem>

        {/* Archive (Optional) */}
        {showArchive && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={(e) => handleAction("archive", e)}
              className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
            >
              <Archive className="w-4 h-4 text-gray-400" />
              <span>Archive</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Delete */}
        <DropdownMenuItem
          onClick={(e) => handleAction("delete", e)}
          className="flex items-center gap-3 cursor-pointer text-red-400 hover:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}