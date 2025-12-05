"use client";

import { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";

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

type FilterType = "all" | "name" | "id" | "condition";

export default function SearchBar({ patients, onPatientSelect }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
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
    const filtered = patients.filter((patient) => {
      if (filterType === "name") {
        return patient.name.toLowerCase().includes(query);
      } else if (filterType === "id") {
        return patient.id.toLowerCase().includes(query);
      } else if (filterType === "condition") {
        // Search by status/condition
        return patient.status.toLowerCase().includes(query);
      } else {
        // All: search across all fields
        return (
          patient.name.toLowerCase().includes(query) ||
          patient.id.toLowerCase().includes(query) ||
          (patient.age && String(patient.age).includes(query)) ||
          (patient.date && patient.date.toLowerCase().includes(query)) ||
          patient.status.toLowerCase().includes(query)
        );
      }
    });

    setSearchResults(filtered);
    setShowResults(filtered.length > 0);
  }, [searchQuery, patients]);

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const getPlaceholder = () => {
    switch (filterType) {
      case "name":
        return "Search by Name";
      case "id":
        return "Search by ID";
      case "condition":
        return "Search by Status/Condition";
      default:
        return "Search by ID/Name/Condition";
    }
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case "name":
        return "Name";
      case "id":
        return "ID";
      case "condition":
        return "Condition";
      default:
        return "All";
    }
  };

  return (
    <div className="relative w-full sm:w-96 md:w-[480px]" ref={searchRef}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          placeholder={getPlaceholder()}
          className="w-full p-2.5 pl-10 pr-24 rounded-lg border border-gray-300 bg-gray-100 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
        
        {/* Filter Type Button */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            onClick={() => {
              const types: FilterType[] = ["all", "name", "id", "condition"];
              const currentIndex = types.indexOf(filterType);
              setFilterType(types[(currentIndex + 1) % types.length]);
            }}
            className="px-2 py-1 text-xs font-medium bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors flex items-center gap-1"
            title={`Filter: ${getFilterLabel()}`}
          >
            <FunnelIcon className="w-3 h-3" />
            <span>{getFilterLabel()}</span>
          </button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-white/70 uppercase flex items-center justify-between">
                <span>Search Results ({searchResults.length})</span>
                <span className="text-teal-400 font-normal normal-case">
                  Filter: {getFilterLabel()}
                </span>
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
