"use client";

import { useState, useEffect } from "react";
import {
  DocumentArrowDownIcon,
  FunnelIcon,
  DocumentTextIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";

interface Assessment {
  id: string;
  name: string;
  date: string;
  status: string;
  fullData: any;
}

interface ReportConfig {
  sections: {
    registrationDetails: boolean;
    injuryHistory: boolean;
    staticPosture: boolean;
    rom: boolean;
    strengthStability: boolean;
    fms: boolean;
    biomechanics: boolean;
    physiology: boolean;
    nutrition: boolean;
    psychology: boolean;
    domainStatus: boolean;
  };
  customNotes: string;
  includeSummary: boolean;
  includeCharts: boolean;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    sections: {
      registrationDetails: true,
      injuryHistory: true,
      staticPosture: true,
      rom: true,
      strengthStability: true,
      fms: true,
      biomechanics: true,
      physiology: true,
      nutrition: true,
      psychology: true,
      domainStatus: true,
    },
    customNotes: "",
    includeSummary: true,
    includeCharts: false,
  });
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assessments, statusFilter, dateFrom, dateTo, domainFilter, searchTerm]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "physioAssessments"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const loadedAssessments: Assessment[] = [];
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
        
        loadedAssessments.push({
          id: docSnapshot.id,
          name: fullName,
          date: date,
          status: status,
          fullData: { id: docSnapshot.id, ...data },
        });
      });
      
      setAssessments(loadedAssessments);
    } catch (error) {
      console.error("Error loading assessments:", error);
      alert("Error loading assessments. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assessments];

    if (statusFilter !== "all") {
      filtered = filtered.filter(assessment => {
        if (statusFilter === "completed") return assessment.status === "Completed";
        if (statusFilter === "in_progress") return assessment.status === "In Progress";
        if (statusFilter === "incomplete") return assessment.status === "Incomplete";
        return true;
      });
    }

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

    if (domainFilter !== "all") {
      filtered = filtered.filter(assessment => {
        const domainStatuses = assessment.fullData.domainStatuses || {};
        const status = domainStatuses[domainFilter];
        return status === "completed" || status === "in_progress";
      });
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(assessment =>
        assessment.name.toLowerCase().includes(searchLower) ||
        assessment.id.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAssessments(filtered);
  };

  const openEditor = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowEditor(true);
  };

  const generatePDF = async () => {
    if (!selectedAssessment) return;

    try {
      setLoading(true);

      // Dynamically import jsPDF
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(20, 184, 166); // teal-500
      doc.text("Assessment Report", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 5;
      doc.text(`Assessment ID: ${selectedAssessment.id}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      // Draw line
      doc.setDrawColor(20, 184, 166);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      const regDetails = selectedAssessment.fullData.registrationDetails || {};
      const name = regDetails.fullName || `${regDetails.firstName || ""} ${regDetails.lastName || ""}`.trim() || "Unknown";

      // Patient Information
      if (reportConfig.includeSummary) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Patient Information", 20, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Name: ${name}`, 25, yPosition);
        yPosition += 6;
        doc.text(`Date of Assessment: ${regDetails.dateOfAssessment || "N/A"}`, 25, yPosition);
        yPosition += 6;
        doc.text(`Age: ${regDetails.age || "N/A"}`, 25, yPosition);
        yPosition += 6;
        doc.text(`Status: ${selectedAssessment.fullData.status || "N/A"}`, 25, yPosition);
        yPosition += 6;
        
        if (regDetails.serviceNumber) {
          doc.text(`Service Number: ${regDetails.serviceNumber}`, 25, yPosition);
          yPosition += 6;
        }
        if (regDetails.rank) {
          doc.text(`Rank: ${regDetails.rank}`, 25, yPosition);
          yPosition += 6;
        }
        if (regDetails.gender) {
          doc.text(`Gender: ${regDetails.gender}`, 25, yPosition);
          yPosition += 6;
        }

        yPosition += 5;
      }

      // Domain Status
      if (reportConfig.sections.domainStatus && selectedAssessment.fullData.domainStatuses) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Domain Status", 20, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const domainStatuses = selectedAssessment.fullData.domainStatuses;
        Object.entries(domainStatuses).forEach(([domain, status]: [string, any]) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          const statusText = status === "completed" ? "Completed" : status === "in_progress" ? "In Progress" : "Not Started";
          doc.text(`${domain}: ${statusText}`, 25, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      }

      // Registration Details
      if (reportConfig.sections.registrationDetails) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Registration Details", 20, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        Object.entries(regDetails).forEach(([key, value]) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          if (value !== null && value !== undefined && value !== "") {
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
            doc.text(`${label}: ${String(value)}`, 25, yPosition);
            yPosition += 6;
          }
        });
        yPosition += 5;
      }

      // Injury History
      if (reportConfig.sections.injuryHistory && selectedAssessment.fullData.injuryHistory) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Injury History", 20, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const injuryHistory = selectedAssessment.fullData.injuryHistory;
        Object.entries(injuryHistory).forEach(([key, value]) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          if (value !== null && value !== undefined && value !== "") {
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
            doc.text(`${label}: ${String(value)}`, 25, yPosition);
            yPosition += 6;
          }
        });
        yPosition += 5;
      }

      // Static Posture
      if (reportConfig.sections.staticPosture && selectedAssessment.fullData.staticPosture) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Static Posture", 20, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const staticPosture = selectedAssessment.fullData.staticPosture;
        Object.entries(staticPosture).forEach(([key, value]) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          if (value !== null && value !== undefined && value !== "") {
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
            doc.text(`${label}: ${String(value)}`, 25, yPosition);
            yPosition += 6;
          }
        });
        yPosition += 5;
      }

      // ROM
      if (reportConfig.sections.rom && selectedAssessment.fullData.rom) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Range of Motion (ROM)", 20, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const rom = selectedAssessment.fullData.rom;
        Object.entries(rom).forEach(([key, value]) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          if (value !== null && value !== undefined && value !== "") {
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
            doc.text(`${label}: ${String(value)}`, 25, yPosition);
            yPosition += 6;
          }
        });
        yPosition += 5;
      }

      // Strength & Stability
      if (reportConfig.sections.strengthStability && selectedAssessment.fullData.strengthStability) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Strength & Stability", 20, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const strength = selectedAssessment.fullData.strengthStability;
        Object.entries(strength).forEach(([key, value]) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          if (value !== null && value !== undefined && value !== "") {
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
            doc.text(`${label}: ${String(value)}`, 25, yPosition);
            yPosition += 6;
          }
        });
        yPosition += 5;
      }

      // FMS
      if (reportConfig.sections.fms && selectedAssessment.fullData.fms) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Functional Movement Screen (FMS)", 20, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const fms = selectedAssessment.fullData.fms;
        Object.entries(fms).forEach(([key, value]) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          if (value !== null && value !== undefined && value !== "") {
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
            doc.text(`${label}: ${String(value)}`, 25, yPosition);
            yPosition += 6;
          }
        });
        yPosition += 5;
      }

      // Custom Notes
      if (reportConfig.customNotes) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Additional Notes", 20, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const notesLines = doc.splitTextToSize(reportConfig.customNotes, pageWidth - 40);
        notesLines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 25, yPosition);
          yPosition += 6;
        });
      }

      // Footer on last page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }

      // Save PDF
      doc.save(`Assessment-Report-${selectedAssessment.id}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setShowEditor(false);
      setSelectedAssessment(null);
    } catch (error: any) {
      console.error("PDF generation error:", error);
      if (error.message?.includes("jspdf")) {
        alert("Please install jsPDF: npm install jspdf");
      } else {
        alert(`Failed to generate PDF: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateBulkPDFs = async () => {
    if (filteredAssessments.length === 0) {
      alert("No assessments selected for bulk PDF generation.");
      return;
    }

    if (!confirm(`Generate PDF reports for ${filteredAssessments.length} assessment(s) with current settings?`)) {
      return;
    }

    try {
      setLoading(true);
      for (const assessment of filteredAssessments) {
        setSelectedAssessment(assessment);
        await generatePDF();
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
          <h1 className="text-3xl font-bold text-white">Reports</h1>
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
              placeholder="Name or ID..."
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
        {(statusFilter !== "all" || dateFrom || dateTo || domainFilter !== "all" || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("all");
              setDateFrom("");
              setDateTo("");
              setDomainFilter("all");
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
                    <td className="py-4">
                      <button
                        onClick={() => openEditor(assessment)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all disabled:opacity-50"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit & Generate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Editor Modal */}
      {showEditor && selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Report</h2>
                <p className="text-gray-300 text-sm mt-1">
                  {selectedAssessment.name} - {selectedAssessment.id.slice(0, 8)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setSelectedAssessment(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Section Selection */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Select Sections to Include</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(reportConfig.sections).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setReportConfig((prev) => ({
                            ...prev,
                            sections: { ...prev.sections, [key]: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-white text-sm font-bold">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Report Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={reportConfig.includeSummary}
                      onChange={(e) =>
                        setReportConfig((prev) => ({ ...prev, includeSummary: e.target.checked }))
                      }
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-white text-sm font-bold">Include Summary Section</span>
                  </label>
                </div>
              </div>

              {/* Custom Notes */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Additional Notes</h3>
                <textarea
                  value={reportConfig.customNotes}
                  onChange={(e) =>
                    setReportConfig((prev) => ({ ...prev, customNotes: e.target.value }))
                  }
                  placeholder="Add any additional notes or comments to include in the report..."
                  className="textarea-glass w-full min-h-[120px]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setSelectedAssessment(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={generatePDF}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all disabled:opacity-50"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  {loading ? "Generating..." : "Generate PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
