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
        <button className="px-4 py-2 bg-gray-300 text-black font-bold rounded-lg hover:bg-gray-400 transition-all shadow-lg text-sm">
          + Add New Physio
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_USERS.map((user) => (
          <div
            key={user.id}
            className="relative group bg-gray-100 rounded-xl border border-gray-400 p-6 shadow-lg hover:bg-gray-200 transition-colors"
          >
            <button className="absolute top-4 right-4 text-black/70 hover:text-black transition-colors">
              <EllipsisVerticalIcon className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold text-black border border-gray-400 shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-black text-lg">{user.name}</h3>
                <p className="text-xs text-black/70 font-mono">{user.email}</p>
                <p className="text-xs text-black font-bold mt-1 bg-gray-300 px-2 py-0.5 rounded">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-400 pt-4 mb-4">
              <div className="text-center p-2 bg-white rounded-lg border border-gray-400">
                <p className="text-xs text-black uppercase font-bold">
                  Individuals
                </p>
                <p className="font-bold text-black text-lg">
                  {user.individuals}
                </p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg border border-gray-400">
                <p className="text-xs text-black uppercase font-bold">
                  Assessments
                </p>
                <p className="font-bold text-black text-lg">--</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  user.status === "Active"
                    ? "bg-gray-300 text-black border-gray-400"
                    : "bg-gray-200 text-black border-gray-300"
                }`}
              >
                {user.status}
              </span>
              <button className="text-sm text-black font-bold hover:text-black/80 hover:underline decoration-2 underline-offset-2 transition-colors">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
