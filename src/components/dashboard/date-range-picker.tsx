"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  type DatePreset,
  type DateRange,
  getPresetRange,
  DATE_PRESET_LABELS,
} from "@/lib/date-utils";

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
      {/* Mobile: compact select + custom toggle */}
      <div className="flex gap-2 sm:hidden">
        <Select
          value={showCustom ? "custom" : activePreset}
          onChange={(e) => {
            if (e.target.value === "custom") {
              setShowCustom(true);
              setActivePreset("custom");
            } else {
              handlePreset(e.target.value as DatePreset);
            }
          }}
          className="flex-1"
        >
          {presets.map((preset) => (
            <option key={preset} value={preset}>
              {DATE_PRESET_LABELS[preset]}
            </option>
          ))}
          <option value="custom">Custom Range</option>
        </Select>
      </div>

      {/* Desktop: chip row */}
      <div className="hidden sm:flex sm:flex-wrap sm:gap-2">
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={value.from}
              onChange={(e) => {
                setActivePreset("custom");
                onChange({ ...value, from: e.target.value });
              }}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={value.to}
              onChange={(e) => {
                setActivePreset("custom");
                onChange({ ...value, to: e.target.value });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
