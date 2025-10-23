/// <reference types="google.maps" />

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  error?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  label,
  error
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!window.google?.maps?.places || !inputRef.current) {
      console.error('Google Maps JavaScript API not loaded');
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'za' },
      fields: ['formatted_address', 'geometry', 'name', 'address_components'],
      types: ['address']
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place?.formatted_address) {
        setIsLoading(true);
        onChange(place.formatted_address);
        setTimeout(() => setIsLoading(false), 300);
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (listener) google.maps.event.removeListener(listener);
    };
  }, [onChange]);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full text-gray-700 pl-10 pr-10 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
            error ? 'border-red-500' : 'border-gray-200'
          }`}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
          </div>
        )}

        {value && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
          {error}
        </p>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Start typing to see address suggestions
      </p>
    </div>
  );
}
