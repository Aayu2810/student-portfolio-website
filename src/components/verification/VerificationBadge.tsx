"use client";

import { CheckCircle, Clock, XCircle, AlertCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  status: "verified" | "pending" | "rejected" | "in-review" | "expired";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function VerificationBadge({
  status,
  size = "md",
  showLabel = true,
  className,
}: VerificationBadgeProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "px-2 py-1 text-xs",
          icon: "w-3 h-3",
        };
      case "lg":
        return {
          container: "px-4 py-2 text-base",
          icon: "w-5 h-5",
        };
      case "md":
      default:
        return {
          container: "px-3 py-1.5 text-sm",
          icon: "w-4 h-4",
        };
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "verified":
        return {
          icon: CheckCircle,
          label: "Verified",
          bgClass: "bg-green-500/20",
          textClass: "text-green-400",
          borderClass: "border-green-500/40",
          glowClass: "shadow-green-500/20",
        };
      case "in-review":
        return {
          icon: Shield,
          label: "In Review",
          bgClass: "bg-blue-500/20",
          textClass: "text-blue-400",
          borderClass: "border-blue-500/40",
          glowClass: "shadow-blue-500/20",
        };
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          bgClass: "bg-amber-500/20",
          textClass: "text-amber-400",
          borderClass: "border-amber-500/40",
          glowClass: "shadow-amber-500/20",
        };
      case "rejected":
        return {
          icon: XCircle,
          label: "Rejected",
          bgClass: "bg-red-500/20",
          textClass: "text-red-400",
          borderClass: "border-red-500/40",
          glowClass: "shadow-red-500/20",
        };
      case "expired":
        return {
          icon: AlertCircle,
          label: "Expired",
          bgClass: "bg-gray-500/20",
          textClass: "text-gray-400",
          borderClass: "border-gray-500/40",
          glowClass: "shadow-gray-500/20",
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm font-medium transition-all",
        sizeClasses.container,
        statusConfig.bgClass,
        statusConfig.textClass,
        statusConfig.borderClass,
        "shadow-lg",
        statusConfig.glowClass,
        className
      )}
    >
      <Icon className={sizeClasses.icon} />
      {showLabel && <span>{statusConfig.label}</span>}
    </div>
  );
}