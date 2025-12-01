"use client";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

const MOCK_USERS = [
  {
    id: 1,
    name: "Dr. Sarah Smith",
    email: "sarah@sixs.com",
    role: "Physio",
    individuals: 45,
    status: "Active",
  },
  {
    id: 2,
    name: "Dr. Rajesh K",
    email: "raj@sixs.com",
    role: "Physio",
    individuals: 32,
    status: "Active",
  },
  {
    id: 3,
    name: "Dr. Emily Blunt",
    email: "emily@sixs.com",
    role: "Physio",
    individuals: 0,
    status: "Inactive",
  },
];

export default function UserManagement() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">User Management</h2>
          <p className="text-white/70 mt-1 font-medium">
            Manage access and view physio performance.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 transition-all shadow-lg border border-blue-800 text-sm">
          + Add New Physio
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_USERS.map((user) => (
          <div
            key={user.id}
            className="relative group bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:bg-gray-700/80 transition-colors"
          >
            <button className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
              <EllipsisVerticalIcon className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-900 rounded-full flex items-center justify-center text-xl font-bold text-white border border-blue-800 shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{user.name}</h3>
                <p className="text-xs text-gray-300 font-mono">{user.email}</p>
                <p className="text-xs text-white font-bold mt-1 bg-blue-600/80 px-2 py-0.5 rounded">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-4 mb-4">
              <div className="text-center p-2 bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-300 uppercase font-bold">
                  Individuals
                </p>
                <p className="font-bold text-white text-lg">
                  {user.individuals}
                </p>
              </div>
              <div className="text-center p-2 bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-300 uppercase font-bold">
                  Assessments
                </p>
                <p className="font-bold text-white text-lg">--</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  user.status === "Active"
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-gray-700 text-gray-200 border-gray-500"
                }`}
              >
                {user.status}
              </span>
              <button className="text-sm text-blue-300 font-bold hover:text-blue-200 hover:underline decoration-2 underline-offset-2 transition-colors">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
