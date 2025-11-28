"use client";

import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BreadcrumbItem } from "@/types/locker.types";

interface FolderBreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem) => void;
}

export function FolderBreadcrumb({ items, onNavigate }: FolderBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      {/* Home Icon */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate({ id: "root", name: "Home", path: "/" })}
        className="h-8 px-2 hover:bg-purple-400/20 text-gray-400 hover:text-white"
      >
        <Home className="w-4 h-4" />
      </Button>

      {/* Breadcrumb Items */}
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-600" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(item)}
            disabled={index === items.length - 1}
            className={cn(
              "h-8 px-3 font-medium transition-colors",
              index === items.length - 1
                ? "text-white cursor-default hover:bg-transparent"
                : "text-gray-400 hover:text-white hover:bg-purple-400/20"
            )}
          >
            {item.name}
          </Button>
        </div>
      ))}
    </nav>
  );
}