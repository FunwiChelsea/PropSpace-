import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { api, getErrorMessage, uploadImages } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || user?.username || "",
      phone: user?.phone || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Image size must be less than 5MB");
      return;
    }

    try {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image
      setIsUploading(true);
      const urls = await uploadImages([file]);
      profileForm.setValue("avatarUrl", urls[0]);
      setProfileError(null);
    } catch (err) {
      setProfileError(getErrorMessage(err));
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setProfileSuccess(null);
    setProfileError(null);
    try {
      await api.put("/users/me", {
        displayName: values.displayName,
        phone: values.phone || undefined,
        avatarUrl: values.avatarUrl || "",
      });
      await refreshUser();
      setProfileSuccess("Profile updated successfully");
      setAvatarPreview(null);
    } catch (err) {
      setProfileError(getErrorMessage(err));
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setPasswordSuccess(null);
    setPasswordError(null);
    try {
      await api.put("/users/me/password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      setPasswordSuccess("Password updated successfully");
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    }
  };

  const initials = user?.displayName?.[0] || user?.username?.[0] || "U";

  return (
    <div className="container mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.avatarUrl} alt={user?.username} />
          <AvatarFallback className="text-lg">
            {initials.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <FormField
                control={profileForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 555 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={
                            avatarPreview ||
                            profileForm.watch("avatarUrl") ||
                            user?.avatarUrl
                          }
                          alt="Avatar preview"
                        />
                        <AvatarFallback className="text-xl">
                          {initials.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                        </p>
                        <label className="cursor-pointer inline-flex items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            disabled={isUploading}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isUploading}
                            onClick={(e) => {
                              e.preventDefault();
                              (
                                e.currentTarget.parentElement?.querySelector(
                                  'input[type="file"]',
                                ) as HTMLInputElement
                              )?.click();
                            }}
                          >
                            {isUploading ? "Uploading..." : "Choose Image"}
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
              {profileSuccess && (
                <Alert>
                  <AlertDescription>{profileSuccess}</AlertDescription>
                </Alert>
              )}
              {profileError && (
                <Alert variant="destructive">
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                disabled={profileForm.formState.isSubmitting}
              >
                {profileForm.formState.isSubmitting
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {passwordSuccess && (
                <Alert>
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}
              {passwordError && (
                <Alert variant="destructive">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting
                  ? "Updating..."
                  : "Update Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
