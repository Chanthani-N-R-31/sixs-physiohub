"use client";

import { useState, useEffect } from "react";
import {
  DocumentArrowDownIcon,
  FunnelIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";

interface Assessment {
  id: string;
  name: string;
  date: string;
  status: string;
  createdBy: string;
  fullData: any;
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assessments, statusFilter, dateFrom, dateTo, domainFilter, userFilter, searchTerm]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "physioAssessments"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const loadedAssessments: Assessment[] = [];
      const uniqueUsersSet = new Set<string>();
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const regDetails = data.registrationDetails || {};
        
        let fullName = regDetails.fullName || "";
        if (!fullName) {
          const parts = [
            regDetails.firstName,
            regDetails.initials,
            regDetails.lastName
          ].filter(Boolean);
          fullName = parts.join(" ").trim() || "Unknown Patient";
        }
        
        let date = regDetails.dateOfAssessment || "";
        if (!date && data.createdAt) {
          const timestamp = data.createdAt.toDate ? data.createdAt.toDate() : null;
          if (timestamp) {
            date = timestamp.toLocaleDateString();
          }
        }
        if (!date) date = "N/A";
        
        const status = data.status === "completed" ? "Completed" : data.status === "in_progress" ? "In Progress" : "Incomplete";
        const createdBy = data.createdByEmail || data.createdByName || data.createdBy || "Unknown";
        
        if (createdBy !== "Unknown") {
          uniqueUsersSet.add(createdBy);
        }
        
        loadedAssessments.push({
          id: docSnapshot.id,
          name: fullName,
          date: date,
          status: status,
          createdBy: createdBy,
          fullData: { id: docSnapshot.id, ...data },
        });
      });
      
      setAssessments(loadedAssessments);
      setUsers(Array.from(uniqueUsersSet).sort());
    } catch (error) {
      console.error("Error loading assessments:", error);
      alert("Error loading assessments. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assessments];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(assessment => {
        if (statusFilter === "completed") return assessment.status === "Completed";
        if (statusFilter === "in_progress") return assessment.status === "In Progress";
        if (statusFilter === "incomplete") return assessment.status === "Incomplete";
        return true;
      });
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(assessment => {
        const assessmentDate = new Date(assessment.date);
        const fromDate = new Date(dateFrom);
        return assessmentDate >= fromDate;
      });
    }

    if (dateTo) {
      filtered = filtered.filter(assessment => {
        const assessmentDate = new Date(assessment.date);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59);
        return assessmentDate <= toDate;
      });
    }

    // Domain filter
    if (domainFilter !== "all") {
      filtered = filtered.filter(assessment => {
        const domainStatuses = assessment.fullData.domainStatuses || {};
        const status = domainStatuses[domainFilter];
        return status === "completed" || status === "in_progress";
      });
    }

    // User filter
    if (userFilter !== "all") {
      filtered = filtered.filter(assessment => assessment.createdBy === userFilter);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(assessment =>
        assessment.name.toLowerCase().includes(searchLower) ||
        assessment.id.toLowerCase().includes(searchLower) ||
        assessment.createdBy.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAssessments(filtered);
  };

  const generatePDF = async (assessment: Assessment) => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/reports/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentId: assessment.id,
          assessmentData: assessment.fullData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const data = await response.json();
      
      // If the API returns HTML (temporary solution), create a blob and download
      if (data.html) {
        const blob = new Blob([data.html], { type: "text/html" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Assessment-Report-${assessment.id}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        alert("HTML report generated. Note: For PDF generation, please configure a PDF library (Puppeteer, jsPDF, etc.)");
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Assessment-Report-${assessment.id}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      console.error("PDF generation error:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateBulkPDFs = async () => {
    if (filteredAssessments.length === 0) {
      alert("No assessments selected for bulk PDF generation.");
      return;
    }

    if (!confirm(`Generate PDF reports for ${filteredAssessments.length} assessment(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      for (const assessment of filteredAssessments) {
        await generatePDF(assessment);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      alert(`Successfully generated ${filteredAssessments.length} PDF report(s).`);
    } catch (error: any) {
      console.error("Bulk PDF generation error:", error);
      alert(`Error generating PDFs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Reports</h1>
          <p className="text-gray-300 mt-1">Generate and download individual PDF reports</p>
        </div>
        {filteredAssessments.length > 0 && (
          <button
            onClick={generateBulkPDFs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all shadow-lg border border-teal-500 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            Generate All ({filteredAssessments.length})
          </button>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Name, ID, or User..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass w-full"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-glass w-full"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>

          {/* Domain Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Domain</label>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="select-glass w-full"
            >
              <option value="all">All Domains</option>
              <option value="Physiotherapy">Physiotherapy</option>
              <option value="Biomechanics">Biomechanics</option>
              <option value="Physiology">Physiology</option>
              <option value="Nutrition">Nutrition</option>
              <option value="Psychology">Psychology</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Created By</label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="select-glass w-full"
            >
              <option value="all">All Users</option>
              {users.map((user) => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-glass w-full"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-glass w-full"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(statusFilter !== "all" || dateFrom || dateTo || domainFilter !== "all" || userFilter !== "all" || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("all");
              setDateFrom("");
              setDateTo("");
              setDomainFilter("all");
              setUserFilter("all");
              setSearchTerm("");
            }}
            className="mt-4 text-sm text-teal-400 hover:text-teal-300 font-bold"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-300 font-medium">
          Showing {filteredAssessments.length} of {assessments.length} assessment(s)
        </p>
      </div>

      {/* Assessments Table */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        {loading && assessments.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No assessments found matching the filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-700 font-bold text-left border-b border-gray-300">
                <tr>
                  <th className="py-3">ID</th>
                  <th className="py-3">Name</th>
                  <th className="py-3">Assessment Date</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Created By</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAssessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 text-gray-900 font-medium">P-{assessment.id.slice(0, 8)}</td>
                    <td className="py-4 text-gray-900 font-bold">{assessment.name}</td>
                    <td className="py-4 text-gray-700">{assessment.date}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        assessment.status === "Completed" 
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : assessment.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                          : "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}>
                        {assessment.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-700 text-sm">{assessment.createdBy}</td>
                    <td className="py-4">
                      <button
                        onClick={() => generatePDF(assessment)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all disabled:opacity-50"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4" />
                        Generate PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
