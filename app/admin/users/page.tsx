"use client";

import { EllipsisVerticalIcon, UserCircleIcon } from "@heroicons/react/24/outline";

const MOCK_USERS = [
  { id: 1, name: "Dr. Sarah Smith", email: "sarah@sixs.com", role: "Physio", individuals: 45, status: "Active" },
  { id: 2, name: "Dr. Rajesh K", email: "raj@sixs.com", role: "Physio", individuals: 32, status: "Active" },
  { id: 3, name: "Dr. Emily Blunt", email: "emily@sixs.com", role: "Physio", individuals: 0, status: "Inactive" },
];

export default function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">Manage access and view physio performance.</p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition shadow-sm">
          + Add New Physio
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_USERS.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group hover:border-green-300 transition-colors">
            <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <EllipsisVerticalIcon className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-600">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{user.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                <p className="text-xs text-green-600 font-medium mt-1">{user.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mb-4">
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold">Individuals</p>
                <p className="font-bold text-slate-900 text-lg">{user.individuals}</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold">Assessments</p>
                <p className="font-bold text-slate-900 text-lg">--</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                user.status === 'Active' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}>
                {user.status}
              </span>
              <button className="text-sm text-green-600 font-medium hover:underline decoration-2 underline-offset-2">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

