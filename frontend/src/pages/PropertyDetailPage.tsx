import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import type { Property } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<Property>(`/properties/${id}`, {
          signal: controller.signal,
        });
        setProperty(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchProperty();
    return () => controller.abort();
  }, [id]);

  if (loading) return <LoadingState message="Loading property..." />;
  if (error) return <ErrorState message={error} />;
  if (!property) return <ErrorState message="Property not found" />;

  const author =
    typeof property.author === "object"
      ? property.author.displayName || property.author.username
      : undefined;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to listings
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {property.imageUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt={property.title}
              className="w-full rounded-lg object-cover"
            />
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge>{property.propertyType}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <p className="mt-2 text-3xl font-bold text-primary">{formatPrice(property.price)}</p>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span>
              {property.location.city}, {property.location.country}
            </span>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">{property.description}</p>
          </div>

          {author && (
            <div>
              <h2 className="mb-1 text-lg font-semibold">Listed by</h2>
              <p className="text-muted-foreground">{author}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
