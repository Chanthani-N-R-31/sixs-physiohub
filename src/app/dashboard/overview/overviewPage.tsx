// src/app/dashboard/overview/OverviewPage.tsx
"use client";

import {
  ArrowUpRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function OverviewPage() {
  // demo data
  const demoEntries = [
    { id: "P-001", name: "Asha K", age: 28, date: "2025-11-18", status: "Completed" },
    { id: "P-002", name: "Rohit P", age: 31, date: "2025-11-17", status: "Pending" },
    { id: "P-003", name: "Meera S", age: 24, date: "2025-11-15", status: "Incomplete" },
  ];

  const totalPatients = demoEntries.length;
  const assessmentsThisMonth = 42;
  const pendingReports = demoEntries.filter((d) => d.status === "Pending").length;

  return (
    <div className="w-full overflow-x-hidden">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Total Individuals</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {totalPatients}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-xs text-gray-500">Assessments This Month</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {assessmentsThisMonth}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-xs text-gray-500">Pending Reports</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {pendingReports}
          </div>
        </div>
      </div>

      {/* Recent Entries Table */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Entries
          </h3>
          <span className="text-sm text-gray-500">Showing latest 5</span>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="text-xs text-gray-500 text-left">
              <tr>
                <th className="py-2">Patient ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Age</th>
                <th className="py-2">Assessment Date</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {demoEntries.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="py-4 text-gray-900">{row.id}</td>

                  <td className="py-4 text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-700">
                      {row.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div>
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-gray-500">Physiotherapy</div>
                    </div>
                  </td>

                  <td className="py-4 text-gray-900">{row.age}</td>
                  <td className="py-4 text-gray-900">{row.date}</td>

                  <td className="py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        row.status === "Completed"
                          ? "bg-green-50 text-green-700"
                          : row.status === "Pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <button
                        title="View"
                        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      <button
                        title="Edit"
                        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>

                      <button
                        title="Delete"
                        className="p-2 rounded-md text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
