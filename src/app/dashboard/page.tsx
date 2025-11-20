// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

import {
  HomeIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowUpRightIcon,
  UserCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

type TabKey = "overview" | "entries" | "add" | "export";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<TabKey>("overview");
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [domainFilter, setDomainFilter] = useState<"all" | "specific">("all");
  const [specificDomain, setSpecificDomain] = useState<string>("Physiotherapy");
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("csv");

  // demo data for entries
  const demoEntries = [
    { id: "P-001", name: "Asha K", age: 28, date: "2025-11-18", status: "Completed" },
    { id: "P-002", name: "Rohit P", age: 31, date: "2025-11-17", status: "Pending" },
    { id: "P-003", name: "Meera S", age: 24, date: "2025-11-15", status: "Incomplete" },
    { id: "P-004", name: "Rahul V", age: 27, date: "2025-11-10", status: "Completed" },
  ];

  // quick auth check (keeps previous behaviour)
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUserEmail(u.email ?? null);
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
      alert("Logout failed. Try again.");
    }
  };

  const patientOptions = demoEntries.map((d) => ({ id: d.id, label: `${d.name} (${d.id})` }));

  // Some helpers for the overview metrics (demo calculations)
  const totalPatients = demoEntries.length * 25; // dummy
  const assessmentsThisMonth = 42;
  const pendingReports = demoEntries.filter((d) => d.status === "Pending").length;
  const avgHealthScore = 78; // demo

  // add-entry tab: stepper/tab state
  const [addTab, setAddTab] = useState<number>(0);
  const addTabs = ["Physiotherapy", "Physiology", "Biomechanics", "Nutrition", "Psychology"];

  // export download handler (demo)
  const handleDownload = () => {
    alert(`Preparing ${exportFormat.toUpperCase()} for ${domainFilter === "all" ? "All Domains" : specificDomain} ${selectedPatient ? (" - " + selectedPatient) : ""}`);
  };

  return (
    <div className={`${inter.className} min-h-screen bg-gradient-to-b from-[#f3f5ff] via-[#f8fbff] to-white`}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 min-h-screen bg-white border-r border-gray-200 hidden lg:flex flex-col">
          <div className="px-6 py-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center text-white font-semibold text-lg">
                PH
              </div>
              <div>
                <div className="font-semibold text-gray-900">PhysioHub</div>
                <div className="text-xs text-gray-500">Clinical Dashboard</div>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveView("overview")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${activeView === "overview" ? "bg-green-50 text-green-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <HomeIcon className="w-5 h-5" />
                Overview
              </button>

              <button
                onClick={() => setActiveView("entries")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${activeView === "entries" ? "bg-green-50 text-green-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <DocumentTextIcon className="w-5 h-5" />
                Entries
              </button>

              <button
                onClick={() => setActiveView("add")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${activeView === "add" ? "bg-green-50 text-green-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <PlusCircleIcon className="w-5 h-5" />
                Add New Entry
              </button>

              <button
                onClick={() => setActiveView("export")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${activeView === "export" ? "bg-green-50 text-green-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Export Data
              </button>
            </nav>
          </div>

          <div className="mt-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <button onClick={() => alert("Settings clicked")} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <Cog6ToothIcon className="w-5 h-5" />
                Settings
              </button>

              <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700">
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 min-h-screen">
          {/* Top Navbar */}
          <div className="sticky top-0 z-10 bg-transparent backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-4">
                {/* Search */}
                <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                    <div className="relative">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search patient details..."
                        className="w-96 md:w-[420px] p-2.5 pl-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌘K</div>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">
                  <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                    <BellIcon className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-full px-3 py-1">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      <UserCircleIcon className="w-6 h-6" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{userEmail ?? "Doctor"}</div>
                      <div className="text-xs text-gray-500">Physiotherapist</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Render views */}
            {activeView === "overview" && (
              <section aria-label="Overview">
                {/* Metrics row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">Total Patients</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{totalPatients}</div>
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <ArrowUpRightIcon className="w-5 h-5" />
                        <div className="ml-1">+4.6%</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-50">
                    <div className="text-xs text-gray-500">Assessments This Month</div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">{assessmentsThisMonth}</div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-50">
                    <div className="text-xs text-gray-500">Pending Reports</div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">{pendingReports}</div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-50">
                    <div className="text-xs text-gray-500">Average Health Score</div>
                    <div className="mt-2 text-2xl font-bold text-gray-900">{avgHealthScore}%</div>
                  </div>
                </div>

                {/* Middle row: chart + tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 border border-gray-50 min-h-[280px]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Patient Distribution</h3>
                      <div className="text-sm text-gray-500">Last 30 days</div>
                    </div>

                    {/* Chart placeholder */}
                    <div className="w-full h-48 rounded-md bg-gradient-to-r from-green-50 to-blue-50 border border-dashed border-gray-100 flex items-center justify-center text-gray-400">
                      <ChartBarIcon className="w-12 h-12" />
                      <div className="ml-3">Chart / Graph placeholder</div>
                    </div>

                    {/* small legend / stats */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-lg border border-gray-100 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500">New Patients</div>
                          <div className="text-sm font-semibold text-gray-900">34</div>
                        </div>
                        <div className="text-sm text-green-600">+12%</div>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-gray-100 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500">Avg Assessment Time</div>
                          <div className="text-sm font-semibold text-gray-900">18m</div>
                        </div>
                        <div className="text-sm text-gray-500">stable</div>
                      </div>
                    </div>
                  </div>

                  <aside className="bg-white rounded-xl shadow-sm p-5 border border-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Tasks</h3>

                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">Asha K — Follow up</div>
                          <div className="text-xs text-gray-500">Due: 2025-11-21</div>
                        </div>
                        <div className="text-xs text-gray-500">High</div>
                      </li>

                      <li className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">Rohit P — Report review</div>
                          <div className="text-xs text-gray-500">Due: 2025-11-23</div>
                        </div>
                        <div className="text-xs text-gray-500">Medium</div>
                      </li>

                      <li className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">New patient intake</div>
                          <div className="text-xs text-gray-500">Due: 2025-11-24</div>
                        </div>
                        <div className="text-xs text-gray-500">Low</div>
                      </li>
                    </ul>
                  </aside>
                </div>

                {/* Recent entries table preview */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
                    <div className="text-sm text-gray-500">Showing latest 5</div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs text-gray-500">
                        <tr>
                          <th className="py-2">Patient ID</th>
                          <th className="py-2">Name</th>
                          <th className="py-2">Age</th>
                          <th className="py-2">Assessment Date</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">
                        {demoEntries.slice(0, 4).map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50">
                            <td className="py-3 text-gray-700">{row.id}</td>
                            <td className="py-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-600">
                                {row.name.split(" ").map((n) => n[0]).slice(0,2).join("")}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{row.name}</div>
                                <div className="text-xs text-gray-500">Physiotherapy</div>
                              </div>
                            </td>
                            <td className="py-3 text-gray-700">{row.age}</td>
                            <td className="py-3 text-gray-700">{row.date}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${row.status === "Completed" ? "bg-green-50 text-green-700" : row.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <button title="View" className="p-2 rounded-md hover:bg-gray-50 text-gray-600"><EyeIcon className="w-4 h-4" /></button>
                                <button title="Edit" className="p-2 rounded-md hover:bg-gray-50 text-gray-600"><PencilIcon className="w-4 h-4" /></button>
                                <button title="Delete" className="p-2 rounded-md hover:bg-gray-50 text-red-600"><TrashIcon className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeView === "entries" && (
              <section aria-label="Entries">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Entries</h2>
                  <div className="flex items-center gap-3">
                    <input placeholder="Search entries..." className="p-2 border rounded-lg text-sm" />
                    <button className="px-3 py-2 bg-green-600 text-white rounded-lg">New Entry</button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-gray-500 text-left">
                        <tr>
                          <th className="py-2">Patient ID</th>
                          <th className="py-2">Name</th>
                          <th className="py-2">Age</th>
                          <th className="py-2">Assessment Date</th>
                          <th className="py-2">Overall Status</th>
                          <th className="py-2">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">
                        {demoEntries.map((row) => (
                          <tr key={row.id}>
                            <td className="py-3">{row.id}</td>
                            <td className="py-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-600">
                                {row.name.split(" ").map((n) => n[0]).slice(0,2).join("")}
                              </div>
                              <div>
                                <div className="font-medium">{row.name}</div>
                                <div className="text-xs text-gray-500">View profile</div>
                              </div>
                            </td>
                            <td className="py-3">{row.age}</td>
                            <td className="py-3">{row.date}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${row.status === "Completed" ? "bg-green-50 text-green-700" : row.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <button title="View" className="p-2 rounded-md hover:bg-gray-50 text-gray-600"><EyeIcon className="w-4 h-4" /></button>
                                <button title="Edit" className="p-2 rounded-md hover:bg-gray-50 text-gray-600"><PencilIcon className="w-4 h-4" /></button>
                                <button title="Delete" className="p-2 rounded-md hover:bg-gray-50 text-red-600"><TrashIcon className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeView === "add" && (
              <section aria-label="Add New Entry">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                    <h2 className="text-xl font-semibold">Add New Entry</h2>
                    <div className="flex items-center gap-2">
                      {addTabs.map((t, idx) => (
                        <button
                          key={t}
                          onClick={() => setAddTab(idx)}
                          className={`px-3 py-2 rounded-md text-sm ${addTab === idx ? "bg-green-50 text-green-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    {/* Render active domain form - Physiotherapy implemented, others placeholder */}
                    {addTabs[addTab] === "Physiotherapy" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input className="p-3 border rounded" placeholder="Patient Name" />
                          <input className="p-3 border rounded" placeholder="Age" />
                          <input className="p-3 border rounded" placeholder="Gender" />
                          <input type="date" className="p-3 border rounded" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <textarea className="p-3 border rounded" placeholder="Chief complaints / History" />
                          <textarea className="p-3 border rounded" placeholder="Assessment findings" />
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-2">
                          <button className="px-4 py-2 border rounded">Reset</button>
                          <button className="px-4 py-2 bg-green-600 text-white rounded">Save Domain</button>
                        </div>
                      </div>
                    )}

                    {addTabs[addTab] !== "Physiotherapy" && (
                      <div className="p-6 border rounded bg-gray-50 text-gray-600">
                        <div className="font-medium">{addTabs[addTab]}</div>
                        <div className="mt-2 text-sm">Template placeholder — will add full form when provided.</div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeView === "export" && (
              <section aria-label="Export Data">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-50">
                  <h2 className="text-lg font-semibold mb-4">Export Data</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Select Patient</label>
                      <select className="w-full p-3 border rounded mt-1" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
                        <option value="">All patients</option>
                        {patientOptions.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600">Domain</label>
                      <div className="mt-2 flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="domain" checked={domainFilter === "all"} onChange={() => setDomainFilter("all")} />
                          <span>All Domains</span>
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="domain" checked={domainFilter === "specific"} onChange={() => setDomainFilter("specific")} />
                          <span>Specific Domain</span>
                        </label>

                        {domainFilter === "specific" && (
                          <select className="p-2 border rounded" value={specificDomain} onChange={(e) => setSpecificDomain(e.target.value)}>
                            <option>Physiotherapy</option>
                            <option>Physiology</option>
                            <option>Biomechanics</option>
                            <option>Nutrition</option>
                            <option>Psychology</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="text-sm text-gray-600">Format</label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <button onClick={() => setExportFormat("csv")} className={`p-6 rounded-lg border ${exportFormat === "csv" ? "border-green-600 bg-green-50" : "border-gray-100 bg-white"}`}>
                        <div className="text-sm font-semibold">CSV</div>
                        <div className="text-xs text-gray-500 mt-1">Comma-separated values</div>
                      </button>

                      <button onClick={() => setExportFormat("xlsx")} className={`p-6 rounded-lg border ${exportFormat === "xlsx" ? "border-green-600 bg-green-50" : "border-gray-100 bg-white"}`}>
                        <div className="text-sm font-semibold">Excel</div>
                        <div className="text-xs text-gray-500 mt-1">Microsoft Excel (.xlsx)</div>
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end">
                    <button onClick={handleDownload} className="px-6 py-3 bg-green-600 text-white rounded-lg">Download Report</button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-md px-4 py-2 flex gap-4 lg:hidden">
        <button onClick={() => setActiveView("overview")} className={`p-2 ${activeView === "overview" ? "text-green-600" : "text-gray-600"}`}><HomeIcon className="w-5 h-5" /></button>
        <button onClick={() => setActiveView("entries")} className={`p-2 ${activeView === "entries" ? "text-green-600" : "text-gray-600"}`}><DocumentTextIcon className="w-5 h-5" /></button>
        <button onClick={() => setActiveView("add")} className={`p-2 ${activeView === "add" ? "text-green-600" : "text-gray-600"}`}><PlusCircleIcon className="w-5 h-5" /></button>
        <button onClick={() => setActiveView("export")} className={`p-2 ${activeView === "export" ? "text-green-600" : "text-gray-600"}`}><ArrowDownTrayIcon className="w-5 h-5" /></button>
      </nav>
    </div>
  );
}
