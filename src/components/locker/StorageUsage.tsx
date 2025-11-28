"use client";

import { HardDrive, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StorageUsageProps {
  usedStorage: number; // in bytes
  totalStorage: number; // in bytes
  showDetails?: boolean;
}

export function StorageUsage({
  usedStorage,
  totalStorage,
  showDetails = true,
}: StorageUsageProps) {
  const usedGB = (usedStorage / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (totalStorage / (1024 * 1024 * 1024)).toFixed(2);
  const percentageUsed = (usedStorage / totalStorage) * 100;

  const getStorageColor = () => {
    if (percentageUsed >= 90) return "text-red-400";
    if (percentageUsed >= 75) return "text-amber-400";
    return "text-green-400";
  };

  const getProgressColor = () => {
    if (percentageUsed >= 90) return "bg-red-500";
    if (percentageUsed >= 75) return "bg-amber-500";
    return "bg-purple-500";
  };

  return (
    <div className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Storage</h3>
        </div>
        {percentageUsed >= 90 && (
          <AlertCircle className="w-5 h-5 text-red-400" />
        )}
      </div>

      {/* Progress Bar */}
<div className="relative mb-2">
  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
    <div
      className={cn(
        "h-full transition-all duration-500 rounded-full",
        getProgressColor()
      )}
      style={{ width: `${percentageUsed}%` }}
    />
  </div>
</div>

{/* Storage Details */}
{showDetails && (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">Used</span>
      <span className={cn("font-semibold", getStorageColor())}>
        {usedGB} GB / {totalGB} GB
      </span>
    </div>
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">
        {percentageUsed.toFixed(1)}% used
      </span>
      <span className="text-gray-500">
        {((totalStorage - usedStorage) / (1024 * 1024 * 1024)).toFixed(2)} GB free
      </span>
    </div>
  </div>
)}

      {/* Warning message */}
      {percentageUsed >= 90 && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-xs text-red-400">
            Storage almost full. Consider deleting unused files or upgrading your plan.
          </p>
        </div>
      )}

      {percentageUsed >= 75 && percentageUsed < 90 && (
        <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-400">
            Storage is {percentageUsed.toFixed(0)}% full. You may want to free up some space soon.
          </p>
        </div>
      )}
    </div>
  );
}