"use client";

import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareLinkCopyProps {
  url: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function ShareLinkCopy({
  url,
  label = "Copy Link",
  variant = "outline",
  size = "md",
  showIcon = true,
  className,
}: ShareLinkCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 px-3 text-xs";
      case "lg":
        return "h-12 px-6 text-base";
      case "md":
      default:
        return "h-10 px-4 text-sm";
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      className={cn(
        getSizeClasses(),
        copied
          ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
          : variant === "outline"
          ? "border-white/10 hover:bg-purple-400/20 hover:border-purple-400/30"
          : "",
        className
      )}
    >
      {showIcon && (
        <>
          {copied ? (
            <Check className={cn("mr-2", size === "sm" ? "w-3 h-3" : "w-4 h-4")} />
          ) : (
            <Link2 className={cn("mr-2", size === "sm" ? "w-3 h-3" : "w-4 h-4")} />
          )}
        </>
      )}
      {copied ? "Copied!" : label}
    </Button>
  );
}