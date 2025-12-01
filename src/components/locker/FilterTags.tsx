"use client";

import { useState } from "react";
import { FileText, Image, Award, Briefcase, Heart, Star, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterTag {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface FilterTagsProps {
  onFilterChange: (filterId: string) => void;
  activeFilter: string;
}

const defaultTags: FilterTag[] = [
  { id: "all", label: "All", icon: <Star className="w-4 h-4" />, count: 0 },
  { id: "documents", label: "Documents", icon: <FileText className="w-4 h-4" />, count: 0 },
  { id: "images", label: "Images", icon: <Image className="w-4 h-4" />, count: 0 },
  { id: "certificates", label: "Certificates", icon: <Award className="w-4 h-4" />, count: 0 },
  { id: "academic", label: "Academic", icon: <Briefcase className="w-4 h-4" />, count: 0 },
  { id: "personal", label: "Personal", icon: <Heart className="w-4 h-4" />, count: 0 },
  { id: "archived", label: "Archived", icon: <Archive className="w-4 h-4" />, count: 0 },
];

export function FilterTags({ onFilterChange, activeFilter }: FilterTagsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {defaultTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onFilterChange(tag.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200",
              "border hover:scale-105",
              activeFilter === tag.id
                ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-purple-400/20 hover:border-purple-400/30"
            )}
          >
            {tag.icon}
            <span className="font-medium">{tag.label}</span>
            {tag.count !== undefined && tag.count > 0 && (
              <span
                className={cn(
                  "ml-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                  activeFilter === tag.id
                    ? "bg-white/20 text-white"
                    : "bg-purple-400/20 text-purple-300"
                )}
              >
                {tag.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}