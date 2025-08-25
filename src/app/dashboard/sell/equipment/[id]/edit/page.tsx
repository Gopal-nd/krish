"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { EquipmentCondition } from "@prisma/client";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

interface FormData {
  title: string;
  description: string;
  priceCents: string;
  category: string;
  condition: EquipmentCondition;
  location: string;
  images: string[];
}

const EQUIPMENT_CATEGORIES = [
  "Tractor",
  "Harvester",
  "Tiller",
  "Irrigation System",
  "Seeder",
  "Sprayer",
  "Plow",
  "Cultivator",
  "Other"
];

const CONDITION_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "USED", label: "Used" },
  { value: "REFURBISHED", label: "Refurbished" }
];

export default function EditEquipmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [equipmentId, setEquipmentId] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    priceCents: "",
    category: "",
    condition: "NEW" as EquipmentCondition,
    location: "",
    images: []
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [originalEquipment, setOriginalEquipment] = useState<any>(null);

  useEffect(() => {
    if (params?.id) {
      setEquipmentId(params.id as string);
      fetchEquipment(params.id as string);
    }
  }, [params?.id]);

  const fetchEquipment = async (id: string) => {
    try {
      const response = await fetch(`/api/equipment-by-id/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Equipment Not Found",
            description: "The equipment you're trying to edit doesn't exist",
            variant: "destructive",
          });
          router.push('/sell/equipment');
          return;
        }
        throw new Error("Failed to fetch equipment");
      }

      const equipment = await response.json();

      // Check if the current user owns this equipment
      if (equipment.sellerId !== (session?.user as any)?.id) {
        toast({
          title: "Access Denied",
          description: "You can only edit your own equipment listings",
          variant: "destructive",
        });
        router.push('/sell/equipment');
        return;
      }

      setOriginalEquipment(equipment);
      setFormData({
        title: equipment.title || "",
        description: equipment.description || "",
        priceCents: (equipment.priceCents / 100).toString(),
        category: equipment.category || "",
        condition: equipment.condition || "NEW",
        location: equipment.location || "",
        images: equipment.images || []
      });
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Error",
        description: "Failed to load equipment details",
        variant: "destructive",
      });
      router.push('/sell/equipment');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | string[] | EquipmentCondition) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleUploadComplete = (res: any[]) => {
    const uploadedUrls = res.map(file => file.url);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));

    toast({
      title: "Success",
      description: `${res.length} image(s) uploaded successfully`,
    });
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    toast({
      title: "Error",
      description: "Failed to upload images. Please try again.",
      variant: "destructive",
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.priceCents || parseFloat(formData.priceCents) <= 0) {
      newErrors.priceCents = "Valid price is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.images.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image of your equipment",
        variant: "destructive",
      });
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priceCents: Math.round(parseFloat(formData.priceCents) * 100), // Convert to cents
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim(),
        images: formData.images
      };

      const response = await fetch(`/api/equipment-by-id/${equipmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your equipment has been updated successfully",
        });

        // Redirect to equipment management page
        router.push('/sell/equipment');
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update equipment listing",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || fetching) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8  rounded animate-pulse" />
            <div className="h-64  rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!originalEquipment) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16  mx-auto mb-4" />
            <h2 className="text-2xl font-bold  mb-2">Equipment Not Found</h2>
            <p className="">The equipment you're looking for doesn't exist or you don't have permission to edit it.</p>
            <Link href="/dashboard/sell/equipment">
              <Button>Back to Equipment</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="FARMER">
      <div className="min-h-screen ">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/sell/equipment">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Equipment
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold ">
                Edit Equipment
              </h1>
              <p className="">
                Update your equipment listing details
              </p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Equipment Title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={(value) => handleInputChange("title", value)}
                    placeholder="e.g., John Deere 5055E Tractor"
                    required
                    error={errors.title}
                    hint="Choose a descriptive title that includes make, model, and key features"
                  />

                  <FormField
                    label="Category"
                    name="category"
                    type="select"
                    value={formData.category}
                    onChange={(value) => handleInputChange("category", value)}
                    options={EQUIPMENT_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                    required
                    error={errors.category}
                    hint="Select the most appropriate category for your equipment"
                  />
                </div>

                <FormField
                  label="Description"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={(value) => handleInputChange("description", value)}
                  placeholder="Provide detailed information about your equipment including specifications, condition, usage hours, maintenance history, etc."
                  required
                  error={errors.description}
                  hint="Include as much detail as possible to attract serious buyers"
                  rows={4}
                />

                {/* Price and Condition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Price (₹)"
                    name="priceCents"
                    type="number"
                    value={formData.priceCents}
                    onChange={(value) => handleInputChange("priceCents", value)}
                    placeholder="Enter price in rupees"
                    required
                    error={errors.priceCents}
                    hint="Enter the full price in Indian Rupees"
                  />

                  <FormField
                    label="Condition"
                    name="condition"
                    type="select"
                    value={formData.condition}
                    onChange={(value) => handleInputChange("condition", value as EquipmentCondition)}
                    options={CONDITION_OPTIONS}
                    required
                    hint="Select the current condition of your equipment"
                  />
                </div>

                <FormField
                  label="Location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={(value) => handleInputChange("location", value)}
                  placeholder="e.g., Punjab, India or New Delhi, Delhi"
                  required
                  error={errors.location}
                  hint="Specify the city and state where the equipment is located"
                />

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium  mb-2">
                    Equipment Images <span className="text-red-500">*</span>
                  </label>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12  mx-auto mb-4" />
                      <p className="text-sm  mb-4">
                        Upload additional images of your equipment (max 5 images, 4MB each)
                      </p>

                      <UploadButton<OurFileRouter, "equipmentImage">
                        endpoint="equipmentImage"
                        onClientUploadComplete={handleUploadComplete}
                        onUploadError={handleUploadError}
                        appearance={{
                          button: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md",
                          allowedContent: "hidden"
                        }}
                        content={{
                          button: "Choose Images",
                          allowedContent: "Images up to 4MB"
                        }}
                      />
                    </div>

                    {/* Image Preview */}
                    {formData.images.length > 0 && (
                      <div className="mt-4">
                          <p className="text-sm  mb-2">
                          {formData.images.length} image(s) selected
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Equipment ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                onClick={() => removeImage(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-6">
                  <Link href="/dashboard/sell/equipment">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating Listing...
                      </>
                    ) : (
                      "Update Equipment Listing"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
