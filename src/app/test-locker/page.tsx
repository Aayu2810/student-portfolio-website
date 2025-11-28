"use client";

import { useState } from "react";
import { LockerGrid } from "@/components/locker/LockerGrid";
import { LockerListView } from "@/components/locker/LockerListView";
import { FolderBreadcrumb } from "@/components/locker/FolderBreadcrumb";
import { DocumentPreview } from "@/components/locker/DocumentPreview";
import { RenameDialog } from "@/components/locker/RenameDialog";
import { MoveDialog } from "@/components/locker/MoveDialog";
import { SearchBar, SearchFilters } from "@/components/locker/SearchBar";
import { FilterTags } from "@/components/locker/FilterTags";
import { StorageUsage } from "@/components/locker/StorageUsage";
import { EmptyState } from "@/components/locker/EmptyState";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import { Document, BreadcrumbItem } from "@/types/locker.types";
import { ShareModal } from "@/components/sharing/ShareModal";
import { QRDisplay } from "@/components/sharing/QRDisplay";
import { ShareLinkCopy } from "@/components/sharing/ShareLinkCopy";
import { AccessControl } from "@/components/sharing/AccessControl";
import { ShareExpiry } from "@/components/sharing/ShareExpiry";
import { UploadZone } from "@/components/upload/UploadZone";
import { DocumentCategory } from "@/components/upload/DocumentCategory";

const sampleFolders = [
  { id: "folder1", name: "Personal Documents", path: "/Personal Documents" },
  { id: "folder2", name: "Academic", path: "/Academic" },
  { id: "folder3", name: "Certificates", path: "/Academic/Certificates" },
  { id: "folder4", name: "Work", path: "/Work" },
];

const sampleDocuments: Document[] = [
  {
    id: "1",
    name: "Degree Certificate.pdf",
    type: "file",
    fileType: "application/pdf",
    size: 2457600,
    status: "verified",
    uploadedAt: "2024-11-15T10:30:00Z",
    thumbnailUrl:
      "https://via.placeholder.com/400x300/6366f1/ffffff?text=Degree+Certificate",
    fileUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "2",
    name: "Transcript.pdf",
    type: "file",
    fileType: "application/pdf",
    size: 1843200,
    status: "pending",
    uploadedAt: "2024-11-20T14:15:00Z",
  },
  {
    id: "3",
    name: "ID Card.jpg",
    type: "file",
    fileType: "image/jpeg",
    size: 512000,
    status: "rejected",
    uploadedAt: "2024-11-22T09:45:00Z",
    thumbnailUrl:
      "https://via.placeholder.com/400x300/ec4899/ffffff?text=ID+Card",
  },
  {
    id: "4",
    name: "Resume.pdf",
    type: "file",
    fileType: "application/pdf",
    size: 327680,
    status: "verified",
    uploadedAt: "2024-11-25T16:20:00Z",
  },
];

const breadcrumbItems: BreadcrumbItem[] = [
  { id: "home", name: "Home", path: "/" },
  { id: "documents", name: "Documents", path: "/documents" },
  { id: "certificates", name: "Certificates", path: "/documents/certificates" },
];

