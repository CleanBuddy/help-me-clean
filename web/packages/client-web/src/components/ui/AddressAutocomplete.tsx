import { useRef, useEffect } from 'react';
import { cn } from '@helpmeclean/shared';
import { useGoogleMapsLoader } from '@/hooks/useGoogleMapsLoader';

export interface ParsedAddress {
  streetAddress: string;
  city: string;
  county: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: ParsedAddress) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

function parsePlace(place: google.maps.places.PlaceResult): ParsedAddress {
  const components = place.address_components ?? [];
  const get = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name ?? '';

  const streetNumber = get('street_number');
  const route = get('route');
  const streetAddress = streetNumber ? `${route} ${streetNumber}` : route;

  return {
    streetAddress,
    city: get('locality') || get('administrative_area_level_2'),
    county: get('administrative_area_level_1'),
    postalCode: get('postal_code'),
    latitude: place.geometry?.location?.lat() ?? null,
    longitude: place.geometry?.location?.lng() ?? null,
  };
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  label,
  placeholder = 'Cauta adresa...',
  error,
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const callbacksRef = useRef({ onChange, onAddressSelect });
  const { isLoaded } = useGoogleMapsLoader();

  // Keep callbacks ref up to date so the listener never uses stale closures.
  callbacksRef.current = { onChange, onAddressSelect };

  // Sync external value changes to the uncontrolled input (e.g. when editing
  // an existing address or when the parent resets the form).
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ro' },
      fields: ['address_components', 'geometry'],
      types: ['address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place?.address_components) return;

      const parsed = parsePlace(place);

      // Overwrite whatever Google put in the input with just the street address.
      if (inputRef.current) {
        inputRef.current.value = parsed.streetAddress;
      }

      callbacksRef.current.onChange(parsed.streetAddress);
      callbacksRef.current.onAddressSelect(parsed);
    });

    autocompleteRef.current = autocomplete;

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [isLoaded]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          error ? 'border-danger' : 'border-gray-300',
          className,
        )}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
