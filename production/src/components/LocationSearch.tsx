import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MapPin, Loader2, X } from 'lucide-react';
import { searchLocation } from '../api/geocodingService';
import { Location } from '../types';
import { cn } from './ui/utils';

interface LocationSearchProps {
  onLocationSelect: (location: Location | null) => void;
  initialLocation?: Location | string;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ onLocationSelect, initialLocation, placeholder = "Rechercher une adresse, une ville...", className }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize state from props
  useEffect(() => {
    if (initialLocation) {
      if (typeof initialLocation === 'string') {
        setQuery(initialLocation);
      } else {
        setSelectedLocation(initialLocation);
        setQuery(initialLocation.label);
      }
    }
  }, [initialLocation]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3 && query !== selectedLocation?.label) {
        setIsLoading(true);
        const locations = await searchLocation(query);
        setResults(locations);
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, selectedLocation]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (location: Location) => {
    setSelectedLocation(location);
    setQuery(location.label);
    setIsOpen(false);
    onLocationSelect(location);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedLocation(null);
    setResults([]);
    onLocationSelect(null);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedLocation && e.target.value !== selectedLocation.label) {
              setSelectedLocation(null); // Reset selection if user types
              onLocationSelect(null);
            }
          }}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={handleClear}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md max-h-60 overflow-auto">
          <ul className="p-1">
            {results.map((location, index) => (
              <li
                key={`${location.label}-${index}`}
                className="flex flex-col px-3 py-2 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSelect(location)}
              >
                <span className="font-medium">{location.label}</span>
                {location.context && (
                  <span className="text-xs text-muted-foreground">{location.context}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
