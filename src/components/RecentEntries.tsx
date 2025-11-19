"use client";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

type Entry = {
  id: string;
  patient: string;
  domain: string;
  date: string;
  note: string;
};

const dummy: Entry[] = [
  { id: "1", patient: "Asha K", domain: "Physiotherapy", date: "2025-11-18", note: "Knee rehab session" },
  { id: "2", patient: "Rohit P", domain: "Nutrition", date: "2025-11-17", note: "Diet plan updated" },
  { id: "3", patient: "Meera S", domain: "Psychology", date: "2025-11-15", note: "Follow-up" },
];

export default function RecentEntries() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Recent Entries</h3>
        <span className="text-xs text-gray-500">Last 7 days</span>
      </div>

      <ul className="space-y-3">
        {dummy.map((d) => (
          <li key={d.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">{d.patient}</div>
              <div className="text-xs text-gray-500">{d.domain} • {d.date}</div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-md hover:bg-gray-50" title="Edit">
                <PencilSquareIcon className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 rounded-md hover:bg-gray-50" title="Delete">
                <TrashIcon className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
