// src/app/dashboard/entries/EntriesPage.tsx
"use client";

import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface EntriesPageProps {
  onNewEntry?: () => void;
}

export default function EntriesPage({ onNewEntry }: EntriesPageProps) {
  const demoEntries = [
    { id: "P-001", name: "Asha K", age: 28, date: "2025-11-18", status: "Completed" },
    { id: "P-002", name: "Rohit P", age: 31, date: "2025-11-17", status: "Pending" },
    { id: "P-003", name: "Meera S", age: 24, date: "2025-11-15", status: "Incomplete" },
    { id: "P-004", name: "Rahul V", age: 27, date: "2025-11-10", status: "Completed" },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Entries</h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onNewEntry}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 whitespace-nowrap"
          >
            + New Entry
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="text-xs text-gray-500 text-left border-b border-gray-100">
              <tr>
                <th className="py-3">Patient ID</th>
                <th className="py-3">Name</th>
                <th className="py-3">Age</th>
                <th className="py-3">Assessment Date</th>
                <th className="py-3">Overall Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {demoEntries.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 text-gray-900">{row.id}</td>

                  <td className="py-4 text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center">
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
