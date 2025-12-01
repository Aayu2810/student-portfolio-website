"use client";

import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
}

export interface SearchFilters {
  fileType?: string;
  status?: string;
  dateRange?: string;
}

export function SearchBar({ onSearch, placeholder = "Search documents..." }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value, filters);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("", filters);
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: string) => {
    const newFilters = {
      ...filters,
      [filterType]: filters[filterType] === value ? undefined : value,
    };
    setFilters(newFilters);
    onSearch(searchQuery, newFilters);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="w-full space-y-3">
      {/* Search Input */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-400 h-11"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative border-white/10 hover:bg-purple-400/20 hover:border-purple-400/30 h-11 w-11"
            >
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-slate-800/95 backdrop-blur-md border-white/10"
          >
            <DropdownMenuLabel className="text-white">Filter By</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />

            {/* File Type Filter */}
            <DropdownMenuLabel className="text-xs text-gray-400 font-normal">
              File Type
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleFilterChange("fileType", "pdf")}
              className={`cursor-pointer ${
                filters.fileType === "pdf"
                  ? "bg-purple-400/20 text-white"
                  : "hover:bg-purple-400/20"
              }`}
            >
              PDF Documents
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFilterChange("fileType", "image")}
              className={`cursor-pointer ${
                filters.fileType === "image"
                  ? "bg-purple-400/20 text-white"
                  : "hover:bg-purple-400/20"
              }`}
            >
              Images
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFilterChange("fileType", "document")}
              className={`cursor-pointer ${
                filters.fileType === "document"
                  ? "bg-purple-400/20 text-white"
                  : "hover:bg-purple-400/20"
              }`}
            >
              Documents
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10" />

            {/* Status Filter */}
            <DropdownMenuLabel className="text-xs text-gray-400 font-normal">
              Status
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleFilterChange("status", "verified")}
              className={`cursor-pointer ${
                filters.status === "verified"
                  ? "bg-purple-400/20 text-white"
                  : "hover:bg-purple-400/20"
              }`}
            >
              Verified
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFilterChange("status", "pending")}
              className={`cursor-pointer ${
                filters.status === "pending"
                  ? "bg-purple-400/20 text-white"
                  : "hover:bg-purple-400/20"
              }`}
            >
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFilterChange("status", "rejected")}
              className={`cursor-pointer ${
                filters.status === "rejected"
                  ? "bg-purple-400/20 text-white"
                  : "hover:bg-purple-400/20"
              }`}
            >
              Rejected
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10" />

            {/* Date Range Filter */}
            <DropdownMenuLabel className="text-xs text-gray-400 font-normal">
              Date Range
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleFilterChange("dateRange", "today")}
              className={`cursor-pointer ${
                filters.dateRange === "today"
                  ? "bg-purple-400/20 text-white"
                  : "hover:bg-purple-400/20"
              }`}
            >
              Today
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFilterChange("dateRange", "week")}
              className={`cursor-pointer ${
                filters.dateRange === "week"
                  ? "bg-purple-400/20 text-white"
                  : "hover:bg-purple-400/20"
              }`}
            >
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFilterChange("dateRange", "month")}
              className={`cursor-pointer ${
                filters.dateRange === "month"
                  ? "bg-purple-400/20 text-white"
                  : "hover:bg-purple-400/20"
              }`}
            >
              This Month
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Active filters:</span>
          {filters.fileType && (
            <Badge
              variant="secondary"
              className="bg-purple-400/20 text-purple-300 border-purple-400/30 hover:bg-purple-400/30"
            >
              {filters.fileType}
              <button
                onClick={() => handleFilterChange("fileType", filters.fileType!)}
                className="ml-1 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.status && (
            <Badge
              variant="secondary"
              className="bg-purple-400/20 text-purple-300 border-purple-400/30 hover:bg-purple-400/30"
            >
              {filters.status}
              <button
                onClick={() => handleFilterChange("status", filters.status!)}
                className="ml-1 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.dateRange && (
            <Badge
              variant="secondary"
              className="bg-purple-400/20 text-purple-300 border-purple-400/30 hover:bg-purple-400/30"
            >
              {filters.dateRange}
              <button
                onClick={() => handleFilterChange("dateRange", filters.dateRange!)}
                className="ml-1 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}