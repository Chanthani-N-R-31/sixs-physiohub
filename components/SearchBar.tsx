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
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          placeholder="Search by ID/Name"
          className="w-full p-2.5 pl-10 pr-10 rounded-lg border border-gray-600 bg-gray-700 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-white/70 uppercase">
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
                  className="px-3 py-3 hover:bg-gray-700 rounded-lg cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm text-white font-medium">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {patient.name}
                      </div>
                      <div className="text-xs text-white/70">
                        ID: {patient.id} • Age: {patient.age} • Date:{" "}
                        {patient.date}
                      </div>
                      <div className="mt-1">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-600 text-white font-medium">
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
              <div className="text-white/50 mb-2">
                <MagnifyingGlassIcon className="w-12 h-12 mx-auto" />
              </div>
              <div className="text-white font-medium">No patients found</div>
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
