"use client";

import { useState } from "react";
import {
  Award,
  Briefcase,
  FileText,
  GraduationCap,
  Heart,
  Home,
  Shield,
  Tag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface DocumentCategoryProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const categories: Category[] = [
  {
    id: "academic",
    name: "Academic",
    icon: <GraduationCap className="w-5 h-5" />,
    description: "Degrees, transcripts, certificates",
    color: "text-blue-400",
  },
  {
    id: "certificates",
    name: "Certificates",
    icon: <Award className="w-5 h-5" />,
    description: "Awards, achievements, licenses",
    color: "text-yellow-400",
  },
  {
    id: "professional",
    name: "Professional",
    icon: <Briefcase className="w-5 h-5" />,
    description: "Resume, work documents, contracts",
    color: "text-green-400",
  },
  {
    id: "identity",
    name: "Identity",
    icon: <Shield className="w-5 h-5" />,
    description: "ID cards, passport, licenses",
    color: "text-red-400",
  },
  {
    id: "personal",
    name: "Personal",
    icon: <Heart className="w-5 h-5" />,
    description: "Personal documents, letters",
    color: "text-pink-400",
  },
  {
    id: "property",
    name: "Property",
    icon: <Home className="w-5 h-5" />,
    description: "Deeds, leases, agreements",
    color: "text-orange-400",
  },
  {
    id: "other",
    name: "Other",
    icon: <Tag className="w-5 h-5" />,
    description: "Miscellaneous documents",
    color: "text-gray-400",
  },
];

export function DocumentCategory({
  selectedCategory,
  onCategoryChange,
}: DocumentCategoryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "dropdown">("grid");

  const selectedCat = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Toggle View Mode */}
      <div className="flex items-center justify-between">
        <Label className="text-white">Select Document Category</Label>
        <button
          onClick={() => setViewMode(viewMode === "grid" ? "dropdown" : "grid")}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Switch to {viewMode === "grid" ? "Dropdown" : "Grid"} View
        </button>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "p-4 rounded-lg border-2 transition-all text-left",
                "hover:scale-105 hover:shadow-lg",
                selectedCategory === category.id
                  ? "bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-400/30"
              )}
            >
              <div className="flex flex-col gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    selectedCategory === category.id
                      ? "bg-purple-500/20"
                      : "bg-white/5"
                  )}
                >
                  <span className={category.color}>{category.icon}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {category.description}
                  </p>
                </div>
                {selectedCategory === category.id && (
                  <div className="mt-2 w-full h-1 bg-purple-500 rounded-full" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Dropdown View */}
      {viewMode === "dropdown" && (
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue>
              {selectedCat && (
                <div className="flex items-center gap-3">
                  <span className={selectedCat.color}>{selectedCat.icon}</span>
                  <div className="text-left">
                    <p className="font-medium">{selectedCat.name}</p>
                    <p className="text-xs text-gray-400">
                      {selectedCat.description}
                    </p>
                  </div>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-3 py-1">
                  <span className={category.color}>{category.icon}</span>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-gray-400">
                      {category.description}
                    </p>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Selected Category Display */}
      {selectedCat && (
        <Card className="p-4 bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <span className={selectedCat.color}>{selectedCat.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-purple-300 font-medium">
                Selected Category:
              </p>
              <p className="text-white font-semibold">{selectedCat.name}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}