"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ShareExpiryProps {
  expiryDate: Date | null;
  onExpiryChange: (date: Date | null) => void;
}

export function ShareExpiry({ expiryDate, onExpiryChange }: ShareExpiryProps) {
  const [quickOption, setQuickOption] = useState<string>("custom");

  const handleQuickOption = (option: string) => {
    setQuickOption(option);
    const now = new Date();

    switch (option) {
      case "1hour":
        onExpiryChange(new Date(now.getTime() + 60 * 60 * 1000));
        break;
      case "1day":
        onExpiryChange(new Date(now.getTime() + 24 * 60 * 60 * 1000));
        break;
      case "7days":
        onExpiryChange(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));
        break;
      case "30days":
        onExpiryChange(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
        break;
      case "never":
        onExpiryChange(null);
        break;
      case "custom":
        // Do nothing, let user pick from calendar
        break;
    }
  };

  const handleClearExpiry = () => {
    onExpiryChange(null);
    setQuickOption("never");
  };

  return (
    <Card className="p-4 bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Link Expiration</h3>
        </div>

        {/* Quick Options */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Quick Options</label>
          <Select value={quickOption} onValueChange={handleQuickOption}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              <SelectItem value="1hour">1 Hour</SelectItem>
              <SelectItem value="1day">1 Day</SelectItem>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="never">Never Expires</SelectItem>
              <SelectItem value="custom">Custom Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Picker */}
        {quickOption === "custom" && (
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Choose Expiry Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    "bg-white/5 border-white/10 text-white hover:bg-white/10",
                    !expiryDate && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? (
                    format(expiryDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-white/10">
                <Calendar
                  mode="single"
                  selected={expiryDate || undefined}
                  onSelect={(date) => onExpiryChange(date || null)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Current Expiry Display */}
        {expiryDate && (
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300 font-medium">
                  Link expires on:
                </p>
                <p className="text-white font-semibold mt-1">
                  {format(expiryDate, "PPP 'at' p")}
                </p>
              </div>
              <Button
                onClick={handleClearExpiry}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {!expiryDate && quickOption === "never" && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-300">
              This link will never expire
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}