"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface LocationSuggestion {
  city: string;
  state: string;
}

export function LocationInput({ value, onChange, placeholder, className }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/locations?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
              onClick={() => {
                onChange(`${s.city}, ${s.state}`);
                setShowSuggestions(false);
              }}
            >
              {s.city}, {s.state}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
