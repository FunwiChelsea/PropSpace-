import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getErrorMessage } from "@/lib/api";
import type { Property, PropertyInput } from "@/types";
import { PropertyForm } from "@/components/PropertyForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleSubmit = async (data: PropertyInput) => {
    if (!id) return;
    setSubmitError(null);
    try {
      await api.put(`/properties/${id}`, data);
      navigate("/dashboard");
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      throw err;
    }
  };

  if (loading) return <LoadingState message="Loading property..." />;
  if (error) return <ErrorState message={error} />;
  if (!property) return <ErrorState message="Property not found" />;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Property Listing</CardTitle>
        </CardHeader>
        <CardContent>
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <PropertyForm
            initialData={property}
            onSubmit={handleSubmit}
            submitLabel="Update Listing"
          />
        </CardContent>
      </Card>
    </div>
  );
}
