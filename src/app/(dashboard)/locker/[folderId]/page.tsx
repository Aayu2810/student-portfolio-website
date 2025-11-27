// Dynamic Folder View
export default function FolderPage({ params }: { params: { folderId: string } }) {
  return (
    <div>
      <h1>Folder: {params.folderId}</h1>
      {/* TODO: Implement folder contents view */}
    </div>
  )
}
