"use client";

import { CheckCircle, XCircle, Clock, Upload, Eye, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  type: "uploaded" | "in-review" | "verified" | "rejected" | "comment";
  title: string;
  description?: string;
  timestamp: string;
  user?: string;
}

interface VerificationTimelineProps {
  events: TimelineEvent[];
}

export function VerificationTimeline({ events }: VerificationTimelineProps) {
  const getEventConfig = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "verified":
        return {
          icon: CheckCircle,
          iconBg: "bg-green-500/20",
          iconColor: "text-green-400",
          lineBg: "bg-green-500/30",
        };
      case "rejected":
        return {
          icon: XCircle,
          iconBg: "bg-red-500/20",
          iconColor: "text-red-400",
          lineBg: "bg-red-500/30",
        };
      case "in-review":
        return {
          icon: Eye,
          iconBg: "bg-blue-500/20",
          iconColor: "text-blue-400",
          lineBg: "bg-blue-500/30",
        };
      case "comment":
        return {
          icon: MessageSquare,
          iconBg: "bg-purple-500/20",
          iconColor: "text-purple-400",
          lineBg: "bg-purple-500/30",
        };
      case "uploaded":
      default:
        return {
          icon: Upload,
          iconBg: "bg-amber-500/20",
          iconColor: "text-amber-400",
          lineBg: "bg-amber-500/30",
        };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full">
      <div className="space-y-0">
        {events.map((event, index) => {
          const config = getEventConfig(event.type);
          const Icon = config.icon;
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} className="relative flex gap-4">
              {/* Timeline Line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-5 top-12 bottom-0 w-0.5",
                    config.lineBg
                  )}
                />
              )}

              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 backdrop-blur-sm",
                    config.iconBg,
                    "border-white/10"
                  )}
                >
                  <Icon className={cn("w-5 h-5", config.iconColor)} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-gray-400 mt-1">
                          {event.description}
                        </p>
                      )}
                      {event.user && (
                        <p className="text-xs text-gray-500 mt-2">
                          by {event.user}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-xs text-gray-400">
                        {formatTimestamp(event.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}