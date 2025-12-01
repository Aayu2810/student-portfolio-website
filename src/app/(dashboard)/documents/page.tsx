'use client';

import { useState } from "react";
import { Search, Filter } from "lucide-react";

// Mock data for verification documents
const mockDocuments = [
  {
    id: "1",
    studentName: "John Doe",
    studentEmail: "john.doe@rvce.edu.in",
    studentDepartment: "Computer Science",
    documentName: "Degree Certificate.pdf",
    documentType: "Academic Certificate",
    uploadedAt: "2024-11-27T10:00:00Z",
    status: "pending",
  },
  {
    id: "2",
    studentName: "Jane Smith",
    studentEmail: "jane.smith@rvce.edu.in",
    studentDepartment: "Electronics Engineering",
    documentName: "Transcript.pdf",
    documentType: "Academic Transcript",
    uploadedAt: "2024-11-26T14:30:00Z",
    status: "in-review",
  },
  {
    id: "3",
    studentName: "Robert Johnson",
    studentEmail: "robert.j@rvce.edu.in",
    studentDepartment: "Mechanical Engineering",
    documentName: "ID Card.jpg",
    documentType: "Identity Document",
    uploadedAt: "2024-11-25T09:15:00Z",
    status: "verified",
  },
  {
    id: "4",
    studentName: "Sarah Williams",
    studentEmail: "sarah.w@rvce.edu.in",
    studentDepartment: "Civil Engineering",
    documentName: "Internship Letter.pdf",
    documentType: "Work Experience",
    uploadedAt: "2024-11-24T16:45:00Z",
    status: "rejected",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "verified":
      return (
        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
          Verified
        </span>
      );
    case "pending":
      return (
        <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full">
          Pending
        </span>
      );
    case "in-review":
      return (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded-full">
          In Review
        </span>
      );
    case "rejected":
      return (
        <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded-full">
          Rejected
        </span>
      );
    default:
      return null;
  }
};

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredDocs = mockDocuments.filter(doc => {
    const matchesSearch = 
      doc.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Document Verification</h1>
          <p className="text-gray-400">Review and verify student documents</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by student name, email, or document name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/8 backdrop-blur-[20px] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400/30 transition-all duration-300"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/8 backdrop-blur-[20px] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400/30 transition-all duration-300"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-review">In Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-gray-400 font-medium">Student</th>
                  <th className="pb-3 text-gray-400 font-medium">Document</th>
                  <th className="pb-3 text-gray-400 font-medium">Type</th>
                  <th className="pb-3 text-gray-400 font-medium">Uploaded</th>
                  <th className="pb-3 text-gray-400 font-medium">Status</th>
                  <th className="pb-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No documents found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4">
                        <div>
                          <div className="font-medium text-white">{doc.studentName}</div>
                          <div className="text-sm text-gray-400">{doc.studentEmail}</div>
                          <div className="text-xs text-gray-500">{doc.studentDepartment}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-white">{doc.documentName}</div>
                      </td>
                      <td className="py-4">
                        <div className="text-gray-400">{doc.documentType}</div>
                      </td>
                      <td className="py-4">
                        <div className="text-gray-400">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="py-4">
                        <button 
                          onClick={() => alert(`View document: ${doc.documentName}`)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Total Documents</div>
            <div className="text-2xl font-bold text-white">{mockDocuments.length}</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Pending</div>
            <div className="text-2xl font-bold text-amber-500">
              {mockDocuments.filter(d => d.status === "pending").length}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Verified</div>
            <div className="text-2xl font-bold text-green-500">
              {mockDocuments.filter(d => d.status === "verified").length}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Rejected</div>
            <div className="text-2xl font-bold text-red-500">
              {mockDocuments.filter(d => d.status === "rejected").length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}