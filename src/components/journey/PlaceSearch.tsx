"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlaceResult } from "@/app/api/places/search/route";

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onSelect: (place: PlaceResult) => void;
}

export function PlaceSearch({ label, placeholder, value, onSelect }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery(value);
    }, 0);
    return () => clearTimeout(handle);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) { setResults([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(val)}`);
        const data = await res.json() as { results: PlaceResult[] };
        setResults(data.results);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(place: PlaceResult) {
    setQuery(place.iata ? `${place.name} (${place.iata})` : place.name);
    setOpen(false);
    onSelect(place);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-xs font-medium text-white/50 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-electric-500/50 focus:bg-white/10 focus:ring-1 focus:ring-electric-500/30"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="size-4 rounded-full border-2 border-electric-400 border-t-transparent animate-spin block" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-navy-800 shadow-2xl"
          >
            {results.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(place)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/8"
                >
                  <span className="text-xl">{getFlagEmoji(place.countryCode)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {place.name}
                      {place.iata && (
                        <span className="ml-2 rounded-md bg-electric-500/20 px-1.5 py-0.5 text-xs text-electric-400">
                          {place.iata}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/40 truncate">{place.country}</p>
                  </div>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}
