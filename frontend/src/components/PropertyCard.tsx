import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function PropertyCard({ property, showActions, onEdit, onDelete }: PropertyCardProps) {
  const imageUrl = property.imageUrls[0] || "https://placehold.co/600x400?text=No+Image";

  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-lg">
            <Link to={`/properties/${property.id}`} className="hover:underline">
              {property.title}
            </Link>
          </CardTitle>
          <Badge variant="secondary">{property.propertyType}</Badge>
        </div>
        <p className="text-xl font-bold text-primary">{formatPrice(property.price)}</p>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">{property.description}</p>
        <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            {property.location.city}, {property.location.country}
          </span>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(property.id)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(property.id)}
            className="text-sm font-medium text-destructive hover:underline"
          >
            Delete
          </button>
        </CardFooter>
      )}
    </Card>
  );
}
