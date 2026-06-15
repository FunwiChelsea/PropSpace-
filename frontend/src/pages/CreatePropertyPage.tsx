import { useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "@/lib/api";
import type { PropertyInput } from "@/types";
import { PropertyForm } from "@/components/PropertyForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CreatePropertyPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PropertyInput) => {
    try {
      await api.post("/properties", data);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Property Listing</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <PropertyForm onSubmit={handleSubmit} submitLabel="Create Listing" />
        </CardContent>
      </Card>
    </div>
  );
}
