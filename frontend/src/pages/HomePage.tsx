import { useCallback, useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import type { Property, PropertyFilters } from "@/types";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PropertyCard } from "@/components/PropertyCard";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";

export function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<PropertyFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async (signal: AbortSignal, activeFilters: PropertyFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeFilters.city) params.set("city", activeFilters.city);
      if (activeFilters.minPrice !== undefined) params.set("minPrice", String(activeFilters.minPrice));
      if (activeFilters.maxPrice !== undefined) params.set("maxPrice", String(activeFilters.maxPrice));

      const query = params.toString();
      const { data } = await api.get<Property[]>(`/properties${query ? `?${query}` : ""}`, {
        signal,
      });
      setProperties(data);
    } catch (err) {
      if (signal.aborted) return;
      setError(getErrorMessage(err));
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchProperties(controller.signal, appliedFilters);
    return () => controller.abort();
  }, [appliedFilters, fetchProperties]);

  const handleApply = () => setAppliedFilters({ ...filters });
  const handleClear = () => {
    setFilters({});
    setAppliedFilters({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Find Your Next Property</h1>
        <p className="mt-2 text-muted-foreground">
          Browse properties for rent or sale across cities worldwide.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onApply={handleApply}
          onClear={handleClear}
        />

        <div>
          {loading && <LoadingState message="Loading properties..." />}
          {!loading && error && (
            <ErrorState
              message={error}
              onRetry={() => void fetchProperties(new AbortController().signal, appliedFilters)}
            />
          )}
          {!loading && !error && properties.length === 0 && (
            <EmptyState
              title="No properties found"
              description="Try adjusting your filters or check back later for new listings."
            />
          )}
          {!loading && !error && properties.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
