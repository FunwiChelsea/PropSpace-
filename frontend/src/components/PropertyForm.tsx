import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadImages } from "@/lib/api";
import type { Property, PropertyInput } from "@/types";

const propertySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(5000),
  price: z.number().positive("Price must be greater than 0"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  propertyType: z.enum(["Apartment", "House", "Studio"]),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface PropertyFormProps {
  initialData?: Property;
  onSubmit: (data: PropertyInput) => Promise<void>;
  submitLabel?: string;
}

export function PropertyForm({
  initialData,
  onSubmit,
  submitLabel = "Save Property",
}: PropertyFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingUrls, setExistingUrls] = useState<string[]>(initialData?.imageUrls ?? []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImagesRef = useRef(pendingImages);
  pendingImagesRef.current = pendingImages;

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price ?? 1000,
      city: initialData?.location.city || "",
      country: initialData?.location.country || "",
      propertyType: initialData?.propertyType || "Apartment",
    },
  });

  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const newImages: PendingImage[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPendingImages((current) => [...current, ...newImages]);
    event.target.value = "";
  };

  const removePendingImage = (id: string) => {
    setPendingImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image) URL.revokeObjectURL(image.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  };

  const removeExistingUrl = (url: string) => {
    setExistingUrls((current) => current.filter((item) => item !== url));
  };

  const handleSubmit = async (values: PropertyFormValues) => {
    setError(null);

    if (existingUrls.length === 0 && pendingImages.length === 0) {
      setError("At least one property image is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedUrls =
        pendingImages.length > 0
          ? await uploadImages(pendingImages.map((image) => image.file))
          : [];

      await onSubmit({
        title: values.title,
        description: values.description,
        price: values.price,
        location: { city: values.city, country: values.country },
        propertyType: values.propertyType,
        imageUrls: [...existingUrls, ...uploadedUrls],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalImages = existingUrls.length + pendingImages.length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Modern downtown apartment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Describe the property..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="London" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="United Kingdom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Property Images</FormLabel>
            <span className="text-sm text-muted-foreground">{totalImages} selected</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            aria-label="Property images"
            onChange={handleFileSelect}
          />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="mr-2 size-4" />
            Take photo or choose image
          </Button>

          <p className="text-sm text-muted-foreground">
            JPEG, PNG, WebP, or GIF up to 5MB each. You can add multiple images.
          </p>

          {(existingUrls.length > 0 || pendingImages.length > 0) && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {existingUrls.map((url) => (
                <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-lg border">
                  <img src={url} alt="Property" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingUrl(url)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              {pendingImages.map((image) => (
                <div key={image.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg border">
                  <img src={image.previewUrl} alt="New property" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePendingImage(image.id)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
