// src/components/SearchBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Patient {
  id: string;
  name: string;
  age: number;
  date: string;
  status: string;
}

interface SearchBarProps {
  patients: Patient[];
  onPatientSelect?: (patient: Patient) => void;
}

export default function SearchBar({ patients, onPatientSelect }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (!patients || patients.length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query) ||
        (patient.age && String(patient.age).includes(query)) ||
        (patient.date && patient.date.toLowerCase().includes(query))
    );

    setSearchResults(filtered);
    setShowResults(filtered.length > 0);
  }, [searchQuery, patients]);

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full sm:w-96 md:w-[420px]" ref={searchRef}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          placeholder="Search by ID/Name"
          className="w-full p-3 pl-10 pr-10 rounded-lg bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 shadow-lg"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-white/10 backdrop-blur-md rounded-lg shadow-2xl border border-white/30 max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-bold text-white/70 uppercase">
                Search Results ({searchResults.length})
              </div>
              {searchResults.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => {
                    if (onPatientSelect) {
                      onPatientSelect(patient);
                    }
                    setSearchQuery("");
                    setShowResults(false);
                  }}
                  className="px-3 py-3 hover:bg-white/10 rounded-lg cursor-pointer border-b border-white/20 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a4d4d]/80 backdrop-blur-sm flex items-center justify-center text-sm text-white font-bold border border-[#1a4d4d]/50">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">
                        {patient.name}
                      </div>
                      <div className="text-xs text-white/70">
                        ID: {patient.id} • Age: {patient.age} • Date:{" "}
                        {patient.date}
                      </div>
                      <div className="mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            patient.status === "Completed"
                              ? "bg-green-500/80 text-white border border-green-500/50"
                              : patient.status === "Pending"
                              ? "bg-yellow-500/80 text-white border border-yellow-500/50"
                              : "bg-red-500/80 text-white border border-red-500/50"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-white/70 mb-2">
                <MagnifyingGlassIcon className="w-12 h-12 mx-auto" />
              </div>
              <div className="text-white font-bold">No patients found</div>
              <div className="text-sm text-white/70 mt-1">
                Try searching with a different name or ID
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
