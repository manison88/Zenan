"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type DatePreset, type DateRange, getPresetRange, DATE_PRESET_LABELS } from "@/lib/date-utils";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presets: DatePreset[] = [
  "this-week",
  "last-week",
  "this-month",
  "last-month",
  "this-year",
  "last-year",
];

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<DatePreset>("this-month");
  const [showCustom, setShowCustom] = useState(false);

  function handlePreset(preset: DatePreset) {
    setActivePreset(preset);
    setShowCustom(false);
    onChange(getPresetRange(preset));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            variant={activePreset === preset && !showCustom ? "default" : "outline"}
            size="sm"
            onClick={() => handlePreset(preset)}
          >
            {DATE_PRESET_LABELS[preset]}
          </Button>
        ))}
        <Button
          variant={showCustom ? "default" : "outline"}
          size="sm"
          onClick={() => setShowCustom(true)}
        >
          Custom
        </Button>
      </div>

      {showCustom && (
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={value.from}
              onChange={(e) => {
                setActivePreset("custom");
                onChange({ ...value, from: e.target.value });
              }}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={value.to}
              onChange={(e) => {
                setActivePreset("custom");
                onChange({ ...value, to: e.target.value });
              }}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