export default function TestLockerPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameDocument, setRenameDocument] = useState<Document | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveDocument, setMoveDocument] = useState<Document | null>(null);
  const [activeTagFilter, setActiveTagFilter] = useState("all");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareDocument, setShareDocument] = useState<Document | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [accessUsers, setAccessUsers] = useState([
    {
      id: "1",
      email: "john.doe@example.com",
      permission: "view" as const,
      addedAt: "2024-11-20T10:00:00Z",
    },
    {
      id: "2",
      email: "jane.smith@example.com",
      permission: "edit" as const,
      addedAt: "2024-11-22T14:30:00Z",
    },
  ]);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("academic");

  const handleDocumentClick = (doc: Document) => {
    setPreviewDocument(doc);
    setIsPreviewOpen(true);
  };

  const handleAction = (action: string, docId: string) => {
    console.log(`Action: ${action}, Document ID: ${docId}`);

    if (action === "preview") {
      const doc = sampleDocuments.find((d) => d.id === docId);
      if (doc) {
        setPreviewDocument(doc);
        setIsPreviewOpen(true);
      }
    }

    if (action === "rename") {
      const doc = sampleDocuments.find((d) => d.id === docId);
      if (doc) {
        setRenameDocument(doc);
        setRenameDialogOpen(true);
      }
    }

    if (action === "move") {
      const doc = sampleDocuments.find((d) => d.id === docId);
      if (doc) {
        setMoveDocument(doc);
        setMoveDialogOpen(true);
      }
    }

    if (action === "share") {
      const doc = sampleDocuments.find((d) => d.id === docId);
      if (doc) {
        setShareDocument(doc);
        setShareModalOpen(true);
      }
    }
  };

  const handleNavigate = (item: BreadcrumbItem) => {
    console.log(`Navigate to: ${item.id}, path: ${item.path}`);
  };

  const handleDownload = (docId: string) => {
    console.log(`Download document: ${docId}`);
    alert(`Downloading document ${docId}`);
  };

  const handleShare = (docId: string) => {
    console.log(`Share document: ${docId}`);
    const doc = sampleDocuments.find((d) => d.id === docId);
    if (doc) {
      setShareDocument(doc);
      setShareModalOpen(true);
    }
  };

  const handleRename = (newName: string) => {
    console.log(`Rename ${renameDocument?.name} to: ${newName}`);
    alert(`Renamed to: ${newName}`);
  };

  const handleMove = (folderId: string) => {
    console.log(`Move ${moveDocument?.name} to folder: ${folderId}`);
    const folderName =
      folderId === "root"
        ? "Root Folder"
        : sampleFolders.find((f) => f.id === folderId)?.name || "Unknown";
    alert(`Moved ${moveDocument?.name} to: ${folderName}`);
  };

  const handleSearch = (query: string, filters: SearchFilters) => {
    console.log("Search query:", query);
    console.log("Filters:", filters);
  };

  const handleTagFilter = (filterId: string) => {
    setActiveTagFilter(filterId);
    console.log("Active tag filter:", filterId);
  };

  const handleUploadClick = () => {
    console.log("Upload clicked");
    alert("Upload dialog would open here");
  };

  const handleCreateFolder = () => {
    console.log("Create folder clicked");
    alert("Create folder dialog would open here");
  };

  const handleTogglePublic = (isPublic: boolean) => {
    setIsPublic(isPublic);
    console.log("Public access:", isPublic);
  };

  const handleAddUser = (email: string, permission: "view" | "edit") => {
    const newUser = {
      id: Date.now().toString(),
      email,
      permission,
      addedAt: new Date().toISOString(),
    };
    setAccessUsers([...accessUsers, newUser]);
    console.log("Added user:", newUser);
  };

  const handleUpdatePermission = (
    userId: string,
    permission: "view" | "edit"
  ) => {
    setAccessUsers(
      accessUsers.map((u) => (u.id === userId ? { ...u, permission } : u))
    );
    console.log("Updated permission:", userId, permission);
  };

  const handleRemoveUser = (userId: string) => {
    setAccessUsers(accessUsers.filter((u) => u.id !== userId));
    console.log("Removed user:", userId);
  };

  const handleExpiryChange = (date: Date | null) => {
    setExpiryDate(date);
    console.log("Expiry date:", date);
  };

  const handleUploadFiles = (files: File[]) => {
    console.log("Uploaded files:", files);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log("Selected category:", categoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">
          Digital Locker Test Page
        </h1>

        {/* Storage Usage */}
        <StorageUsage
          usedStorage={3221225472}
          totalStorage={5368709120}
          showDetails={true}
        />

        {/* QR Code Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">QR Code Display</h2>
          <QRDisplay
            url="https://campuscred.com/shared/degree-certificate-123"
            title="Share: Degree Certificate"
            size={200}
          />
        </div>

        {/* Share Link Copy Buttons */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Share Link Copy Buttons
          </h2>
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Size Variants:</p>
              <div className="flex flex-wrap gap-3">
                <ShareLinkCopy
                  url="https://campuscred.com/shared/doc-123"
                  size="sm"
                  label="Small"
                />
                <ShareLinkCopy
                  url="https://campuscred.com/shared/doc-123"
                  size="md"
                  label="Medium"
                />
                <ShareLinkCopy
                  url="https://campuscred.com/shared/doc-123"
                  size="lg"
                  label="Large"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Style Variants:</p>
              <div className="flex flex-wrap gap-3">
                <ShareLinkCopy
                  url="https://campuscred.com/shared/doc-123"
                  variant="outline"
                  label="Outline"
                />
                <ShareLinkCopy
                  url="https://campuscred.com/shared/doc-123"
                  variant="default"
                  label="Default"
                />
                <ShareLinkCopy
                  url="https://campuscred.com/shared/doc-123"
                  variant="ghost"
                  label="Ghost"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Without Icon:</p>
              <ShareLinkCopy
                url="https://campuscred.com/shared/doc-123"
                showIcon={false}
                label="Copy Share Link"
              />
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Access Control</h2>
          <AccessControl
            isPublic={isPublic}
            onTogglePublic={handleTogglePublic}
            users={accessUsers}
            onAddUser={handleAddUser}
            onUpdatePermission={handleUpdatePermission}
            onRemoveUser={handleRemoveUser}
          />
        </div>

        {/* Share Expiry */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Share Expiry</h2>
          <ShareExpiry
            expiryDate={expiryDate}
            onExpiryChange={handleExpiryChange}
          />
        </div>

        {/* Upload Zone */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Upload Zone</h2>
          <UploadZone onUpload={handleUploadFiles} maxSize={10} maxFiles={5} />
        </div>

        {/* Document Category */}
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Document Category</h2>
            <DocumentCategory
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
            />
        </div>

        {/* Breadcrumb */}
        <FolderBreadcrumb items={breadcrumbItems} onNavigate={handleNavigate} />

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Filter Tags */}
        <FilterTags
          onFilterChange={handleTagFilter}
          activeFilter={activeTagFilter}
        />

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={
              viewMode === "grid"
                ? "bg-purple-600 hover:bg-purple-700"
                : "border-white/10 hover:bg-white/10"
            }
          >
            <Grid className="w-4 h-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list"
                ? "bg-purple-600 hover:bg-purple-700"
                : "border-white/10 hover:bg-white/10"
            }
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>

        {/* Document Views */}
        {sampleDocuments.length > 0 ? (
          viewMode === "grid" ? (
            <LockerGrid
              documents={sampleDocuments}
              onDocumentClick={handleDocumentClick}
              onAction={handleAction}
            />
          ) : (
            <LockerListView
              documents={sampleDocuments}
              onDocumentClick={handleDocumentClick}
              onAction={handleAction}
            />
          )
        ) : (
          <EmptyState
            type="no-documents"
            onUpload={handleUploadClick}
            onCreateFolder={handleCreateFolder}
          />
        )}

        {/* Preview Modal */}
        <DocumentPreview
          document={previewDocument}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onDownload={handleDownload}
          onShare={handleShare}
        />

        {/* Rename Dialog */}
        <RenameDialog
          isOpen={renameDialogOpen}
          onClose={() => setRenameDialogOpen(false)}
          onRename={handleRename}
          currentName={renameDocument?.name || ""}
          itemType={renameDocument?.type || "file"}
        />

        {/* Move Dialog */}
        <MoveDialog
          isOpen={moveDialogOpen}
          onClose={() => setMoveDialogOpen(false)}
          onMove={handleMove}
          currentFolderId={undefined}
          itemName={moveDocument?.name || ""}
          folders={sampleFolders}
        />

        {/* Share Modal */}
        {shareDocument && (
          <ShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            documentName={shareDocument.name}
            documentId={shareDocument.id}
          />
        )}
      </div>
    </div>
  );
}