"use client";

import { EllipsisVerticalIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import GlassCard from "@/components/ui/GlassCard";

const MOCK_USERS = [
  { id: 1, name: "Dr. Sarah Smith", email: "sarah@sixs.com", role: "Physio", individuals: 45, status: "Active" },
  { id: 2, name: "Dr. Rajesh K", email: "raj@sixs.com", role: "Physio", individuals: 32, status: "Active" },
  { id: 3, name: "Dr. Emily Blunt", email: "emily@sixs.com", role: "Physio", individuals: 0, status: "Inactive" },
];

export default function UserManagement() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">User Management</h2>
          <p className="text-white/70 mt-1 font-medium">Manage access and view physio performance.</p>
        </div>
        <button className="px-4 py-2 bg-[#1a4d4d]/80 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-[#1a4d4d]/90 transition-all shadow-lg border border-[#1a4d4d]/50 text-sm">
          + Add New Physio
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_USERS.map((user) => (
          <GlassCard key={user.id} className="relative group hover:bg-white/15 transition-all">
            <button className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
              <EllipsisVerticalIcon className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#1a4d4d]/80 backdrop-blur-sm rounded-full flex items-center justify-center text-xl font-bold text-white border border-[#1a4d4d]/50 shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{user.name}</h3>
                <p className="text-xs text-white/70 font-mono">{user.email}</p>
                <p className="text-xs text-[#1a4d4d] font-bold mt-1 bg-white/20 px-2 py-0.5 rounded">{user.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 mb-4">
              <div className="text-center p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="text-xs text-white/70 uppercase font-bold">Individuals</p>
                <p className="font-bold text-white text-lg">{user.individuals}</p>
              </div>
              <div className="text-center p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="text-xs text-white/70 uppercase font-bold">Assessments</p>
                <p className="font-bold text-white text-lg">--</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-sm ${
                user.status === 'Active' 
                  ? 'bg-green-500/80 text-white border-green-500/50' 
                  : 'bg-white/20 text-white/80 border-white/30'
              }`}>
                {user.status}
              </span>
              <button className="text-sm text-white/80 font-bold hover:text-white hover:underline decoration-2 underline-offset-2 transition-colors">
                View Profile
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
