// src/app/dashboard/overview/OverviewPage.tsx
"use client";

import {
  ArrowUpRightIcon,
  ChartBarIcon,
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

  const totalPatients = demoEntries.length * 25;
  const assessmentsThisMonth = 42;
  const pendingReports = demoEntries.filter((d) => d.status === "Pending").length;
  const avgHealthScore = 78;

  return (
    <div className="w-full overflow-x-hidden">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Total Patients</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {totalPatients}
              </div>
            </div>

            <div className="flex items-center text-sm text-green-600">
              <ArrowUpRightIcon className="w-5 h-5" />
              <span className="ml-1">+4.6%</span>
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

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-xs text-gray-500">Average Health Score</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {avgHealthScore}%
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100 min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Patient Distribution
            </h3>
            <span className="text-sm text-gray-500">Last 30 days</span>
          </div>

          <div className="w-full h-56 rounded-lg bg-[#eef3ff] border border-gray-200 flex items-center justify-center text-gray-400">
            <ChartBarIcon className="w-12 h-12" />
            <div className="mt-2">Chart / Graph placeholder</div>
          </div>

          {/* Small Stats Under Chart */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">New Patients</div>
                <div className="text-sm font-semibold text-gray-900">34</div>
              </div>
              <div className="flex items-center text-xs text-green-700">
                <ArrowUpRightIcon className="w-3 h-3 mr-1" />
                +12%
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Avg Assessment Time</div>
                <div className="text-sm font-semibold text-gray-900">18m</div>
              </div>
              <span className="text-xs text-gray-500">stable</span>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <aside className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Tasks
          </h3>

          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start justify-between">
              <div>
                <div className="font-medium">Asha K — Follow up</div>
                <div className="text-xs text-gray-500">Due: 2025-11-21</div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 font-medium">
                High
              </span>
            </li>

            <li className="flex items-start justify-between">
              <div>
                <div className="font-medium">Rohit P — Report review</div>
                <div className="text-xs text-gray-500">Due: 2025-11-23</div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-orange-50 text-orange-700 font-medium">
                Medium
              </span>
            </li>

            <li className="flex items-start justify-between">
              <div>
                <div className="font-medium">New patient intake</div>
                <div className="text-xs text-gray-500">Due: 2025-11-24</div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 font-medium">
                Low
              </span>
            </li>
          </ul>
        </aside>
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
